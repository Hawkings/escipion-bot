import 'react';
import {
	AchievementId,
	ALL_ACHIEVEMENTS,
	createAchievementContext,
} from '../src/achievements/achievements';
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
	completionPct?: number | null;
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
	const achievements = ALL_ACHIEVEMENTS.map(achievement => {
		const obtainedDate = obtainedAchievements.get(achievement.id) ?? null;
		let completionPct =
			achievement.completionPercentage?.(createAchievementContext(userInfo.user, userInfo.group)) ??
			null;
		if (completionPct !== null) {
			completionPct = completionPct * 100;
		}
		if (obtainedDate) {
			completionPct = null;
		}
		return {
			id: achievement.id,
			name: achievement.name,
			emoji: achievement.emoji,
			description: achievement.description,
			obtainedDate,
			completionPct,
		};
	}).sort((a, b) => {
		if (a.obtainedDate) {
			if (b.obtainedDate) {
				return a.obtainedDate - b.obtainedDate;
			} else {
				return -1;
			}
		} else if (b.obtainedDate) {
			return 1;
		} else if (a.completionPct) {
			if (b.completionPct) {
				if (a.completionPct === b.completionPct) {
					return a.id - b.id;
				} else {
					return b.completionPct - a.completionPct;
				}
			} else {
				return -1;
			}
		} else if (b.completionPct) {
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
