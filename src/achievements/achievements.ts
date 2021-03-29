import {NORMAL_ACHIEVEMENTS} from './normal_achievements';

export interface Achievement {
	name: string;
	emoji: string;
	description: string;
}

const achievements: Achievement[] = [...NORMAL_ACHIEVEMENTS];
