import {Achievement, AchievementId, OnPoleParams} from './achievements';
import {GOLD_POLES, PoleType, POLE_TYPES_COUNT} from '../types';
import {countBronzePoles, countGoldPoles, countSilverPoles} from './util';
import {SavePoleStatus} from '../db/db';

function secretPoleCounter(amount: number) {
	return ({poles}: OnPoleParams) => (poles.get(PoleType.SECRET_GOLD) ?? 0) >= amount;
}

function goldPoleCounter(amount: number) {
	return ({poles}: OnPoleParams) => countGoldPoles(poles) >= amount;
}

function silverPoleCounter(amount: number) {
	return ({poles}: OnPoleParams) => countSilverPoles(poles) >= amount;
}

function bronzePoleCounter(amount: number) {
	return ({poles}: OnPoleParams) => countBronzePoles(poles) >= amount;
}

function scoreCounter(amount: number) {
	return ({totalScore}: OnPoleParams) => totalScore >= amount;
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
		description: 'Consigue una pole de cualquier tipo a cualquier hora y 59 minutos.',
		onPole({lastPoleSaveResult, lastPoleTime}) {
			return (
				lastPoleSaveResult.status === SavePoleStatus.SUCCESS &&
				GOLD_POLES.has(lastPoleSaveResult.poleType) &&
				lastPoleTime.getMinutes() >= 59
			);
		},
	},
	{
		id: 15 as AchievementId,
		name: 'Segundón',
		emoji: '🐟',
		description: 'Consigue 50 platas de cualquier tipo.',
		onPole: silverPoleCounter(50),
	},
	{
		id: 16 as AchievementId,
		name: 'Segundón empedernido',
		emoji: '🐠',
		description: 'Consigue 100 platas de cualquier tipo.',
		onPole: silverPoleCounter(100),
	},
	{
		id: 17 as AchievementId,
		name: 'Segundón profesional',
		emoji: '🐡',
		description: 'Consigue 250 platas de cualquier tipo.',
		onPole: silverPoleCounter(250),
	},
	{
		id: 18 as AchievementId,
		name: 'Segundón experto',
		emoji: '🐬',
		description: 'Consigue 500 platas de cualquier tipo.',
		onPole: silverPoleCounter(500),
	},
	{
		id: 19 as AchievementId,
		name: 'Medallista de plata',
		emoji: '🐋',
		description: 'Consigue 1000 platas de cualquier tipo.',
		onPole: silverPoleCounter(1000),
	},
	{
		id: 20 as AchievementId,
		name: 'It’s something',
		emoji: '🐜',
		description: 'Consigue 50 bronces de cualquier tipo.',
		onPole: bronzePoleCounter(50),
	},
	{
		id: 21 as AchievementId,
		name: 'La edad del bronce',
		emoji: '🐛',
		description: 'Consigue 100 bronces de cualquier tipo.',
		onPole: bronzePoleCounter(100),
	},
	{
		id: 22 as AchievementId,
		name: 'Segundón profesional',
		emoji: '🐌',
		description: 'Consigue 250 bronces de cualquier tipo.',
		onPole: bronzePoleCounter(250),
	},
	{
		id: 23 as AchievementId,
		name: 'Coleccionista de céntimos',
		emoji: '🕷',
		description: 'Consigue 500 bronces de cualquier tipo.',
		onPole: bronzePoleCounter(500),
	},
	{
		id: 24 as AchievementId,
		name: 'Medallista de bronce',
		emoji: '🦂',
		description: 'Consigue 1000 bronces de cualquier tipo.',
		onPole: bronzePoleCounter(1000),
	},
	{
		id: 25 as AchievementId,
		name: 'Jugador respetable',
		emoji: '🐯',
		description: 'Consigue 100 puntos en total',
		onPole: scoreCounter(100),
	},
	{
		id: 26 as AchievementId,
		name: 'Jugador dedicado',
		emoji: '🦁',
		description: 'Consigue 250 puntos en total',
		onPole: scoreCounter(250),
	},
	{
		id: 27 as AchievementId,
		name: 'Jugador profesional',
		emoji: '🦖',
		description: 'Consigue 500 puntos en total',
		onPole: scoreCounter(500),
	},
	{
		id: 28 as AchievementId,
		name: 'Jugador profesional',
		emoji: '🐲',
		description: 'Consigue 1000 puntos en total',
		onPole: scoreCounter(1000),
	},
];
