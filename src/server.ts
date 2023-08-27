import next from 'next';
import {createServer, ServerOptions} from 'https';
import {IncomingMessage, createServer as insecureCreateServer, ServerResponse} from 'http';
import {parse} from 'url';
import {TLS_CERT_PATH, TLS_KEY_PATH, URL_BASE, WEB_PORT} from '../secret';
import fs from 'fs';
import {maybeGetAvatar} from './avatars';

export async function startNextServer() {
	const dev = process.env.NODE_ENV !== 'production';
	const app = next({dev});
	const handle = app.getRequestHandler();

	const options: ServerOptions =
		TLS_KEY_PATH && TLS_CERT_PATH
			? {
					key: fs.readFileSync(TLS_KEY_PATH),
					cert: fs.readFileSync(TLS_CERT_PATH),
			  }
			: {};

	await app.prepare();
	const server =
		'cert' in options ? createServer(options, serverFn) : insecureCreateServer(serverFn);

	async function serverFn(req: IncomingMessage, res: ServerResponse) {
		const avatarFile = await maybeGetAvatar(req.url!);
		if (avatarFile) {
			res.end(await avatarFile.readFile());
			avatarFile.close();
		} else {
			// Next.js uses the legacy `url.parse` method.
			const parsedUrl = parse(req.url!, true);
			handle(req, res, parsedUrl);
		}
	}
	server.listen(WEB_PORT, () => {
		console.log(`> Ready on ${URL_BASE} on port ${WEB_PORT} with dev=${dev}`);
	});
}
