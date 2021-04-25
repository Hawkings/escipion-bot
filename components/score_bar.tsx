import {UserRankingData} from './animated_ranking';

export interface ScoreBarData extends UserRankingData {
	originalRank: number;
}

export const LINE_HEIGHT = 36;

export function ScoreBar({
	userName,
	avatar,
	score,
	originalRank,
	rank,
	highestScore,
}: ScoreBarData) {
	const percentage = highestScore ? score / highestScore : 0;
	const topOffsetStyle = {top: `${(rank - originalRank) * LINE_HEIGHT}px`};
	return (
		<>
			<div
				className="text-mine-primary text-right text-xl flex-shrink-0 whitespace-nowrap overflow-ellipsis relative transition-all ease-linear duration-200"
				style={topOffsetStyle}
			>
				{userName}
			</div>
			<div
				data-pct={percentage}
				className="relative bg-red-500 h-8 transition-all ease-linear duration-200 mr-2 flex-grow overflow-hidden"
				style={topOffsetStyle}
			>
				<img src={avatar} className="block absolute right-0" width="32" height="32" />
			</div>
			<div
				className="text-mine-primary text-xl flex-shrink-0 relative transition-all ease-linear duration-200"
				style={topOffsetStyle}
			>
				{score}
			</div>
		</>
	);
}
