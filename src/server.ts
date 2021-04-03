import next from 'next';
import {createServer} from 'http';
import {parse} from 'url';

export async function startNextServer() {
	const dev = process.env.NODE_ENV !== 'production';
	const app = next({dev});
	const handle = app.getRequestHandler();

	await app.prepare();
	createServer((req, res) => {
		const parsedUrl = parse(req.url!, true);

		handle(req, res, parsedUrl);
	}).listen(3000, () => {
		console.log('> Ready on http://localhost:3000');
	});
}
