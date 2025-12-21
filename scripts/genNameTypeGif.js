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

// Layout (we'll center horizontally and vertically)
const paddingHorizontal = 40;

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

// Base font
ctx.font = `${fontSize}px ${fontFamily}`;
ctx.textBaseline = 'middle';

// Measure full text once for centering
const fullTextWidth = ctx.measureText(line).width;
const centerX = width / 2;
const centerY = height / 2;

// ---------------------------
// Drawing helpers
// ---------------------------

// Gradient moves slightly over time (gradient fill animation)
function createAnimatedGradient(frameIndex) {
	const shift = Math.sin(frameIndex * 0.05) * 60; // small horizontal shift
	const startX = centerX - fullTextWidth / 2 - shift;
	const endX = centerX + fullTextWidth / 2 + shift;

	const gradient = ctx.createLinearGradient(startX, 0, endX, 0);
	gradient.addColorStop(0.0, '#4c51bf'); // indigo-600
	gradient.addColorStop(0.4, '#667eea'); // indigo-400
	gradient.addColorStop(0.7, '#63b3ed'); // blue-300
	gradient.addColorStop(1.0, '#edf2f7'); // gray-100
	return gradient;
}

function clearTransparent() {
	// Fully transparent background
	ctx.clearRect(0, 0, width, height);
}

function drawTypingFrame(charIndex, frameIndex) {
	clearTransparent();

	const showCursor = frameIndex % cursorBlinkPeriod < cursorBlinkPeriod / 2;

	// Typewriter substring
	const visibleCore = line.substring(0, charIndex);
	const visibleText =
		visibleCore + (showCursor && charIndex <= line.length ? cursorChar : '');

	// Fade-in per character
	const progress = Math.min(1, charIndex / line.length);
	const alpha = 0.4 + progress * 0.6; // from 0.4 to 1.0

	// Animated gradient fill
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

	// Full text, animated gradient still moving
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

// Typing animation (typewriter effect)
for (let i = 1; i <= line.length; i++) {
	drawTypingFrame(i, frameCounter);
	encoder.addFrame(ctx);
	frameCounter++;
}

// Hold full name with blinking cursor for a bit
for (let hold = 0; hold < 10; hold++) {
	drawTypingFrame(line.length, frameCounter);
	encoder.addFrame(ctx);
	frameCounter++;
}

// Final static hero frames, no cursor, gradient still animates slightly
for (let k = 0; k < 20; k++) {
	drawFinalFrame(frameCounter);
	encoder.addFrame(ctx);
	frameCounter++;
}

encoder.finish();

console.log('NameTyping.gif generated in assets/NameTyping.gif');
