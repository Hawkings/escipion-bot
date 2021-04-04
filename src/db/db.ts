import sqlite from 'better-sqlite3';
import {hash} from '../../secret';
import {AchievementId} from '../achievements/achievements';
import {Group, PoleType, User, ValidPoleType} from '../types';
import {randomBytes} from 'crypto';
import {
	CreateTokenParams,
	CREATE_ACHIEVEMENTS_QUERY,
	CREATE_POLES_QUERY,
	CREATE_SCORES_QUERY,
	CREATE_TOKEN_QUERY,
	CREATE_WEB_TOKENS_QUERY,
	DB_FILE_NAME,
	GetGroupAchievementsParams,
	GetGroupAchievementsResult,
	GetTokenInfoParams,
	GetTokenInfoResult,
	GetTokenParams,
	GetTokenResult,
	GetUserAchievementsParams,
	GetUserAchievementsResult,
	GetUserPolesParams,
	GetUserPolesResult,
	GetUserPoleTimesParams,
	GetUserPoleTimesResult,
	GET_GROUP_ACHIEVEMENTS_QUERY,
	GET_TOKEN_INFO_QUERY,
	GET_TOKEN_QUERY,
	GET_USER_ACHIEVEMENTS_QUERY,
	GET_USER_POLES_QUERY,
	GET_USER_POLE_TIMES_QUERY,
	HasPoledParams,
	HasPoledResult,
	HAS_POLED_QUERY,
	InsertPoleParams,
	INSERT_ACHIEVEMENT,
	INSERT_POLE_QUERY,
	INSERT_POLE_VALUES_QUERY,
	RankingParams,
	RankingResult,
	RANKING_QUERY,
	SaveAchievementParams,
	UserHasAchievementParams,
	UserHasAchievementResult,
	USER_HAS_ACHIEVEMENT_QUERY,
	WhichPoleParams,
	WhichPoleResult,
	WHICH_POLE_QUERY,
} from './constants';

export enum SavePoleStatus {
	ERROR,
	WRONG_TIME,
	REPEATED,
	NO_POLES_LEFT,
	SUCCESS,
}

export type UnsuccessfulSavePoleStatus = Exclude<SavePoleStatus, SavePoleStatus.SUCCESS>;

export type SavePoleResult =
	| {
			status: UnsuccessfulSavePoleStatus;
	  }
	| {
			status: SavePoleStatus.SUCCESS;
			poleType: ValidPoleType;
	  };

const poleTimes: ReadonlyMap<number, ValidPoleType[]> = new Map([
	[0, [PoleType.NORMAL_GOLD, PoleType.NORMAL_SILVER, PoleType.NORMAL_BRONZE]],
	[23, [PoleType.RUSSIAN_GOLD, PoleType.RUSSIAN_SILVER, PoleType.RUSSIAN_BRONZE]],
	[12, [PoleType.ANDALUSIAN_GOLD, PoleType.ANDALUSIAN_SILVER, PoleType.ANDALUSIAN_BRONZE]],
]);
const secretPoles = [PoleType.SECRET_GOLD, PoleType.SECRET_SILVER, PoleType.SECRET_BRONZE] as const;

const db = sqlite(DB_FILE_NAME);
db.exec(CREATE_SCORES_QUERY);
db.exec(INSERT_POLE_VALUES_QUERY);
db.exec(CREATE_POLES_QUERY);
db.exec(CREATE_ACHIEVEMENTS_QUERY);
db.exec(CREATE_WEB_TOKENS_QUERY);

const insertStmt = db.prepare<InsertPoleParams, void>(INSERT_POLE_QUERY);
const rankingStmt = db.prepare<RankingParams, RankingResult>(RANKING_QUERY);
const hasPoledStmt = db.prepare<HasPoledParams, HasPoledResult>(HAS_POLED_QUERY);
const whichPoleStmt = db.prepare<WhichPoleParams, WhichPoleResult>(WHICH_POLE_QUERY);
const userHasAchievementStmt = db.prepare<UserHasAchievementParams, UserHasAchievementResult>(
	USER_HAS_ACHIEVEMENT_QUERY,
);
const getUserAchievementsStmt = db.prepare<GetUserAchievementsParams, GetUserAchievementsResult>(
	GET_USER_ACHIEVEMENTS_QUERY,
);
const getGroupAchievementsStmt = db.prepare<GetGroupAchievementsParams, GetGroupAchievementsResult>(
	GET_GROUP_ACHIEVEMENTS_QUERY,
);
const saveAchievementStmt = db.prepare<SaveAchievementParams, void>(INSERT_ACHIEVEMENT);
const getUserPolesStmt = db.prepare<GetUserPolesParams, GetUserPolesResult>(GET_USER_POLES_QUERY);
const getUserPoleTimesStmt = db.prepare<GetUserPoleTimesParams, GetUserPoleTimesResult>(
	GET_USER_POLE_TIMES_QUERY,
);
const getTokenInfoStmt = db.prepare<GetTokenInfoParams, GetTokenInfoResult>(GET_TOKEN_INFO_QUERY);
const createTokenStmt = db.prepare<CreateTokenParams, void>(CREATE_TOKEN_QUERY);
const getTokenByUserStmt = db.prepare<GetTokenParams, GetTokenResult>(GET_TOKEN_QUERY);

export function maybeSavePole(user: User, group: Group, time: Date): SavePoleResult {
	const now = time;
	const hour = now.getHours();
	const dayStart = truncateToDay(now);
	const secretHour = toRandomHour(hash(dayStart.getTime()));
	const isSecretPole = secretHour === hour;

	if (!poleTimes.has(hour) && !isSecretPole) {
		return {status: SavePoleStatus.WRONG_TIME};
	}

	const hourStart = truncateToHour(now);
	const {n: repeated} = hasPoledStmt.get(user, group, toDbTime(hourStart));
	if (repeated > 0) {
		return {status: SavePoleStatus.REPEATED};
	}

	const {n: polesBefore} = whichPoleStmt.get(group, toDbTime(hourStart));
	if (polesBefore >= 3) {
		return {status: SavePoleStatus.NO_POLES_LEFT};
	}
	const poleType = poleTimes.get(hour)?.[polesBefore] ?? secretPoles[polesBefore];
	const result = insertStmt.run(user, poleType, group, toDbTime(now));
	const ok = result.changes === 1;
	return ok ? {status: SavePoleStatus.SUCCESS, poleType} : {status: SavePoleStatus.ERROR};
}

function toDbTime(date: Date) {
	return Math.floor(date.getTime() / 1000);
}

/**
 * Receives a random arbitrary number and returns a random hour, excluding the hours that already
 * have a pole.
 */
function toRandomHour(random: number) {
	const usedHours = Array.from(poleTimes.keys()).sort((a, b) => a - b);
	const mod = 24 - usedHours.length;
	let hour = ((random % mod) + mod) % mod;
	for (const usedHour of usedHours) {
		if (usedHour <= hour) {
			hour++;
		} else {
			break;
		}
	}
	return hour;
}

function truncateToHour(date: Date) {
	const truncated = new Date(date);
	truncated.setMilliseconds(0);
	truncated.setSeconds(0);
	truncated.setMinutes(0);
	return truncated;
}

function truncateToDay(date: Date) {
	const truncated = new Date(date);
	truncated.setMilliseconds(0);
	truncated.setSeconds(0);
	truncated.setMinutes(0);
	truncated.setHours(0);
	return truncated;
}

export function getRanking(group: Group, seasonStart: Date): RankingResult[] {
	return rankingStmt.all(group, Math.floor(seasonStart.getTime() / 1000));
}

export function hasAchievement(user: User, group: Group, achievementId: AchievementId): boolean {
	return userHasAchievementStmt.get(user, group, achievementId).result;
}

export function getUserAchievements(
	user: User,
	group: Group,
): Array<{achievementId: AchievementId; timestamp: number}> {
	return getUserAchievementsStmt
		.all(user, group)
		.map(({achievement_id: achievementId, timestamp}) => ({
			achievementId,
			timestamp,
		}));
}

export function getGroupAchievements(
	group: Group,
): Array<{user: User; achievementId: AchievementId; timestamp: number}> {
	return getGroupAchievementsStmt
		.all(group)
		.map(({user, achievement_id: achievementId, timestamp}) => ({
			user,
			achievementId,
			timestamp,
		}));
}

export function saveAchievement(user: User, group: Group, achievementId: AchievementId): void {
	saveAchievementStmt.run(user, group, achievementId, Math.floor(Date.now() / 1000));
}

export function getUserPoles(user: User, group: Group) {
	return new Map(getUserPolesStmt.all(user, group).map(({type, amount}) => [type, amount]));
}

export function getUserPolesWithTimes(user: User, group: Group) {
	const result = getUserPoleTimesStmt.all(user, group);
	return new Map<number, Set<PoleType>>(
		result.map(({minutes, types}) => [
			minutes,
			new Set(
				String(types)
					.split(',')
					.map(type => parseInt(type) as PoleType),
			),
		]),
	);
}

export function getTokenInfo(token: string) {
	return getTokenInfoStmt.get(token);
}

export async function generateToken(user: User, group: Group): Promise<string> {
	const savedToken = getTokenByUserStmt.get(user, group);
	if (savedToken) {
		return savedToken.token;
	}
	return new Promise((resolve, reject) => {
		randomBytes(16, (err, buf) => {
			if (err) return reject(err);
			const token = buf
				.toString('base64')
				.replace(/\//g, '_')
				.replace(/\+/g, '-')
				.replace(/=/g, '')
				.substr(0, 64);
			createTokenStmt.run(token, user, group);
			resolve(token);
		});
	});
}
