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

// Single-line name for the header GIF
const line = 'Soumyadip Majumder';
const cursorChar = '▌'; // typewriter-style cursor

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

// Transparent background
encoder.setTransparent(0x000000);

// Base font
ctx.font = `${fontSize}px ${fontFamily}`;
ctx.textBaseline = 'middle';

// Measure full text once for centering
const fullTextWidth = ctx.measureText(line).width;
const centerX = width / 2;
const centerY = height / 2;

// ---------------------------
// Gradient palettes
// ---------------------------

// Choose ONE palette here
const palette = 'blue'; // 'blue' | 'sunset' | 'mint' | 'ember'

// Animated gradient for text fill only (no background)
function createAnimatedGradient(frameIndex) {
	const shift = Math.sin(frameIndex * 0.05) * 60;
	const startX = centerX - fullTextWidth / 2 - shift;
	const endX = centerX + fullTextWidth / 2 + shift;

	const gradient = ctx.createLinearGradient(startX, 0, endX, 0);

	if (palette === 'blue') {
		// Indigo / blue
		gradient.addColorStop(0.0, '#4c51bf'); // indigo-600
		gradient.addColorStop(0.4, '#667eea'); // indigo-400
		gradient.addColorStop(0.7, '#63b3ed'); // blue-300
		gradient.addColorStop(1.0, '#edf2f7'); // gray-100
	} else if (palette === 'sunset') {
		// Orange / pink / purple
		gradient.addColorStop(0.0, '#ed8936'); // orange-400
		gradient.addColorStop(0.4, '#f56565'); // red-400
		gradient.addColorStop(0.7, '#ed64a6'); // pink-400
		gradient.addColorStop(1.0, '#805ad5'); // purple-500
	} else if (palette === 'mint') {
		// Teal / cyan
		gradient.addColorStop(0.0, '#0d9488'); // teal-600
		gradient.addColorStop(0.4, '#14b8a6'); // teal-500
		gradient.addColorStop(0.7, '#22c55e'); // green-500
		gradient.addColorStop(1.0, '#bbf7d0'); // green-100
	} else if (palette === 'ember') {
		// Dark ember / amber
		gradient.addColorStop(0.0, '#f97316'); // orange-500
		gradient.addColorStop(0.4, '#ea580c'); // orange-600
		gradient.addColorStop(0.7, '#b45309'); // amber-700
		gradient.addColorStop(1.0, '#fed7aa'); // orange-100
	}

	return gradient;
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
