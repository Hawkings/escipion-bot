import config from './config';
import {token} from '../secret';
import TelegramBot from 'node-telegram-bot-api';
import {Group, toGroup, toUser, User} from './types';
import Database from './db/db';

console.log(config.port);

const db = new Database();
const bot = new TelegramBot(token, {polling: true});
const userNameCache = new Map<User, string>();

bot.onText(/^(?:(?:sub)?pole|plata|bronce)/i, async msg => {
	const userId = msg.from?.id;
	if (!userId) return;
	const user = toUser(userId);
	const group = toGroup(msg.chat.id);
	const answer = db.savePole(user, group);
	const userName = await getUserName(group, user);
	bot.sendMessage(group, answer.replace('$user', userName));
});

bot.onText(/^\/ranking/i, async msg => {
	const group = toGroup(msg.chat.id);
	const ranking = db.getRanking(group);
	let output = '🏆 Ranking 🏆\n';
	for (let i = 0; i < ranking.length; i++) {
		const {user, score} = ranking[i];
		let position = `${i + 1}`;
		if (i < 3) {
			position = ['🥇', '🥈', '🥉'][i];
		}
		output += `${position} ${await getUserName(group, user)} ${score}`;
	}
	bot.sendMessage(group, output);
});

async function getUserName(group: Group, user: User): Promise<string> {
	if (userNameCache.has(user)) {
		return userNameCache.get(user)!;
	} else {
		return (await bot.getChatMember(group, user)).user.first_name;
	}
}
