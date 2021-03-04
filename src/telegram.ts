import TelegramBot from 'node-telegram-bot-api';
import {token} from '../secret';
import {Group, User} from './types';

export const bot = new TelegramBot(token, {polling: true});

const userNameCache = new Map<User, string>();

export async function getUserName(group: Group, user: User): Promise<string> {
	let userName = userNameCache.get(user);
	if (!userName) {
		userName = (await bot.getChatMember(group, user)).user.first_name;
		userNameCache.set(user, userName);
	}
	return userName;
}
