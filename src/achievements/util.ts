import {isBronze, isGold, isSilver, PoleType} from '../types';

export function countGoldPoles(poles: Map<PoleType, number>) {
	return Array.from(poles.entries())
		.filter(([poleType]) => isGold(poleType))
		.reduce((prev, [, amount]) => prev + amount, 0);
}

export function countSilverPoles(poles: Map<PoleType, number>) {
	return Array.from(poles.entries())
		.filter(([poleType]) => isSilver(poleType))
		.reduce((prev, [, amount]) => prev + amount, 0);
}

export function countBronzePoles(poles: Map<PoleType, number>) {
	return Array.from(poles.entries())
		.filter(([poleType]) => isBronze(poleType))
		.reduce((prev, [, amount]) => prev + amount, 0);
}
