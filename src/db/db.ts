import sqlite from 'better-sqlite3';
import {Group, PoleType, User, ValidPoleType} from '../types';
import {
	CREATE_POLES_QUERY,
	CREATE_SCORES_QUERY,
	DB_FILE_NAME,
	HAS_POLE_QUERY,
	INSERT_POLE_QUERY,
	INSERT_POLE_VALUES_QUERY,
	RANKING_QUERY,
	WHICH_POLE_QUERY,
} from './constants';

export interface RankingResult {
	user: User;
	score: number;
	rank: number;
}

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

const db = (() => {
	try {
		return sqlite(DB_FILE_NAME, {fileMustExist: true});
	} catch {
		const db = sqlite(DB_FILE_NAME);
		db.exec(CREATE_SCORES_QUERY);
		db.exec(INSERT_POLE_VALUES_QUERY);
		db.exec(CREATE_POLES_QUERY);
		return db;
	}
})();

const insertStmt = db.prepare(INSERT_POLE_QUERY);
const rankingStmt = db.prepare(RANKING_QUERY);
const hasPoledStmt = db.prepare(HAS_POLE_QUERY);
const whichPoleStmt = db.prepare(WHICH_POLE_QUERY);

export function savePole(user: User, group: Group): SavePoleResult {
	const now = new Date();
	const hour = now.getHours();
	if (!poleTimes.has(hour)) {
		return {status: SavePoleStatus.WRONG_TIME};
	}
	// unix time for the beginning of the current hour
	const hourStart = new Date(now);
	hourStart.setMinutes(0);
	hourStart.setSeconds(0);
	hourStart.setMilliseconds(0);
	const {n: repeated} = hasPoledStmt.get(user, group, toDbTime(hourStart));
	if (repeated > 0) {
		return {status: SavePoleStatus.REPEATED};
	}
	const {n: polesBefore} = whichPoleStmt.get(group, toDbTime(hourStart));
	if (polesBefore >= 3) {
		return {status: SavePoleStatus.NO_POLES_LEFT};
	}
	const poleType = poleTimes.get(hour)![polesBefore];
	const result = insertStmt.run(user, poleType, group, toDbTime(now));
	const ok = result.changes === 1;
	return ok ? {status: SavePoleStatus.SUCCESS, poleType} : {status: SavePoleStatus.ERROR};
}

function toDbTime(date: Date) {
	return Math.floor(date.getTime() / 1000);
}

export function getRanking(group: Group): RankingResult[] {
	return rankingStmt.all(group);
}
