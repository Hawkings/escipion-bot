import {listAchievements, listUserAchievements} from './achievements/achievements';
import config from './config';
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

startNextServer();
