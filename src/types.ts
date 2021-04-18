/** A Telegram user ID. */
export type User = string & {user: never};

export function toUser(userId: number): User {
	return `${userId}` as User;
}

/** A Telegram group ID. */
export type Group = string & {group: never};

export function toGroup(groupId: number): Group {
	return `${groupId}` as Group;
}

export enum PoleType {
	UNKNOWN = 0,
	NORMAL_GOLD = 1,
	NORMAL_SILVER = 2,
	NORMAL_BRONZE = 3,
	ANDALUSIAN_GOLD = 4,
	ANDALUSIAN_SILVER = 5,
	ANDALUSIAN_BRONZE = 6,
	RUSSIAN_GOLD = 7,
	RUSSIAN_SILVER = 8,
	RUSSIAN_BRONZE = 9,
	SECRET_GOLD = 10,
	SECRET_SILVER = 11,
	SECRET_BRONZE = 12,
}

export const POLE_POINTS = {
	[PoleType.UNKNOWN]: 0,
	[PoleType.NORMAL_GOLD]: 5,
	[PoleType.NORMAL_SILVER]: 2,
	[PoleType.NORMAL_BRONZE]: 1,
	[PoleType.ANDALUSIAN_GOLD]: 5,
	[PoleType.ANDALUSIAN_SILVER]: 2,
	[PoleType.ANDALUSIAN_BRONZE]: 1,
	[PoleType.RUSSIAN_GOLD]: 5,
	[PoleType.RUSSIAN_SILVER]: 2,
	[PoleType.RUSSIAN_BRONZE]: 1,
	[PoleType.SECRET_GOLD]: 5,
	[PoleType.SECRET_SILVER]: 2,
	[PoleType.SECRET_BRONZE]: 1,
};

export const POLE_TYPES_COUNT = Object.keys(PoleType).length / 2 - 1;
export const GOLD_POLES = new Set([
	PoleType.NORMAL_GOLD,
	PoleType.ANDALUSIAN_GOLD,
	PoleType.RUSSIAN_GOLD,
	PoleType.SECRET_GOLD,
]);
export const SILVER_POLES = new Set([
	PoleType.NORMAL_SILVER,
	PoleType.ANDALUSIAN_SILVER,
	PoleType.RUSSIAN_SILVER,
	PoleType.SECRET_SILVER,
]);
export const BRONZE_POLES = new Set([
	PoleType.NORMAL_BRONZE,
	PoleType.ANDALUSIAN_BRONZE,
	PoleType.RUSSIAN_BRONZE,
	PoleType.SECRET_BRONZE,
]);

export type ValidPoleType = Exclude<PoleType, PoleType.UNKNOWN>;

export function isGold(poleType: PoleType) {
	return GOLD_POLES.has(poleType);
}

export function isSilver(poleType: PoleType) {
	return SILVER_POLES.has(poleType);
}

export function isBronze(poleType: PoleType) {
	return BRONZE_POLES.has(poleType);
}
