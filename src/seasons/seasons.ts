import {getCurrentSeasonStart} from '../util';
import {SeasonType} from './types';

const APRIL = 3;

const nonNormalSeasons = new Map([[new Date(2021, APRIL, 26).getTime(), SeasonType.CANARY]]);

export function getSeasonType(season: Date) {
	if (nonNormalSeasons.has(season.getTime())) {
		return nonNormalSeasons.get(season.getTime())!;
	}
	return SeasonType.NORMAL;
}

export function getCurrentSeasonType() {
	return getSeasonType(getCurrentSeasonStart());
}
