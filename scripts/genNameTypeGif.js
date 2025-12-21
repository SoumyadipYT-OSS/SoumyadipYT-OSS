const fs = require('fs');
const { createCanvas, registerFont } = require('canvas');
const GIFEncoder = require('gifencoder');

// ---------------------------
// Configuration
// ---------------------------

const fontPath = './fonts/Orbitron-Regular.ttf';
const fontFamily = fs.existsSync(fontPath) ? 'Orbitron' : 'sans-serif';

if (fs.existsSync(fontPath)) {
	registerFont(fontPath, { family: 'Orbitron' });
}

const outDir = 'assets';
if (!fs.existsSync(outDir)) {
	fs.mkdirSync(outDir, { recursive: true });
}

const line = 'Soumyadip Majumder';
const cursorChar = '▌';

const width = 900;
const height = 220;
const fontSize = 72;

// Timing
const typingDelayMs = 70;
const encoderDelayMs = typingDelayMs;
const cursorBlinkPeriod = 8;

// Canvas & encoder
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
const encoder = new GIFEncoder(width, height);

encoder.createReadStream().pipe(fs.createWriteStream(`${outDir}/NameTyping.gif`));
encoder.start();
encoder.setRepeat(0);
encoder.setDelay(encoderDelayMs);
encoder.setQuality(10);

// Fully transparent background
encoder.setTransparent(0x000000);

ctx.font = `${fontSize}px ${fontFamily}`;
ctx.textBaseline = 'middle';

const fullTextWidth = ctx.measureText(line).width;
const centerX = width / 2;
const centerY = height / 2;

// --------------------------------------
// Color palettes: choose ONE
// --------------------------------------
// 'neon'     -> vibrant cyan/magenta
// 'sunrise'  -> orange/pink/purple
// 'aqua'     -> teal/cyan/green
const palette = 'neon';

// Animated gradient for text only
function createAnimatedGradient(frameIndex) {
	const shift = Math.sin(frameIndex * 0.05) * 60;
	const startX = centerX - fullTextWidth / 2 - shift;
	const endX = centerX + fullTextWidth / 2 + shift;

	const g = ctx.createLinearGradient(startX, 0, endX, 0);

	if (palette === 'neon') {
		g.addColorStop(0.0, '#00e5ff'); // cyan
		g.addColorStop(0.4, '#7c3aed'); // violet
		g.addColorStop(0.7, '#ec4899'); // magenta
		g.addColorStop(1.0, '#f9fafb'); // almost white
	} else if (palette === 'sunrise') {
		g.addColorStop(0.0, '#f97316'); // orange
		g.addColorStop(0.4, '#fb7185'); // rose
		g.addColorStop(0.7, '#a855f7'); // purple
		g.addColorStop(1.0, '#fee2e2'); // soft light
	} else if (palette === 'aqua') {
		g.addColorStop(0.0, '#0ea5e9'); // sky
		g.addColorStop(0.4, '#22c55e'); // green
		g.addColorStop(0.7, '#2dd4bf'); // teal
		g.addColorStop(1.0, '#e0f2fe'); // light blue
	}

	return g;
}

function clearTransparent() {
	ctx.clearRect(0, 0, width, height);
}

function drawTypingFrame(charIndex, frameIndex) {
	clearTransparent();

	const showCursor = frameIndex % cursorBlinkPeriod < cursorBlinkPeriod / 2;

	const core = line.substring(0, charIndex);
	const visibleText = core + (showCursor && charIndex <= line.length ? cursorChar : '');

	const progress = Math.min(1, charIndex / line.length);
	const alpha = 0.4 + progress * 0.6;

	ctx.fillStyle = createAnimatedGradient(frameIndex);
	ctx.globalAlpha = alpha;

	ctx.shadowColor = 'transparent';
	ctx.shadowBlur = 0;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;

	const currentWidth = ctx.measureText(visibleText).width;
	const x = centerX - currentWidth / 2;
	const y = centerY;

	ctx.fillText(visibleText, x, y);

	ctx.globalAlpha = 1;
}

function drawFinalFrame(frameIndex) {
	clearTransparent();

	ctx.fillStyle = createAnimatedGradient(frameIndex);
	ctx.globalAlpha = 1;

	ctx.shadowColor = 'transparent';
	ctx.shadowBlur = 0;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;

	const x = centerX - fullTextWidth / 2;
	const y = centerY;

	ctx.fillText(line, x, y);

	ctx.globalAlpha = 1;
}

// ---------------------------
// Animation loop
// ---------------------------

let frameCounter = 0;

// Typing animation
for (let i = 1; i <= line.length; i++) {
	drawTypingFrame(i, frameCounter);
	encoder.addFrame(ctx);
	frameCounter++;
}

// Hold full name with blinking cursor
for (let hold = 0; hold < 10; hold++) {
	drawTypingFrame(line.length, frameCounter);
	encoder.addFrame(ctx);
	frameCounter++;
}

// Final static frames, no cursor, gradient still animated
for (let k = 0; k < 20; k++) {
	drawFinalFrame(frameCounter);
	encoder.addFrame(ctx);
	frameCounter++;
}

encoder.finish();

console.log('NameTyping.gif generated in assets/NameTyping.gif');
