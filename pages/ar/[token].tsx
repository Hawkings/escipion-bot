import {GetServerSideProps} from 'next';
import AnimatedRanking, {
	AnimatedRankingParams,
	PoleHistory,
} from '../../components/animated_ranking';
import {getUserAvatar} from '../../src/avatars';
import {getAllPoles, getSeasonTokenInfo} from '../../src/db/db';
import {getUserName} from '../../src/telegram';
import {POLE_POINTS, User} from '../../src/types';
import {getNextSeasonStart} from '../../src/util';

interface Props extends AnimatedRankingParams {
	ok: boolean;
}
export default function HomePage(props: Props) {
	return props.ok ? (
		<AnimatedRanking poleHistory={props.poleHistory} users={props.users} />
	) : (
		<h2>Error</h2>
	);
}

export const getServerSideProps: GetServerSideProps<Props> = async context => {
	const token = context.query.token as string;
	const seasonTokenInfo = getSeasonTokenInfo(token);
	if (!seasonTokenInfo) return {props: {poleHistory: [], users: {}, ok: false}};
	const {group, seasonStart} = seasonTokenInfo;
	const nextSeason = getNextSeasonStart(new Date(seasonStart * 1000));
	const poles = getAllPoles(group, seasonStart, Math.floor(nextSeason.getTime() / 1000));
	if (!poles.length) return {props: {poleHistory: [], users: {}, ok: false}};
	const result = [] as PoleHistory[];
	const users = new Set<User>();
	for (const {user, type, timestamp} of poles) {
		users.add(user);
		result.push({
			user,
			deltaPoints: POLE_POINTS[type],
			timestamp,
		});
	}
	const usersArray = Array.from(users.keys());
	// Resolve all avatars and names in parallel
	const avatars = await Promise.all(usersArray.map(user => getUserAvatar(user)));
	const names = await Promise.all(usersArray.map(user => getUserName(group, user)));
	const userData = usersArray
		.map((user, i) => [user, {avatar: avatars[i], name: names[i]}])
		.reduce((obj, [user, userData]) => Object.assign(obj, {[user as string]: userData}), {});

	return {props: {poleHistory: result, users: userData, ok: true}};
};
