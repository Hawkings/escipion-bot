import TelegramBot from 'node-telegram-bot-api';
import {token} from '../secret';
import {Group, User} from './types';
import getConfig from 'next/config';

const nextConfig = getConfig();

let telegramBot: TelegramBot | undefined;
export function bot() {
	if (!telegramBot) {
		// This file is compiled twice: one for next.js and another for the normal server. We want
		// polling to be enabled on the normal server only.
		if (nextConfig && nextConfig.serverRuntimeConfig.usingNext) {
			telegramBot = new TelegramBot(token, {polling: false});
		} else {
			telegramBot = new TelegramBot(token, {polling: true});
		}
	}
	return telegramBot;
}

const userNameCache = new Map<User, string>();

export async function getUserName(group: Group, user: User): Promise<string> {
	let userName = userNameCache.get(user);
	if (!userName) {
		userName = (await bot().getChatMember(group, parseInt(user, 10))).user.first_name;
		userNameCache.set(user, userName);
	}
	return userName;
}

const MAX_AVATAR_SIZE = 2 * 2 ** 20;

export async function downloadUserPicture(user: User) {
	try {
		const {photos} = await bot().getUserProfilePhotos(parseInt(user, 10), {limit: 1});
		if (!photos.length || !photos[0].length) return;
		const {file_size: size, file_id: fileId} = photos[0][0];
		if (!size || size > MAX_AVATAR_SIZE) return;
		return bot().getFileStream(fileId);
	} catch {
		console.error('Error while fetching avatars of', user);
	}
}
