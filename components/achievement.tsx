import 'react';
import {AchievementProp} from '../pages/[token]';

export default function Achievement({achievement}: {achievement: AchievementProp}) {
	const {name, emoji, description, obtainedDate, completionPct} = achievement;
	const notObtainedClasses = obtainedDate ? '' : 'blocked';
	const progressBar =
		typeof completionPct === 'number' ? <ProgressBar percentage={completionPct} /> : null;
	return (
		<div
			className={`rounded-2xl md:max-w-prose w-full p-2 pr-4 flex items-center mt-7 md:mx-auto first:mt-0 border-2 border-solid border-mine-primary relative overflow-hidden bg-mine-dark ${notObtainedClasses}`}
		>
			<Emoji>{emoji}</Emoji>
			<Text name={name} description={description} />
			{progressBar}
		</div>
	);
}

function Emoji({children}: {children: string}) {
	return <div className="text-7xl mr-5 text-center w-20 h-20 my-1">{children}</div>;
}

function Text({name, description}: {name: string; description: string}) {
	return (
		<div>
			<h2 className="m-0 mb-1 font-semibold text-2xl">{name}</h2>
			<div>{description}</div>
		</div>
	);
}

function ProgressBar({percentage}: {percentage: number}) {
	return (
		<div
			className="absolute top-0 left-0 h-full bg-white opacity-20"
			style={{width: `${percentage}%`}}
		/>
	);
}
