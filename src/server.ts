import next from 'next';
import {createServer, ServerOptions} from 'https';
import {parse} from 'url';
import {TLS_CERT_PATH, TLS_KEY_PATH, URL_BASE, WEB_PORT} from '../secret';
import fs from 'fs';

export async function startNextServer() {
	const dev = process.env.NODE_ENV !== 'production';
	const app = next({dev});
	const handle = app.getRequestHandler();

	const options: ServerOptions = {
		key: fs.readFileSync(TLS_KEY_PATH),
		cert: fs.readFileSync(TLS_CERT_PATH),
	};

	await app.prepare();
	createServer(options, (req, res) => {
		const parsedUrl = parse(req.url!, true);

		handle(req, res, parsedUrl);
	}).listen(WEB_PORT, () => {
		console.log(`> Ready on ${URL_BASE} on port ${WEB_PORT}`);
	});
}
