import 'react';
import {ALL_ACHIEVEMENTS} from '../src/achievements/achievements';
import {GetServerSideProps} from 'next';
import {getTokenInfo, getUserAchievements} from '../src/db/db';

export default function Post(props: Props) {
	if (!props.valid) {
		return <h1>404 not found</h1>;
	}

	return props.achievements.map(({name, emoji, description, obtainedDate}) => (
		<div className="bg-blue-700 text-blue-100">
			{emoji} {name}
			<br />
			{description}
			{obtainedDate ? (
				<>
					<br /> Obtenido el {new Date(obtainedDate).toString()}
				</>
			) : null}
		</div>
	));
}

type Props =
	| {
			valid: false;
	  }
	| {
			valid: true;
			achievements: Array<{
				name: string;
				emoji: string;
				description: string;
				obtainedDate: number | null;
			}>;
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
			return a.name.localeCompare(b.name);
		}
	});
	return {
		props: {
			valid: true,
			achievements,
		},
	};
};
