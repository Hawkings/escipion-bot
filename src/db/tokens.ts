import {Group, User} from '../types';

export interface UserGroup {
	user: User;
	group: Group;
}

export interface Season {
	group: Group;
	seasonStart: number;
}

export enum TokenType {
	INVALID = 0,
	USER = 1,
	SEASON = 2,
}

interface UserToken {
	type: TokenType.USER;
	data: UserGroup;
}

interface SeasonToken {
	type: TokenType.SEASON;
	data: Season;
}

export function parseUserToken(value: string): UserGroup | undefined {
	try {
		const tokenValue = JSON.parse(value);
		if (isUserToken(tokenValue)) {
			return tokenValue.data;
		}
		return;
	} catch {
		return;
	}
}

export function parseSeasonToken(value: string): Season | undefined {
	try {
		const tokenValue = JSON.parse(value);
		if (isSeasonToken(tokenValue)) {
			return tokenValue.data;
		}
		return;
	} catch {
		return;
	}
}

function isUserToken(tokenValue: unknown): tokenValue is UserToken {
	return (
		typeof tokenValue === 'object' &&
		!!tokenValue &&
		Object.entries(tokenValue).every(
			([key, value]) =>
				(key === 'type' && value === TokenType.USER) || (key === 'data' && isValidUserData(value)),
		)
	);
}

function isValidUserData(userData: unknown) {
	return (
		typeof userData === 'object' &&
		!!userData &&
		Object.entries(userData).every(
			([key, value]) =>
				(key === 'user' && typeof value === 'string') ||
				(key === 'group' && typeof value === 'string'),
		)
	);
}

function isSeasonToken(tokenValue: unknown): tokenValue is SeasonToken {
	return (
		typeof tokenValue === 'object' &&
		!!tokenValue &&
		Object.entries(tokenValue).every(
			([key, value]) =>
				(key === 'type' && value === TokenType.SEASON) ||
				(key === 'data' && isValidSeasonData(value)),
		)
	);
}

function isValidSeasonData(seasonData: unknown) {
	return (
		typeof seasonData === 'object' &&
		!!seasonData &&
		Object.entries(seasonData).every(
			([key, value]) =>
				(key === 'seasonStart' && typeof value === 'number') ||
				(key === 'group' && typeof value === 'string'),
		)
	);
}

export function serializeUserToken(user: User, group: Group): string {
	return JSON.stringify({
		type: TokenType.USER,
		data: {
			user,
			group,
		},
	});
}

export function serializeSeasonToken(group: Group, seasonStart: number): string {
	return JSON.stringify({
		type: TokenType.SEASON,
		data: {
			seasonStart,
			group,
		},
	});
}
