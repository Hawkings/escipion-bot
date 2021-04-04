import 'react';
import {AchievementId, ALL_ACHIEVEMENTS} from '../src/achievements/achievements';
import {GetServerSideProps} from 'next';
import {getTokenInfo, getUserAchievements} from '../src/db/db';
import Main from '../components/main';
import Achievement from '../components/achievement';

export default function Post(props: Props) {
	if (!props.valid) {
		return <h1>404 not found</h1>;
	}

	return (
		<Main>
			{props.achievements.map(achievement => (
				<Achievement achievement={achievement} key={achievement.id} />
			))}
		</Main>
	);
}

export interface AchievementProp {
	id: AchievementId;
	name: string;
	emoji: string;
	description: string;
	obtainedDate: number | null;
}
type Props =
	| {
			valid: false;
	  }
	| {
			valid: true;
			achievements: Array<AchievementProp>;
	  };
export const getServerSideProps: GetServerSideProps<Props> = async context => {
	const token = context.query.token as string;
	const userInfo = getTokenInfo(token);
	if (!userInfo) {
		return {
			props: {
				valid: false,
			},
		};
	}
	const obtainedAchievements = new Map(
		getUserAchievements(userInfo.user, userInfo.group).map(({achievementId, timestamp}) => [
			achievementId,
			timestamp,
		]),
	);
	const achievements = ALL_ACHIEVEMENTS.map(achievement => ({
		id: achievement.id,
		name: achievement.name,
		emoji: achievement.emoji,
		description: achievement.description,
		obtainedDate: obtainedAchievements.get(achievement.id) ?? null,
	})).sort((a, b) => {
		if (a.obtainedDate) {
			if (b.obtainedDate) {
				return a.obtainedDate - b.obtainedDate;
			} else {
				return -1;
			}
		} else if (b.obtainedDate) {
			return 1;
		} else {
			return a.id - b.id;
		}
	});
	return {
		props: {
			valid: true,
			achievements,
		},
	};
};
