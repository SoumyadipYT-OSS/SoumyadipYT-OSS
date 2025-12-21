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
const cursorChar = '▌'; // slimmer block cursor for header look

const width = 900;
const height = 220;
const fontSize = 72;

// Layout (we'll center text)
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

// Measure text for centering
const textWidth = ctx.measureText(line).width;
const centerX = width / 2;
const centerY = height / 2;

// ---------------------------
// Drawing helpers
// ---------------------------

// Soft gradient fill for the name
function createTextGradient() {
	const gradient = ctx.createLinearGradient(centerX - textWidth / 2, 0, centerX + textWidth / 2, 0);
	gradient.addColorStop(0, '#1a202c');  // dark slate
	gradient.addColorStop(0.5, '#2b6cb0'); // blue-600
	gradient.addColorStop(1, '#63b3ed');   // blue-300
	return gradient;
}

// Optional subtle glow behind text
function drawTextGlow(alpha) {
	ctx.save();
	ctx.globalAlpha = alpha * 0.4;
	ctx.fillStyle = '#1a202c';
	ctx.beginPath();
	ctx.ellipse(centerX, centerY, textWidth / 2 + 30, fontSize, 0, 0, 2 * Math.PI);
	ctx.fill();
	ctx.restore();
}

function drawTypingFrame(charIndex, frameIndex) {
	ctx.clearRect(0, 0, width, height);

	const showCursor = frameIndex % cursorBlinkPeriod < cursorBlinkPeriod / 2;
	const visibleText =
		line.substring(0, charIndex) +
		(showCursor && charIndex <= line.length ? cursorChar : '');

	// Fade-in based on progress of typing
	const progress = Math.min(1, charIndex / line.length);
	const alpha = 0.3 + progress * 0.7; // from 0.3 to 1.0

	// Glow
	drawTextGlow(alpha);

	// Text
	ctx.fillStyle = createTextGradient();
	ctx.globalAlpha = alpha;
	ctx.shadowColor = 'rgba(0,0,0,0.15)';
	ctx.shadowBlur = 4;
	ctx.shadowOffsetX = 1;
	ctx.shadowOffsetY = 2;

	const currentWidth = ctx.measureText(visibleText).width;
	const x = centerX - currentWidth / 2;
	const y = centerY;

	ctx.fillText(visibleText, x, y);

	// Reset for next frame
	ctx.globalAlpha = 1;
	ctx.shadowColor = 'transparent';
	ctx.shadowBlur = 0;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
}

function drawFinalFrame() {
	ctx.clearRect(0, 0, width, height);

	const alpha = 1;

	// Final glow
	drawTextGlow(alpha);

	// Final text (full)
	ctx.fillStyle = createTextGradient();
	ctx.globalAlpha = alpha;
	ctx.shadowColor = 'rgba(0,0,0,0.2)';
	ctx.shadowBlur = 6;
	ctx.shadowOffsetX = 2;
	ctx.shadowOffsetY = 3;

	const finalTextWidth = ctx.measureText(line).width;
	const x = centerX - finalTextWidth / 2;
	const y = centerY;

	ctx.fillText(line, x, y);

	// Reset
	ctx.globalAlpha = 1;
	ctx.shadowColor = 'transparent';
	ctx.shadowBlur = 0;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
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

// Hold full name with blinking cursor for a bit
for (let hold = 0; hold < 10; hold++) {
	drawTypingFrame(line.length, frameCounter);
	encoder.addFrame(ctx);
	frameCounter++;
}

// Final static hero frames without cursor
for (let k = 0; k < 20; k++) {
	drawFinalFrame();
	encoder.addFrame(ctx);
}

encoder.finish();

console.log('NameTyping.gif generated in assets/NameTyping.gif');
