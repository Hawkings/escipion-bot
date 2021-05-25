import sqlite from 'better-sqlite3';
import {AchievementId} from '../achievements/achievements';
import {Group, PoleType, User} from '../types';
import {
	CREATE_ACHIEVEMENTS_QUERY,
	CREATE_POLES_QUERY,
	CREATE_SCORES_QUERY,
	DB_FILE_NAME,
	GetAllPolesParams,
	GetAllPolesResult,
	GetGroupAchievementsParams,
	GetGroupAchievementsResult,
	GetUserAchievementsParams,
	GetUserAchievementsResult,
	GetUserPolesParams,
	GetUserPolesResult,
	GetUserPoleTimesParams,
	GetUserPoleTimesResult,
	GetUserScoreParams,
	GetUserScoreResult,
	GET_ALL_POLES_QUERY,
	GET_GROUP_ACHIEVEMENTS_QUERY,
	GET_USER_ACHIEVEMENTS_QUERY,
	GET_USER_POLES_QUERY,
	GET_USER_POLE_TIMES_QUERY,
	GET_USER_SCORE_QUERY,
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
	CREATE_WEB_TOKENS_QUERY,
	GetTokenInfoParams,
	GetTokenInfoResult,
	GET_TOKEN_INFO_QUERY,
	CreateTokenParams,
	CREATE_TOKEN_QUERY,
	GetTokenParams,
	GetTokenResult,
	GET_TOKEN_QUERY,
} from './constants';
import {createRandomToken} from '../util';
import {parseSeasonToken, parseUserToken, serializeSeasonToken, serializeUserToken} from './tokens';

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
const getTokenStmt = db.prepare<GetTokenParams, GetTokenResult>(GET_TOKEN_QUERY);
const getUserScoreStmt = db.prepare<GetUserScoreParams, GetUserScoreResult>(GET_USER_SCORE_QUERY);
const getAllPolesStmt = db.prepare<GetAllPolesParams, GetAllPolesResult>(GET_ALL_POLES_QUERY);

export function savePole(user: User, group: Group, time: number, poleType: PoleType) {
	const result = insertStmt.run(user, poleType, group, time);
	if (result.changes !== 1) {
		console.error(
			'Error saving pole from',
			user,
			'in group',
			group,
			'at time',
			time,
			'of type',
			poleType,
		);
	}
}

export function hasAlreadyPoled(user: User, group: Group, hourStart: number) {
	return hasPoledStmt.get(user, group, hourStart).n > 0;
}

export function countHourPoles(group: Group, hourStart: number) {
	return whichPoleStmt.get(group, hourStart).n;
}

export function toDbTime(date: Date) {
	return Math.floor(date.getTime() / 1000);
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

export function getAchievementTokenInfo(token: string) {
	const result = getTokenInfoStmt.get(token);
	if (!result) return;
	return parseUserToken(result.value);
}

export async function generateAchievementToken(user: User, group: Group): Promise<string> {
	const tokenData = serializeUserToken(user, group);
	const savedToken = getTokenStmt.get(tokenData);
	if (savedToken) {
		return savedToken.token;
	}
	const token = await createRandomToken();
	createTokenStmt.run(token, tokenData);
	return token;
}

export function getUserScore(user: User, group: Group, timestamp = 0) {
	return getUserScoreStmt.get(group, timestamp, user);
}

export function getAllPoles(group: Group, seasonStart: number, seasonEnd: number) {
	return getAllPolesStmt.all(group, seasonStart, seasonEnd);
}

export async function generateSeasonToken(group: Group, season: number): Promise<string> {
	const tokenData = serializeSeasonToken(group, season);
	const savedToken = getTokenStmt.get(tokenData);
	if (savedToken) {
		return savedToken.token;
	}
	const token = await createRandomToken();
	createTokenStmt.run(token, tokenData);
	return token;
}

export function getSeasonTokenInfo(token: string) {
	const result = getTokenInfoStmt.get(token);
	if (!result) return;
	return parseSeasonToken(result.value);
}
