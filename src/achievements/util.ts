import {isBronze, isGold, isSilver, PoleType} from '../types';
import {Achievement, AchievementContext, AchievementId, OnPoleParams} from './achievements';

export function countGoldPoles({poles}: AchievementContext) {
	return Array.from(poles.entries())
		.filter(([poleType]) => isGold(poleType))
		.reduce((prev, [, amount]) => prev + amount, 0);
}

export function countSilverPoles({poles}: AchievementContext) {
	return Array.from(poles.entries())
		.filter(([poleType]) => isSilver(poleType))
		.reduce((prev, [, amount]) => prev + amount, 0);
}

export function countBronzePoles({poles}: AchievementContext) {
	return Array.from(poles.entries())
		.filter(([poleType]) => isBronze(poleType))
		.reduce((prev, [, amount]) => prev + amount, 0);
}

export function countSecretPoles({poles}: AchievementContext) {
	return poles.get(PoleType.SECRET_GOLD) ?? 0;
}

export function countScore({totalScore}: AchievementContext) {
	return totalScore;
}

type CountFunction = (params: AchievementContext) => number;

function stdPercentage(target: number, countFn: CountFunction) {
	return (params: AchievementContext) => countFn(params) / target;
}

function stdCountChecker(amount: number, countFn: CountFunction) {
	return (params: OnPoleParams) => countFn(params) >= amount;
}

function stdAchievementFunctions(target: number, countFn: CountFunction) {
	if (target > 1) {
		return {
			onPole: stdCountChecker(target, countFn),
			completionPercentage: stdPercentage(target, countFn),
		};
	} else {
		return {
			onPole: stdCountChecker(target, countFn),
		};
	}
}

interface PartialAchievement {
	name: string;
	emoji: string;
	target: number;
}
interface CommonProps {
	description: (target: number) => string;
	startId: number;
	countFn: CountFunction;
}

export function createCountBasedAchievements(
	{countFn, description, startId}: CommonProps,
	partialAchievements: PartialAchievement[],
): Achievement[] {
	return partialAchievements.map(({name, emoji, target}, i) => ({
		id: (startId + i) as AchievementId,
		name,
		emoji,
		description: description(target),
		...stdAchievementFunctions(target, countFn),
	}));
}
