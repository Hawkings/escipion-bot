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
	const deltaDays = dateDiffInDays(date, REFERENCE_DATE);
	const deltaSeasons = Math.floor(deltaDays / 14);
	return addDaysToDate(REFERENCE_DATE, Math.floor(14 * deltaSeasons));
}
