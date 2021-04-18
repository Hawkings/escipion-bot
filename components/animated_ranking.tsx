import {useState} from 'react';
import {User} from '../src/types';
import {formatDate, sleep} from '../src/util';
import {LINE_HEIGHT, ScoreBar} from './score_bar';

export interface UserData {
	avatar: string;
	name: string;
}

export interface PoleHistory {
	user: User;
	deltaPoints: number;
	timestamp: number;
}

export interface UserRankingData {
	user: User;
	userName: string;
	avatar: string;
	score: number;
	rank: number;
	highestScore: number;
}

function updateRankingData(change: PoleHistory, prevRanking: UserRankingData[]) {
	const ranking = prevRanking
		.map(val => {
			if (val.user !== change.user) return val;
			return {
				...val,
				score: val.score + change.deltaPoints,
			};
		})
		.sort((a, b) => b.score - a.score)
		.map((val, i) => ({
			...val,
			rank: i,
		}));
	return ranking
		.map(val => ({
			...val,
			highestScore: ranking[0].score,
		}))
		.sort((a, b) => a.user.localeCompare(b.user));
}

function startRanking(users: Record<User, UserData>): UserRankingData[] {
	return Array.from(Object.entries<UserData>(users)).map(([user, {name, avatar}], i) => ({
		user: user as User,
		userName: name,
		avatar,
		score: 0,
		rank: i,
		highestScore: 0,
	}));
}

export interface AnimatedRankingParams {
	poleHistory: PoleHistory[];
	users: Record<User, UserData>;
}
export default function AnimatedRanking({poleHistory, users}: AnimatedRankingParams) {
	const [{ranking, i}, setState] = useState({
		ranking: startRanking(users),
		i: -1,
	});
	const [maxWidth, setMaxWidth] = useState(0);

	if (i >= 0 && i < poleHistory.length) {
		const change = poleHistory[i];
		sleep(200).then(() => {
			setState({ranking: updateRankingData(change, ranking), i: i + 1});
		});
	}

	const scoreBars = ranking.map(val => (
		<ScoreBar
			{...val}
			key={val.user}
			hidden={i === -1}
			reportWidth={width => {
				if (width > maxWidth) setMaxWidth(width);
			}}
			textWidth={maxWidth}
		/>
	));

	const startButton = (
		<button
			className="fixed -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 border border-mine-primary text-mine-primary bg-mine-dark text-3xl px-4 py-1 rounded-md"
			onClick={() => {
				setState({i: 0, ranking});
			}}
		>
			⏵
		</button>
	);

	const displayDate = () => {
		if (i === -1) return;
		const date = new Date(poleHistory[Math.min(i, poleHistory.length - 1)].timestamp * 1000);
		return (
			<div
				className="text-gray-300 text-lg absolute"
				style={{right: '0.5rem', top: (ranking.length - 1) * LINE_HEIGHT + 24}}
			>
				{formatDate(date)}
			</div>
		);
	};

	return (
		<div className="relative min-h-full bg-mine-darker text-mine-primary">
			{i === -1 ? startButton : null}
			{scoreBars}
			{displayDate()}
		</div>
	);
}
