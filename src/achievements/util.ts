import {isGold, PoleType} from '../types';

export function countGoldPoles(poles: Map<PoleType, number>) {
	return Array.from(poles.entries())
		.filter(([poleType]) => isGold(poleType))
		.reduce((prev, [, amount]) => prev + amount, 0);
}
