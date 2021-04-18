import {URL_BASE} from '../../secret';
import {generateSeasonToken} from '../db/db';
import {bot} from '../telegram';
import {Group} from '../types';
import {getSeasonStart} from '../util';

export async function animatedRanking(group: Group) {
	const curSeason = getSeasonStart(new Date());
	curSeason.setDate(curSeason.getDate() - 1);
	const lastSeason = getSeasonStart(curSeason);
	const token = await generateSeasonToken(group, Math.floor(lastSeason.getTime() / 1000));
	const url = `${URL_BASE}/ar/${token}`;
	bot().sendMessage(group, `<a href="${url}">Ver ranking animado de la última temporada</a>`, {
		parse_mode: 'HTML',
	});
}
