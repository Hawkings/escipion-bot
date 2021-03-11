import config from './config';
import {generateGif} from './gif/gif';
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

bot.onText(/^\/gif$/i, msg => {
	bot.sendAnimation(
		msg.chat.id,
		generateGif(`🏆 Ranking 🏆
🥇 Irene 77
🥈 Daniel 64
🥉 Antonio 29
4️⃣ VicNaranja 27
5️⃣ Pedro 14
6️⃣ R. 13
7️⃣ Jadelaar 3
8️⃣ Godo 2
8️⃣ Legumix 2
🔟 Marina 1`),
	);
});
