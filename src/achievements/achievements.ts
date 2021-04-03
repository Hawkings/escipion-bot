import {
	getGroupAchievements,
	getUserAchievements,
	getUserPoles,
	saveAchievement,
	SavePoleResult,
} from '../db/db';
import {bot, getUserName} from '../telegram';
import {Group, PoleType, User} from '../types';
import {NORMAL_ACHIEVEMENTS} from './normal_achievements';

export type AchievementId = number & {achievementId: never};

export interface OnPoleParams {
	poles: Map<PoleType, number>;
	lastPoleSaveResult: SavePoleResult;
	lastPoleTime: Date;
}

export interface Achievement {
	id: AchievementId;
	name: string;
	emoji: string;
	description: string;
	/**
	 * Function called on each pole attempt by an user that does not have the achievement yet.
	 * Should return true if the player has obtained the achievement after the pole.
	 */
	onPole?(params: OnPoleParams): boolean;
}

const allAchievements = [...NORMAL_ACHIEVEMENTS];
const achievements = new Map(allAchievements.map(achievement => [achievement.id, achievement]));
if (allAchievements.length !== achievements.size) {
	console.error('Error: duplicate achievement ID.');
	process.exit(1);
}

export async function onPole(user: User, group: Group, savePoleResult: SavePoleResult, time: Date) {
	const userAchievements = new Set(
		getUserAchievements(user, group).map(({achievementId}) => achievementId),
	);
	const userPoles = getUserPoles(user, group);
	const obtainedAchievements: Achievement[] = [];
	for (const achievement of achievements.values()) {
		if (userAchievements.has(achievement.id)) {
			continue;
		}
		const obtained = achievement.onPole?.({
			poles: userPoles,
			lastPoleSaveResult: savePoleResult,
			lastPoleTime: time,
		});
		if (obtained) {
			saveAchievement(user, group, achievement.id);
			obtainedAchievements.push(achievement);
		}
	}
	if (obtainedAchievements.length > 0) {
		let message = '';
		for (const {name, emoji} of obtainedAchievements) {
			message += `¡${await getUserName(group, user)} ha conseguido el logro ${name} ${emoji}!\n`;
		}
		bot.sendMessage(group, message);
	}
}

export async function listAchievements(group: Group) {
	const groupAchievements: Map<User, Set<AchievementId>> = new Map();
	for (const {user, achievementId} of getGroupAchievements(group)) {
		if (!groupAchievements.has(user)) {
			groupAchievements.set(user, new Set());
		}
		groupAchievements.get(user)!.add(achievementId);
	}
	let message = '';
	for (const [user, achievementIds] of groupAchievements.entries()) {
		const emojis = Array.from(achievementIds.values())
			.map(achievementId => achievements.get(achievementId)?.emoji)
			.filter(Boolean)
			.join('');
		message += `${await getUserName(group, user)}: ${emojis}\n`;
	}
	if (message) {
		bot.sendMessage(group, message);
	}
}
