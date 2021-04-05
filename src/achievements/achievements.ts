import {URL_BASE} from '../../secret';
import {
	generateToken,
	getGroupAchievements,
	getUserAchievements,
	getUserPoles,
	getUserScore,
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
	totalScore: number;
}

export type AchievementContext = Pick<OnPoleParams, 'poles' | 'totalScore'>;

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
	/**
	 * Should return a number between 0 and 1 indicating the completion percentage.
	 * Should only be present for achievements for which a completion percentage makes sense.
	 */
	completionPercentage?(context: AchievementContext): number;
}

export const ALL_ACHIEVEMENTS = [...NORMAL_ACHIEVEMENTS];
const achievements = new Map(ALL_ACHIEVEMENTS.map(achievement => [achievement.id, achievement]));
if (ALL_ACHIEVEMENTS.length !== achievements.size) {
	console.error('Error: duplicate achievement ID.');
	process.exit(1);
}

export function createAchievementContext(user: User, group: Group): AchievementContext {
	return {
		poles: getUserPoles(user, group),
		totalScore: getUserScore(user, group).score,
	};
}

export async function onPole(user: User, group: Group, savePoleResult: SavePoleResult, time: Date) {
	const userAchievements = new Set(
		getUserAchievements(user, group).map(({achievementId}) => achievementId),
	);
	const obtainedAchievements: Achievement[] = [];
	for (const achievement of achievements.values()) {
		if (userAchievements.has(achievement.id)) {
			continue;
		}
		const obtained = achievement.onPole?.({
			...createAchievementContext(user, group),
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
		bot().sendMessage(group, message);
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
		bot().sendMessage(group, message);
	}
}

export async function listUserAchievements(user: User, group: Group) {
	const token = await generateToken(user, group);
	const url = `${URL_BASE}/${token}`;
	bot().sendMessage(group, `<a href="${url}">Logros de ${await getUserName(group, user)}</a>`, {
		parse_mode: 'HTML',
	});
}
