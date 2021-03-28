import sqlite from 'better-sqlite3';
import {hash} from '../../secret';
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
const secretPoles = [PoleType.SECRET_GOLD, PoleType.SECRET_SILVER, PoleType.SECRET_BRONZE] as const;

const db = sqlite(DB_FILE_NAME);
db.exec(CREATE_SCORES_QUERY);
db.exec(INSERT_POLE_VALUES_QUERY);
db.exec(CREATE_POLES_QUERY);

const insertStmt = db.prepare(INSERT_POLE_QUERY);
const rankingStmt = db.prepare(RANKING_QUERY);
const hasPoledStmt = db.prepare(HAS_POLE_QUERY);
const whichPoleStmt = db.prepare(WHICH_POLE_QUERY);

export function savePole(user: User, group: Group): SavePoleResult {
	const now = new Date();
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
