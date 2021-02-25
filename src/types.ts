/** A Telegram user ID. */
export type User = string & {user: never};

export function toUser(userId: number) {
	return `${userId}` as User;
}

/** A Telegram group ID. */
export type Group = string & {group: never};

export function toGroup(groupId: number) {
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
}
