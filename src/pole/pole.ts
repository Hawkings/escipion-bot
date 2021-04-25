import {savePole, toDbTime, hasAlreadyPoled, countHourPoles} from '../db/db';
import {Group, PoleType, User, ValidPoleType} from '../types';
import {bot, getUserName} from '../telegram';
import {onPole} from '../achievements/achievements';
import {SeasonType} from '../seasons/types';
import {getSeasonType} from '../seasons/seasons';
import {getSeasonStart, truncateToDay, truncateToHour, toRandomHour} from '../util';
import {hash} from '../../secret';

const successfulPoleMessage: Record<ValidPoleType, string> = {
	[PoleType.NORMAL_GOLD]: '¡$user ha conseguido la POLE 🥇🏁!',
	[PoleType.NORMAL_SILVER]: '¡$user ha conseguido la plata🥈🏁!',
	[PoleType.NORMAL_BRONZE]: '$user ha conseguido el bronce 🥉🏁',
	[PoleType.RUSSIAN_GOLD]: '¡$user ha conseguido la POLE RUSA 🥇🇷🇺!',
	[PoleType.RUSSIAN_SILVER]: '¡$user ha conseguido la plata rusa 🥈🇷🇺!',
	[PoleType.RUSSIAN_BRONZE]: '$user ha conseguido el bronce ruso 🥉🇷🇺',
	[PoleType.ANDALUSIAN_GOLD]: '¡$user ha conseguido la POLE ANDALUZA 🥇🛌!',
	[PoleType.ANDALUSIAN_SILVER]: '¡$user ha conseguido la plata andaluza 🥈🛌!',
	[PoleType.ANDALUSIAN_BRONZE]: '$user ha conseguido el bronce andaluz 🥉🛌',
	[PoleType.SECRET_GOLD]: '¡$user ha conseguido la POLE SECRETA 🥇🕵️‍♂️!',
	[PoleType.SECRET_SILVER]: '¡$user ha conseguido la plata secreta 🥈🕵️‍♂️!',
	[PoleType.SECRET_BRONZE]: '$user ha conseguido el bronce secreto 🥉🕵️‍♂️',
	[PoleType.CANARY_GOLD]: '¡$user ha conseguido la POLE CANARIA 🥇🐦!',
	[PoleType.CANARY_SILVER]: '¡$user ha conseguido la plata canaria 🥈🐦!',
	[PoleType.CANARY_BRONZE]: '¡$user ha conseguido el bronce canario 🥉🐦!',
};

export enum SavePoleStatus {
	WRONG_TIME,
	REPEATED,
	NO_POLES_LEFT,
	SUCCESS,
}

const failedPoleMessage: Record<Exclude<SavePoleStatus, SavePoleStatus.SUCCESS>, string> = {
	[SavePoleStatus.NO_POLES_LEFT]: '¡$user ha conseguido el FAIL! (0 puntos)',
	[SavePoleStatus.REPEATED]: 'Deja algo para los demás, $user',
	[SavePoleStatus.WRONG_TIME]: 'A esta hora no hay poles que valgan',
};

function getPoleTimes(now: Date): ReadonlyMap<number, ValidPoleType[]> {
	const poleTimes = new Map([
		[0, [PoleType.NORMAL_GOLD, PoleType.NORMAL_SILVER, PoleType.NORMAL_BRONZE]],
		[23, [PoleType.RUSSIAN_GOLD, PoleType.RUSSIAN_SILVER, PoleType.RUSSIAN_BRONZE]],
		[12, [PoleType.ANDALUSIAN_GOLD, PoleType.ANDALUSIAN_SILVER, PoleType.ANDALUSIAN_BRONZE]],
	]);
	if (getSeasonType(getSeasonStart(now)) === SeasonType.CANARY) {
		poleTimes.set(1, [PoleType.CANARY_GOLD, PoleType.CANARY_SILVER, PoleType.CANARY_BRONZE]);
	}
	return poleTimes as ReadonlyMap<number, ValidPoleType[]>;
}
const secretPoles = [PoleType.SECRET_GOLD, PoleType.SECRET_SILVER, PoleType.SECRET_BRONZE] as const;

const poleCache = new Map<Group, Map<User, number>>();

type UnsuccessfulSavePoleStatus = Exclude<SavePoleStatus, SavePoleStatus.SUCCESS>;
export type SavePoleResult =
	| {
			status: UnsuccessfulSavePoleStatus;
	  }
	| {
			status: SavePoleStatus.SUCCESS;
			poleType: ValidPoleType;
	  };

function maybeSavePole(user: User, group: Group, now: Date): SavePoleResult {
	const poleTimes = getPoleTimes(now);
	const hour = now.getHours();
	const dayStart = truncateToDay(now);
	const secretHour = toRandomHour(
		hash(dayStart.getTime()),
		Array.from(poleTimes.keys()).sort((a, b) => a - b),
	);
	const isSecretPole = secretHour === hour;

	if (!poleTimes.has(hour) && !isSecretPole) {
		return {status: SavePoleStatus.WRONG_TIME};
	}

	const hourStart = toDbTime(truncateToHour(now));
	if (hasAlreadyPoled(user, group, hourStart)) {
		return {status: SavePoleStatus.REPEATED};
	}

	const polesBefore = countHourPoles(group, hourStart);
	if (polesBefore >= 3) {
		return {status: SavePoleStatus.NO_POLES_LEFT};
	}
	const poleType = poleTimes.get(hour)?.[polesBefore] ?? secretPoles[polesBefore];
	savePole(user, group, toDbTime(now), poleType);
	return {status: SavePoleStatus.SUCCESS, poleType};
}

export async function pole(user: User, group: Group): Promise<void> {
	const now = new Date();
	if (poleCache.get(group)?.has(user)) {
		const lastTime = poleCache.get(group)!.get(user)!;
		const elapsed = now.getTime() - lastTime;
		if (elapsed <= 5000) {
			bot().sendMessage(
				group,
				`${await getUserName(group, user)}, no vale hacer spam. Espera ${Math.round(
					(5000 - elapsed) / 1000,
				)} segundos.`,
			);
			return;
		}
	}
	if (!poleCache.has(group)) poleCache.set(group, new Map());
	poleCache.get(group)?.set(user, now.getTime());
	const result = maybeSavePole(user, group, now);
	setImmediate(onPole, user, group, result, now);
	let message: string;
	if (result.status === SavePoleStatus.SUCCESS) {
		message = successfulPoleMessage[result.poleType];
	} else {
		message = failedPoleMessage[result.status];
	}
	message = message.replace('$user', await getUserName(group, user));
	bot().sendMessage(group, message);
}
