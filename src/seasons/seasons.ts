import {getCurrentSeasonStart} from '../util';
import {SeasonType} from './types';

const FEBRUARY = 1;
const MARCH = 2;
const APRIL = 3;

const nonNormalSeasons = new Map([
	[new Date(2021, APRIL, 26).getTime(), SeasonType.CANARY],
	[new Date(2026, FEBRUARY, 9).getTime(), SeasonType.CANARY],
	[new Date(2026, FEBRUARY, 23).getTime(), SeasonType.CANARY],
	[new Date(2026, MARCH, 9).getTime(), SeasonType.CANARY],
]);

export function getSeasonType(season: Date) {
	if (nonNormalSeasons.has(season.getTime())) {
		return nonNormalSeasons.get(season.getTime())!;
	}
	return SeasonType.NORMAL;
}

export function getCurrentSeasonType() {
	return getSeasonType(getCurrentSeasonStart());
}
