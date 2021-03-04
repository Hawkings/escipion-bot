import config from './config';
import {pole} from './pole/pole';
import {ranking} from './ranking/ranking';
import {bot} from './telegram';
import {toGroup, toUser} from './types';

console.log(config.port);

bot.onText(/^(?:(?:sub)?pole|plata|bronce)/i, msg => {
	const userId = msg.from?.id;
	if (!userId) return;
	const user = toUser(userId);
	const group = toGroup(msg.chat.id);
	pole(user, group);
});

bot.onText(/^\/ranking/i, msg => {
	const group = toGroup(msg.chat.id);
	ranking(group);
});
