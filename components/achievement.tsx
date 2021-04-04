import 'react';
import {AchievementProp} from '../pages/[token]';

export default function Achievement({achievement}: {achievement: AchievementProp}) {
	const {name, emoji, description, obtainedDate} = achievement;
	const notObtainedClasses = obtainedDate ? '' : 'blocked';
	return (
		<div
			className={`rounded-2xl p-2 flex items-center m-7 mt-0 first:mt-7 border-2 border-solid border-mine-primary relative overflow-hidden bg-mine-dark ${notObtainedClasses}`}
		>
			<Emoji>{emoji}</Emoji>
			<Text name={name} description={description} />
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
