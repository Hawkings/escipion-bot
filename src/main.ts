import {listAchievements, listUserAchievements} from './achievements/achievements';
import {animatedRanking} from './animated_ranking/animated_ranking';
import config from './config';
import * as dalle from './dalle/dalle';
import {pole} from './pole/pole';
import {ranking} from './ranking/ranking';
import {startNextServer} from './server';
import {bot} from './telegram';
import {toGroup, toUser} from './types';

console.log(config.port);

bot().onText(/^(?:(?:sub)?pole|plata|bronce)/i, msg => {
	const userId = msg.from?.id;
	if (!userId) return;
	const user = toUser(userId);
	const group = toGroup(msg.chat.id);
	pole(user, group);
});

bot().onText(/^\/ranking/i, msg => {
	const group = toGroup(msg.chat.id);
	ranking(group);
});

bot().onText(/^\/logros/i, msg => {
	const group = toGroup(msg.chat.id);
	listAchievements(group);
});

bot().onText(/^\/mislogros/i, msg => {
	msg.entities?.filter(entity => entity.type === 'mention' || entity.type === 'text_mention');
	const group = toGroup(msg.chat.id);
	const userId = msg.from?.id;
	if (!userId) return;
	const user = toUser(userId);
	listUserAchievements(user, group);
});

bot().onText(/^\/animacionranking/i, msg => {
	const group = toGroup(msg.chat.id);
	animatedRanking(group);
});

bot().onText(/^\/dalle (.+)/i, async (msg, match) => {
	try {
		const imageUrl = await dalle.getImage(match?.[1] ?? '');
		bot().sendPhoto(msg.chat.id, imageUrl, {reply_to_message_id: msg.message_id});
	} catch (e) {
		bot().sendMessage(msg.chat.id, `Error: ${(e as Error).message}`);
	}
	console.log(match);
});

startNextServer();
