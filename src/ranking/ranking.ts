import {getRanking} from '../db/db';
import {bot, getUserName} from '../telegram';
import {Group} from '../types';

const POSITIONS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

function getPositionDisplay(position: number) {
	if (position <= POSITIONS.length) {
		return POSITIONS[position];
	} else {
		return `${position + 1}`;
	}
}

export async function ranking(group: Group): Promise<void> {
	const ranking = getRanking(group);
	let output = '🏆 Ranking 🏆\n';
	for (let i = 0; i < ranking.length; i++) {
		const {user, score} = ranking[i];
		const position = getPositionDisplay(i);
		output += `${position} ${await getUserName(group, user)} ${score}\n`;
	}
	bot.sendMessage(group, output);
}
