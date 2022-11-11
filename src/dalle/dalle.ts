import {DALLE_KEY} from '../../secret';

const DALLE_URL = 'https://api.openai.com/v1/images/generations';
const TIME_BETWEEN_CALLS = 3000;

let lastInvocation = 0;

export async function getImage(prompt: string): Promise<string> {
	if (!prompt.trim()) {
		throw Error('pero dime qué imagen quieres que te dé');
	}
	const now = new Date().getTime();
	if (now - lastInvocation < TIME_BETWEEN_CALLS) {
		throw Error('espera un poco antes de pedir más imágenes');
	}
	lastInvocation = now;
	const response = await fetch(DALLE_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${DALLE_KEY}`,
		},
		body: JSON.stringify({
			prompt,
			n: 1,
			size: '512x512',
		}),
	});
	const json = await response.json();
	if (json.error) {
		throw Error(json.error.type);
	}
	if (!json.data) {
		throw Error('respuesta del servidor inválida');
	}
	return json.data[0].url;
}
