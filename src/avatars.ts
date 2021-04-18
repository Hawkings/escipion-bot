import {createHash} from 'crypto';
import {access, open} from 'fs/promises';
import {constants, createWriteStream} from 'fs';
import path from 'path';
import {URL} from 'url';
import {User} from './types';
import {cleanBase64} from './util';
import {pipeline} from 'stream';
import {downloadUserPicture} from './telegram';
import {SALT} from '../secret';

const AVATARS_SYSTEM_PATH = path.join(process.cwd(), 'avatar');
const AVATARS_WEB_PATH = '/avatar';
const UNKNOWN_AVATAR = AVATARS_WEB_PATH + '/unknown.jpg';
const AVATAR_PATH_REGEX = /^\/avatar\/([a-zA-Z0-9_-]+(?:\.jpg)?)$/;

export async function maybeGetAvatar(requestUrl: string) {
	const url = requestUrl.startsWith('http') ? new URL(requestUrl).pathname : requestUrl;
	const match = AVATAR_PATH_REGEX.exec(url);
	if (!match) return;
	const [, fileName] = match;
	const filePath = path.join(AVATARS_SYSTEM_PATH, fileName);
	try {
		return await open(filePath, 'r');
	} catch (e) {
		console.error(e);
		return;
	}
}

export async function getUserAvatar(user: User): Promise<string> {
	const hash = cleanBase64(
		createHash('sha256')
			.update(SALT + user)
			.digest('base64'),
	);
	const avatarPath = path.join(AVATARS_SYSTEM_PATH, hash);
	const avatarWebPath = AVATARS_WEB_PATH + '/' + hash;
	try {
		await access(avatarPath, constants.R_OK);
		return avatarWebPath;
	} catch {
		const avatarStream = await downloadUserPicture(user);
		if (!avatarStream) return UNKNOWN_AVATAR;
		const writeStream = createWriteStream(avatarPath);
		return new Promise(resolve => {
			pipeline(avatarStream, writeStream, error => {
				if (error) resolve(UNKNOWN_AVATAR);
				resolve(avatarWebPath);
			});
		});
	}
}
