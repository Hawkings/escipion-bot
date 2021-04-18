import {useEffect, useRef} from 'react';
import {UserRankingData} from './animated_ranking';

export interface ScoreBarData extends UserRankingData {
	hidden: boolean;
	reportWidth: (width: number) => void;
	textWidth: number;
}

export const LINE_HEIGHT = 36;

export function ScoreBar({
	userName,
	avatar,
	score,
	rank,
	highestScore,
	hidden,
	textWidth,
	reportWidth,
}: ScoreBarData) {
	const percentage = highestScore ? score / highestScore : 0;
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		reportWidth(ref.current!.scrollWidth);
	});
	const deltaWidth =
		' - 0.5rem' + // left padding
		` - ${textWidth}px` + // text
		' - 1rem' + // img margin (left + right)
		' - 32px' + // img width
		' - 0.5rem'; // score bar right "margin"
	let windowWidth = null;
	if (typeof window !== 'undefined' && textWidth) {
		windowWidth = window.innerWidth;
	}
	const width = windowWidth
		? `max(calc((${windowWidth}px ${deltaWidth}) * ${percentage}), 1px)`
		: '1px';
	return (
		<div
			className={`absolute transition-all ease-linear flex items-center duration-200 w-full pl-2 ${
				hidden ? 'invisible' : ''
			}`}
			style={{top: `${rank * LINE_HEIGHT + 20}px`}}
			data-rank={rank}
		>
			<div
				className="text-mine-primary text-right text-xl flex-shrink-0 whitespace-nowrap"
				ref={ref}
				style={textWidth ? {width: `${textWidth}px`} : {}}
			>
				{userName}
			</div>
			<div className="rounded-full overflow-hidden mx-2 flex-shrink-0">
				<img src={avatar} className="block" width="32" height="32" />
			</div>
			<div
				data-pct={percentage}
				className="bg-red-500 h-5 transition-all ease-linear duration-200 mr-2"
				style={{width}}
			></div>
		</div>
	);
}
