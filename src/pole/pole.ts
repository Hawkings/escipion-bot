import {savePole, SavePoleStatus} from '../db/db';
import {Group, PoleType, User, ValidPoleType} from '../types';
import {bot, getUserName} from '../telegram';

const successfulPoleMessage: Record<ValidPoleType, string> = {
	[PoleType.NORMAL_GOLD]: '¡$user ha conseguido la POLE!',
	[PoleType.NORMAL_SILVER]: '¡$user ha conseguido la plata!',
	[PoleType.NORMAL_BRONZE]: '$user ha conseguido el bronce',
	[PoleType.RUSSIAN_GOLD]: '¡$user ha conseguido la POLE RUSA!',
	[PoleType.RUSSIAN_SILVER]: '¡$user ha conseguido la plata rusa!',
	[PoleType.RUSSIAN_BRONZE]: '$user ha conseguido el bronce ruso',
	[PoleType.ANDALUSIAN_GOLD]: '¡$user ha conseguido la POLE ANDALUZA!',
	[PoleType.ANDALUSIAN_SILVER]: '¡$user ha conseguido la plata andaluza!',
	[PoleType.ANDALUSIAN_BRONZE]: '$user ha conseguido el bronce andaluz',
};

const failedPoleMessage: Record<Exclude<SavePoleStatus, SavePoleStatus.SUCCESS>, string> = {
	[SavePoleStatus.ERROR]: 'He petado, Dani no sabe programar',
	[SavePoleStatus.NO_POLES_LEFT]: '¡$user ha conseguido el FAIL! (0 puntos)',
	[SavePoleStatus.REPEATED]: 'Deja algo para los demás, $user',
	[SavePoleStatus.WRONG_TIME]: 'A esta hora no hay poles que valgan',
};

export async function pole(user: User, group: Group): Promise<void> {
	const result = savePole(user, group);
	let message: string;
	if (result.status === SavePoleStatus.SUCCESS) {
		message = successfulPoleMessage[result.poleType];
	} else {
		message = failedPoleMessage[result.status];
	}
	message = message.replace('$user', await getUserName(group, user));
	bot.sendMessage(group, message);
}
