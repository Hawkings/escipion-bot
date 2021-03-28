import {PoleType} from '../types';

export const DB_FILE_NAME = 'escipion.db';

export const INSERT_POLE_QUERY = `INSERT INTO poles (user, type, group_id, timestamp) values (?, ?, ?, ?)`;
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
export const HAS_POLE_QUERY = `
	SELECT COUNT(*) as n
	FROM poles
	WHERE user = ? AND group_id = ? AND timestamp >= ?
`;
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
	(${PoleType.SECRET_BRONZE}, 1)
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
