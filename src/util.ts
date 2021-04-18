import {randomBytes} from 'crypto';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const REFERENCE_DATE = new Date('2021/03/29');

function dateDiffInDays(a: Date, b: Date) {
	// Discard the time and time-zone information.
	const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
	const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

	return Math.floor((utc2 - utc1) / MS_PER_DAY);
}

function addDaysToDate(date: Date, days: number) {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

/**
 * Returns the Date of the start of the season that `date` belongs to.
 */
export function getSeasonStart(date: Date): Date {
	const deltaDays = dateDiffInDays(REFERENCE_DATE, date);
	const deltaSeasons = Math.floor(deltaDays / 14);
	return addDaysToDate(REFERENCE_DATE, Math.floor(14 * deltaSeasons));
}

export function getSeasonLimits(date: Date): [seasonStart: Date, seasonEnd: Date] {
	const deltaDays = dateDiffInDays(REFERENCE_DATE, date);
	const deltaSeasons = Math.floor(deltaDays / 14);
	return [
		addDaysToDate(REFERENCE_DATE, Math.floor(14 * deltaSeasons)),
		addDaysToDate(REFERENCE_DATE, Math.floor(14 * (deltaSeasons + 1))),
	];
}

export function getNextSeasonStart(date: Date): Date {
	const deltaDays = dateDiffInDays(REFERENCE_DATE, date);
	const deltaSeasons = Math.floor(deltaDays / 14);
	return addDaysToDate(REFERENCE_DATE, Math.floor(14 * (deltaSeasons + 1)));
}

const monthNames = [
	'enero',
	'febrero',
	'marzo',
	'abril',
	'mayo',
	'junio',
	'julio',
	'agosto',
	'septiembre',
	'octubre',
	'noviembre',
	'diciembre',
];

/**
 * Returns the date of the month without time or year, formatted as a Spanish string. E.g. the 13th
 * of June would be represented as "13 de junio".
 */
export function formatDate(date: Date): string {
	return `${date.getDate()} de ${monthNames[date.getMonth()]}`;
}

export function cleanBase64(base64: string) {
	return base64.replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');
}

/**
 * Generates a random token with 16 bytes of entropy encoded as base 64, using `-` and `_` instead
 * of `/` and `+`.
 */
export function createRandomToken(): Promise<string> {
	return new Promise((resolve, reject) => {
		randomBytes(16, (err, buf) => {
			if (err) return reject(err);
			const token = cleanBase64(buf.toString('base64')).substr(0, 64);
			resolve(token);
		});
	});
}

/** Returns a promise that resolves after the specified number of milliseconds. */
export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
