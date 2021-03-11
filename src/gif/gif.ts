import GifEncoder from 'gifencoder';
import {CanvasRenderingContext2D, createCanvas} from 'canvas';

const WIDTH = 320;
const HEIGHT = 340;
const FPS = 30;

export function generateGif(text: string): Buffer {
	const encoder = new GifEncoder(WIDTH, HEIGHT);

	encoder.start();
	encoder.setRepeat(-1);
	encoder.setDelay(1000 / FPS);

	const canvas = createCanvas(WIDTH, HEIGHT);
	const ctx = canvas.getContext('2d');

	// First, animate the text downwards
	animateText(encoder, ctx, text, 10_000);

	binarySearch(ctx, text);
	const textMetrics = ctx.measureText(text);
	const marginLeft = (WIDTH - textMetrics.width) / 2;
	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.fillStyle = '#000000';
	ctx.fillText(text, marginLeft, 0, WIDTH);
	for (let i = 0; i < 10 * FPS; i++) {
		encoder.addFrame(ctx);
	}

	encoder.finish();

	return (encoder as any).out.getData();
}

function animateText(
	encoder: GifEncoder,
	ctx: CanvasRenderingContext2D,
	text: string,
	durationMs: number,
) {
	const lineHeight = 30;
	ctx.font = `${lineHeight}px Maiandra GD`;
	ctx.textBaseline = 'top';
	const textMetrics = ctx.measureText(text);
	const textWidth = textMetrics.width;
	const marginLeft = (WIDTH - textWidth) / 2;
	const iterations = (durationMs / 1000) * FPS;
	const textHeight = textMetrics.actualBoundingBoxDescent;
	for (let i = 0; i <= iterations; i++) {
		const t = i / iterations;
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, WIDTH, HEIGHT);
		ctx.fillStyle = '#000000';
		ctx.fillText(text, marginLeft, t * textHeight - textHeight, WIDTH);
		encoder.addFrame(ctx);
	}
}

function binarySearch(ctx: CanvasRenderingContext2D, text: string) {
	let start = 1;
	let end = HEIGHT;

	while (start <= end) {
		const middle = Math.floor((start + end) / 2);
		ctx.font = `${middle}px Maiandra GD`;
		const textMetrics = ctx.measureText(text);
		const textHeight = textMetrics.actualBoundingBoxDescent - textMetrics.actualBoundingBoxAscent;

		if (textHeight <= HEIGHT) {
			if (end === middle) return middle;
			// continue searching to the right
			start = middle + 1;
		} else {
			// search searching to the left
			end = middle - 1;
		}
	}
	return 30;
}
