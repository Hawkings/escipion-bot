jest.mock('../src/telegram');
jest.mock('../src/db/db');
import {getRanking} from '../src/db/db';
import {ranking} from '../src/ranking/ranking';
import {bot} from '../src/telegram';
import {toGroup, toUser} from '../src/types';

const mockGetRanking = getRanking as jest.MockedFunction<typeof getRanking>;
const mockBot = bot as jest.Mocked<typeof bot>;

/** @returns array with the numbers from 0 to n-1 */
function seq(n: number) {
	return [...Array(n).keys()];
}

const GROUP = toGroup(1);

describe('ranking', () => {
	beforeEach(() => {
		mockGetRanking.mockReturnValueOnce(
			seq(11).map(i => ({
				user: toUser(i),
				rank: i + 1,
				score: 100 - i,
			})),
		);
	});
	it('returns the correct ranking', async () => {
		await ranking(GROUP);
		expect(mockBot.sendMessage).toHaveBeenCalledWith(
			GROUP,
			`🏆 Ranking 🏆
🥇 0 100
🥈 1 99
🥉 2 98
4️⃣ 3 97
5️⃣ 4 96
6️⃣ 5 95
7️⃣ 6 94
8️⃣ 7 93
9️⃣ 8 92
🔟 9 91
11 10 90
`,
		);
	});
});
