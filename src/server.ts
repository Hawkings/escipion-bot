import next from 'next';
import {createServer} from 'http';
import {parse} from 'url';
import {URL_BASE, WEB_PORT} from '../secret';

export async function startNextServer() {
	const dev = process.env.NODE_ENV !== 'production';
	const app = next({dev});
	const handle = app.getRequestHandler();

	await app.prepare();
	createServer((req, res) => {
		const parsedUrl = parse(req.url!, true);

		handle(req, res, parsedUrl);
	}).listen(WEB_PORT, () => {
		console.log(`> Ready on ${URL_BASE}`);
	});
}
