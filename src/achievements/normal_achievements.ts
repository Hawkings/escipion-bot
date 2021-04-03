import {Achievement, AchievementId, OnPoleParams} from './achievements';
import {GOLD_POLES, PoleType, POLE_TYPES_COUNT} from '../types';
import {countGoldPoles} from './util';
import {SavePoleStatus} from '../db/db';

function secretPoleCounter(amount: number) {
	return ({poles}: OnPoleParams) => (poles.get(PoleType.SECRET_GOLD) ?? 0) >= amount;
}

function goldPoleCounter(amount: number) {
	return ({poles}: OnPoleParams) => countGoldPoles(poles) >= amount;
}

const nonSecretGolds = new Set(
	Array.from(GOLD_POLES.keys()).filter(type => type !== PoleType.SECRET_GOLD),
);

export const NORMAL_ACHIEVEMENTS: Achievement[] = [
	{
		id: 0 as AchievementId,
		name: 'Principiante',
		emoji: '👶',
		description: 'Consigue una pole, una plata o un bronce de cualquier tipo.',
		onPole({poles}) {
			return poles.size > 0;
		},
	},
	{
		id: 1 as AchievementId,
		name: 'Coleccionista',
		emoji: '👐',
		description: 'Consigue una pole, una plata y un bronce de cada tipo.',
		onPole({poles}) {
			return poles.size === POLE_TYPES_COUNT;
		},
	},
	{
		id: 2 as AchievementId,
		name: 'Detective novato',
		emoji: '🕵️‍♂️',
		description: 'Consigue una pole secreta.',
		onPole: secretPoleCounter(1),
	},
	{
		id: 3 as AchievementId,
		name: 'Detective profesional',
		emoji: '🕵️‍♂️',
		description: 'Consigue 10 poles secretas.',
		onPole: secretPoleCounter(10),
	},
	{
		id: 4 as AchievementId,
		name: 'Agente secreto',
		emoji: '🕵️‍♂️',
		description: 'Consigue 25 poles secretas.',
		onPole: secretPoleCounter(25),
	},
	{
		id: 5 as AchievementId,
		name: 'Espía',
		emoji: '🕵️‍♂️',
		description: 'Consigue 50 poles secretas.',
		onPole: secretPoleCounter(50),
	},
	{
		id: 6 as AchievementId,
		name: 'Superespía',
		emoji: '🕵️‍♂️',
		description: 'Consigue 100 poles secretas.',
		onPole: secretPoleCounter(100),
	},
	{
		id: 7 as AchievementId,
		name: 'Poleador amateur',
		emoji: '🏁',
		description: 'Consigue 50 poles de cualquier tipo.',
		onPole: goldPoleCounter(50),
	},
	{
		id: 8 as AchievementId,
		name: 'Poleador intermedio',
		emoji: '🏁',
		description: 'Consigue 100 poles de cualquier tipo.',
		onPole: goldPoleCounter(100),
	},
	{
		id: 9 as AchievementId,
		name: 'Poleador profesional',
		emoji: '🏁',
		description: 'Consigue 250 poles de cualquier tipo.',
		onPole: goldPoleCounter(250),
	},
	{
		id: 10 as AchievementId,
		name: 'Poleador nato',
		emoji: '🏁',
		description: 'Consigue 500 poles de cualquier tipo.',
		onPole: goldPoleCounter(500),
	},
	{
		id: 11 as AchievementId,
		name: 'El loco de las poles',
		emoji: '🏁',
		description: 'Consigue 1000 poles de cualquier tipo.',
		onPole: goldPoleCounter(1000),
	},
	{
		id: 12 as AchievementId,
		name: 'Malabarista',
		emoji: '🤹‍♂️',
		description:
			'Consigue una pole, una plata o un bronce de cualquier tipo a cualquier hora y 59 minutos.',
		onPole({lastPoleSaveResult, lastPoleTime}) {
			return (
				lastPoleSaveResult.status === SavePoleStatus.SUCCESS && lastPoleTime.getMinutes() >= 59
			);
		},
	},
	{
		id: 13 as AchievementId,
		name: 'Pole fantasma',
		emoji: '👻',
		description: 'Consigue una pole no secreta a cualquier hora y 30 minutos o más.',
		onPole({lastPoleSaveResult, lastPoleTime}) {
			return (
				lastPoleSaveResult.status === SavePoleStatus.SUCCESS &&
				nonSecretGolds.has(lastPoleSaveResult.poleType) &&
				lastPoleTime.getMinutes() >= 30
			);
		},
	},
	{
		id: 14 as AchievementId,
		name: 'Último segundo',
		emoji: '🎯',
		description: 'Consigue una pole de cualquier tipo a cualquier hora y 59 minutos',
		onPole({lastPoleSaveResult, lastPoleTime}) {
			return (
				lastPoleSaveResult.status === SavePoleStatus.SUCCESS &&
				GOLD_POLES.has(lastPoleSaveResult.poleType) &&
				lastPoleTime.getMinutes() >= 59
			);
		},
	},
];
