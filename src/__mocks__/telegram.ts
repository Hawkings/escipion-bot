export const bot = () => ({
	sendMessage: jest.fn(),
});

export const getUserName = jest.fn((_group, user) => Promise.resolve(user));
