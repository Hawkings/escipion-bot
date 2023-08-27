import {AchievementId} from '../achievements/achievements';
import {Group, PoleType, User} from '../types';

export const DB_FILE_NAME = '/home/escipion/data/escipion.db';

export type InsertPoleParams = [User, PoleType, Group, number];
export const INSERT_POLE_QUERY = `INSERT INTO poles (user, type, group_id, timestamp) values (?, ?, ?, ?)`;

export type RankingParams = [Group, number];
export interface RankingResult {
	user: User;
	score: number;
	rank: number;
}
export const RANKING_QUERY = `
	SELECT
		user,
		SUM(counts.times*scores.score) as score,
		RANK() OVER (
			ORDER BY SUM(counts.times*scores.score) DESC
		) as rank
	FROM (
		(
			SELECT user, type, count(*) as times
			FROM poles
			WHERE group_id = ? AND timestamp >= ?
			GROUP BY user,  type
		) counts
		LEFT JOIN scores
		ON counts.type = scores.pole_type
	)
	GROUP BY user
	ORDER BY score DESC
`;

export type HasPoledParams = [User, Group, number];
export type HasPoledResult = {
	n: number;
};
export const HAS_POLED_QUERY = `
	SELECT COUNT(*) as n
	FROM poles
	WHERE user = ? AND group_id = ? AND timestamp >= ?
`;
export type WhichPoleParams = [Group, number];
export interface WhichPoleResult {
	n: number;
}
export const WHICH_POLE_QUERY = `
	SELECT COUNT(*) as n
	FROM poles
	where group_id = ? AND timestamp >= ?
`;

export const CREATE_SCORES_QUERY = `
CREATE TABLE IF NOT EXISTS scores (
	pole_type INTEGER PRIMARY KEY NOT NULL,
	score REAL NOT NULL
)
`;

export const INSERT_POLE_VALUES_QUERY = `
	INSERT OR IGNORE INTO scores (pole_type, score) VALUES
	(${PoleType.UNKNOWN}, 0),
	(${PoleType.NORMAL_GOLD}, 5),
	(${PoleType.NORMAL_SILVER}, 2),
	(${PoleType.NORMAL_BRONZE}, 1),
	(${PoleType.ANDALUSIAN_GOLD}, 5),
	(${PoleType.ANDALUSIAN_SILVER}, 2),
	(${PoleType.ANDALUSIAN_BRONZE}, 1),
	(${PoleType.RUSSIAN_GOLD}, 5),
	(${PoleType.RUSSIAN_SILVER}, 2),
	(${PoleType.RUSSIAN_BRONZE}, 1),
	(${PoleType.SECRET_GOLD}, 5),
	(${PoleType.SECRET_SILVER}, 2),
	(${PoleType.SECRET_BRONZE}, 1),
	(${PoleType.CANARY_GOLD}, 5),
	(${PoleType.CANARY_SILVER}, 2),
	(${PoleType.CANARY_BRONZE}, 1)
`;

export const CREATE_POLES_QUERY = `
	CREATE TABLE IF NOT EXISTS poles (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user VARCHAR(30) NOT NULL,
		group_id VARCHAR(30) NOT NULL,
		type INTEGER NOT NULL,
		timestamp INTEGER NOT NULL,
		FOREIGN KEY (type)
			REFERENCES scores(pole_type)
				ON DELETE CASCADE
				ON UPDATE CASCADE
	)
`;

export const CREATE_ACHIEVEMENTS_QUERY = `
	CREATE TABLE IF NOT EXISTS achievements (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user VARCHAR(30) NOT NULL,
		group_id VARCHAR(30) NOT NULL,
		achievement_id INTEGER NOT NULL,
		timestamp INTEGER NOT NULL
	)
`;

export type UserHasAchievementParams = [User, Group, AchievementId];
export interface UserHasAchievementResult {
	result: boolean;
}
export const USER_HAS_ACHIEVEMENT_QUERY = `
	SELECT EXISTS (
		SELECT id
		FROM achievements
		WHERE user = ? AND group_id = ? AND achievement_id = ?
	) as result
`;

export type GetUserAchievementsParams = [User, Group];
export interface GetUserAchievementsResult {
	achievement_id: AchievementId;
	timestamp: number;
}
export const GET_USER_ACHIEVEMENTS_QUERY = `
	SELECT achievement_id, timestamp
	FROM achievements
	WHERE user = ? AND group_id = ?
	ORDER BY achievement_id ASC
`;

export type GetGroupAchievementsParams = [Group];
export interface GetGroupAchievementsResult {
	user: User;
	achievement_id: AchievementId;
	timestamp: number;
}
export const GET_GROUP_ACHIEVEMENTS_QUERY = `
	SELECT user, achievement_id, timestamp
	FROM achievements
	WHERE group_id = ?
	ORDER BY user ASC, achievement_id ASC
`;

export type SaveAchievementParams = [User, Group, AchievementId, number];
export const INSERT_ACHIEVEMENT = `
	INSERT INTO achievements (user, group_id, achievement_id, timestamp)
	VALUES (?, ?, ?, ?)
`;

export type GetUserPolesParams = [User, Group];
export interface GetUserPolesResult {
	type: PoleType;
	amount: number;
}
export const GET_USER_POLES_QUERY = `
	SELECT type, COUNT(*) as amount
	FROM poles
	WHERE user = ? AND group_id = ?
	GROUP BY type
`;

export type GetUserPoleTimesParams = [User, Group];
export interface GetUserPoleTimesResult {
	minutes: number;
	types: string;
}
export const GET_USER_POLE_TIMES_QUERY = `
	SELECT
		CAST(STRFTIME('%M', DATETIME(timestamp, 'unixepoch')) as INTEGER) as minutes,
		GROUP_CONCAT(DISTINCT type) as types
	FROM poles
	WHERE user = ? AND group_id = ?
	GROUP BY minutes
`;

export const CREATE_WEB_TOKENS_QUERY = `
	CREATE TABLE IF NOT EXISTS web_tokens (
		token VARCHAR(64) PRIMARY KEY,
		value TEXT NOT NULL
	)
`;

export type GetTokenInfoParams = [string];
export type GetTokenInfoResult =
	| undefined
	| {
			value: string;
	  };
export const GET_TOKEN_INFO_QUERY = `
	SELECT value
	FROM web_tokens
	WHERE token = ?
`;

export type GetTokenParams = [string];
export type GetTokenResult =
	| undefined
	| {
			token: string;
	  };
export const GET_TOKEN_QUERY = `
	SELECT token
	FROM web_tokens
	WHERE value = ?
`;

export type CreateTokenParams = [string, string];
export const CREATE_TOKEN_QUERY = `
	INSERT INTO web_tokens (token, value)
	VALUES (?, ?)
`;

export type GetUserScoreParams = [Group, number, User];
export interface GetUserScoreResult {
	score: number;
	rank: number;
}
export const GET_USER_SCORE_QUERY = `
	SELECT score, rank
	FROM (
		SELECT
		user,
		SUM(counts.times*scores.score) as score,
		RANK() OVER (
			ORDER BY SUM(counts.times*scores.score) DESC
		) as rank
		FROM (
		(
			SELECT user, type, count(*) as times
			FROM poles
			WHERE group_id = ? AND timestamp >= ?
			GROUP BY user,  type
		) counts
		LEFT JOIN scores
		ON counts.type = scores.pole_type
		)
		GROUP BY user
	)
	WHERE user = ?
`;

export type GetAllPolesParams = [Group, number, number];
export interface GetAllPolesResult {
	user: User;
	group: Group;
	type: PoleType;
	timestamp: number;
}
export const GET_ALL_POLES_QUERY = `
	SELECT user, group_id as 'group', type, timestamp
	FROM poles
	WHERE group_id = ? AND timestamp >= ? AND timestamp < ?
	ORDER BY timestamp ASC
`;
