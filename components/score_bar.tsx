import {createPrng} from '../src/util';
import {UserRankingData} from './animated_ranking';

export const LINE_HEIGHT = 40;

function randomColor(i: number) {
	const prng = createPrng(10007 * i + 17);
	const hue = Math.floor(137.50776405003785 * i) % 360;
	const saturation = prng() * 50 + 50;
	const lightness = prng() * 50 + 35;
	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function ScoreBar({
	userName,
	avatar,
	score,
	originalRank,
	rank,
	highestScore,
}: UserRankingData) {
	const percentage = highestScore ? (100 * score) / highestScore : 0;
	const topOffsetStyle = {top: `${(rank - originalRank) * LINE_HEIGHT}px`};
	return (
		<>
			<div
				className="my-1 mr-2 text-mine-primary text-right text-xl whitespace-nowrap overflow-ellipsis overflow-hidden max-w-10ch md:max-w-none relative transition-all ease-linear duration-200"
				style={topOffsetStyle}
			>
				{userName}
			</div>
			<div
				data-pct={percentage}
				className="relative flex items-center my-1 w-full flex-grow overflow-hidden transition-all ease-linear duration-200"
				style={topOffsetStyle}
			>
				<div
					className="h-8 relative transition-all ease-linear duration-200"
					style={{
						width: `${percentage}%`,
						minWidth: '32px',
						backgroundColor: randomColor(originalRank),
					}}
				>
					<img src={avatar} className="block absolute right-0" width="32" height="32" />
				</div>
				<div className="ml-2 text-lg">{score}</div>
			</div>
		</>
	);
}
