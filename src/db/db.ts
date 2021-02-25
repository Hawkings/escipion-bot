import sqlite from 'better-sqlite3';
import {Group, PoleType, User} from '../types';

interface RankingResult {
	user: User;
	score: number;
}

type Statement = ReturnType<typeof sqlite.prototype.prepare>;

const DB_FILE_NAME = 'escipion.db';
const poleTimes = new Map<number, PoleType[]>([
	[
		0,
		[
			PoleType.NORMAL_GOLD, //
			PoleType.NORMAL_SILVER,
			PoleType.NORMAL_BRONZE,
		],
	],
	[
		23,
		[
			PoleType.RUSSIAN_GOLD, //
			PoleType.RUSSIAN_SILVER,
			PoleType.RUSSIAN_BRONZE,
		],
	],
	[
		12,
		[
			PoleType.ANDALUSIAN_GOLD, //
			PoleType.ANDALUSIAN_SILVER,
			PoleType.ANDALUSIAN_BRONZE,
		],
	],
]);

const poleMessage = new Map<PoleType, string>([
	[PoleType.NORMAL_GOLD, '¡$user ha conseguido la POLE!'],
	[PoleType.NORMAL_SILVER, '¡$user ha conseguido la plata!'],
	[PoleType.NORMAL_BRONZE, '$user ha conseguido el bronce'],
	[PoleType.RUSSIAN_GOLD, '¡$user ha conseguido la POLE RUSA!'],
	[PoleType.RUSSIAN_SILVER, '¡$user ha conseguido la plata rusa!'],
	[PoleType.RUSSIAN_BRONZE, '$user ha conseguido el bronce ruso'],
	[PoleType.ANDALUSIAN_GOLD, '¡$user ha conseguido la POLE ANDALUZA!'],
	[PoleType.ANDALUSIAN_SILVER, '¡$user ha conseguido la plata andaluza!'],
	[PoleType.ANDALUSIAN_BRONZE, '$user ha conseguido el bronce andaluz'],
]);

export default class Database {
	private readonly db: sqlite;
	private readonly insertStmt: Statement;
	private readonly rankingStmt: Statement;
	private readonly whichPoleStmt: Statement;
	private readonly hasPoledStmt: Statement;

	constructor() {
		try {
			this.db = sqlite(DB_FILE_NAME, {fileMustExist: true});
		} catch {
			this.db = sqlite(DB_FILE_NAME);
			this.initTables();
		}
		this.insertStmt = this.db.prepare(
			`INSERT INTO poles (user, type, group_id, timestamp) values (?, ?, ?, ?)`,
		);
		this.rankingStmt = this.db.prepare(`
			SELECT user, SUM(counts.times*scores.score) as score
			FROM (
				(
					SELECT user, type, count(*) as times
					FROM poles
					WHERE group_id = ?
					GROUP BY user,  type
				) counts
				LEFT JOIN scores
				ON counts.type = scores.pole_type
			)
			GROUP BY user
			ORDER BY score DESC
        `);
		this.hasPoledStmt = this.db.prepare(`
			SELECT COUNT(*) as n
			FROM poles
			WHERE user = ? AND group_id = ? AND timestamp >= ?
		`);
		this.whichPoleStmt = this.db.prepare(`
            SELECT COUNT(*) as n
            FROM poles
            where group_id = ? AND timestamp >= ?
        `);
	}

	savePole(user: User, group: Group): string {
		const now = new Date();
		const hour = now.getHours();
		if (!poleTimes.has(hour)) {
			return 'A esta hora no hay poles que valgan';
		}
		// unix time for the beginning of the current hour
		const hourStart = new Date(now);
		hourStart.setMinutes(0);
		hourStart.setSeconds(0);
		hourStart.setMilliseconds(0);
		const {n: repeated} = this.hasPoledStmt.get(user, group, this.toDbTime(hourStart));
		if (repeated > 0) {
			return 'Deja algo para los demás, $user';
		}
		const {n: polesBefore} = this.whichPoleStmt.get(group, this.toDbTime(hourStart));
		if (polesBefore >= 3) {
			return '¡$user ha conseguido el FAIL! (0 puntos)';
		}
		const poleType = poleTimes.get(hour)![polesBefore];
		const result = this.insertStmt.run(user, poleType, group, this.toDbTime(now));
		const ok = result.changes === 1;
		return ok ? poleMessage.get(poleType)! : 'He petado, Dani no sabe programar';
	}

	private toDbTime(date: Date) {
		return Math.floor(date.getTime() / 1000);
	}

	getRanking(group: Group): RankingResult[] {
		return this.rankingStmt.all(group);
	}

	private initTables() {
		this.db.exec(`
            CREATE TABLE IF NOT EXISTS scores (
                pole_type INTEGER PRIMARY KEY NOT NULL,
                score REAL NOT NULL
            )
        `);
		this.db.exec(`
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
            (${PoleType.RUSSIAN_BRONZE}, 1)
        `);
		this.db.exec(`
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
        `);
	}
}
