import {Achievement, AchievementId} from './achievements';
import {GOLD_POLES, PoleType, POLE_TYPES_COUNT} from '../types';
import {
	countBronzePoles,
	countGoldPoles,
	countScore,
	countSecretPoles,
	countSilverPoles,
	createCountBasedAchievements,
} from './util';
import {SavePoleStatus} from '../pole/pole';

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
		completionPercentage({poles}) {
			return poles.size / POLE_TYPES_COUNT;
		},
	},
	...createCountBasedAchievements(
		{
			description: target =>
				target === 1 ? 'Consigue una pole secreta.' : `Consigue ${target} poles secretas.`,
			startId: 2,
			countFn: countSecretPoles,
		},
		[
			{
				name: 'Detective novato',
				emoji: '❓',
				target: 1,
			},
			{
				name: 'Detective profesional',
				emoji: '🔍',
				target: 10,
			},
			{
				name: 'Agente secreto',
				emoji: '🔬',
				target: 25,
			},
			{
				name: 'Espía',
				emoji: '🕵️',
				target: 50,
			},
			{
				name: 'Superespía',
				emoji: '🤵',
				target: 100,
			},
		],
	),
	...createCountBasedAchievements(
		{
			description: target => `Consigue ${target} poles de cualquier tipo.`,
			startId: 7,
			countFn: countGoldPoles,
		},
		[
			{
				name: 'Poleador amateur',
				emoji: '🚶‍♂️',
				target: 50,
			},
			{
				name: 'Poleador intermedio',
				emoji: '🏃‍♂️',
				target: 100,
			},
			{
				name: 'Poleador profesional',
				emoji: '🚴‍♂️',
				target: 250,
			},
			{
				name: 'Poleador nato',
				emoji: '🏎️',
				target: 500,
			},
			{
				name: 'El loco de las poles',
				emoji: '🚀',
				target: 1000,
			},
		],
	),
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
	...createCountBasedAchievements(
		{
			description: target => `Consigue ${target} platas de cualquier tipo.`,
			startId: 15,
			countFn: countSilverPoles,
		},
		[
			{
				name: 'Segundón',
				emoji: '🐟',
				target: 50,
			},
			{
				name: 'Segundón empedernido',
				emoji: '🐠',
				target: 100,
			},
			{
				name: 'Segundón profesional',
				emoji: '🐡',
				target: 250,
			},
			{
				name: 'Segundón experto',
				emoji: '🐬',
				target: 500,
			},
			{
				name: 'Medallista de plata',
				emoji: '🐋',
				target: 1000,
			},
		],
	),
	...createCountBasedAchievements(
		{
			description: target => `Consigue ${target} bronces de cualquier tipo.`,
			startId: 20,
			countFn: countBronzePoles,
		},
		[
			{
				name: 'It’s something',
				emoji: '🐜',
				target: 50,
			},
			{
				name: 'Chatarrero',
				emoji: '🐛',
				target: 100,
			},
			{
				name: 'Coleccionista de céntimos',
				emoji: '🐌',
				target: 250,
			},
			{
				name: 'La edad del bronce',
				emoji: '🕷',
				target: 500,
			},
			{
				name: 'Medallista de bronce',
				emoji: '🦂',
				target: 1000,
			},
		],
	),
	...createCountBasedAchievements(
		{
			description: target => `Consigue ${target} puntos en total.`,
			startId: 25,
			countFn: countScore,
		},
		[
			{
				name: 'Jugador respetable',
				emoji: '🐯',
				target: 100,
			},
			{
				name: 'Jugador dedicado',
				emoji: '🦁',
				target: 250,
			},
			{
				name: 'Jugador profesional',
				emoji: '🦖',
				target: 500,
			},
			{
				name: 'Jugador de élite',
				emoji: '🐲',
				target: 1000,
			},
			{
				name: 'Jugador definitivo',
				emoji: '🐉',
				target: 2500,
			},
		],
	),
];
