import {getRanking} from '../db/db';
import {bot, getUserName} from '../telegram';
import {Group} from '../types';

const POSITIONS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

function getPositionDisplay(position: number) {
	if (position <= POSITIONS.length) {
		return POSITIONS[position - 1];
	} else {
		return `${position}`;
	}
}

export async function ranking(group: Group): Promise<void> {
	const ranking = getRanking(group);
	let output = '🏆 Ranking 🏆\n';
	for (const {user, score, rank} of ranking) {
		const position = getPositionDisplay(rank);
		output += `${position} ${await getUserName(group, user)} ${score}\n`;
	}
	bot.sendMessage(group, output);
}
