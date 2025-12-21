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
const cursorChar = '⚛';

const width = 900;      // good aspect for GitHub header
const height = 220;
const fontSize = 64;

// Layout
const paddingLeft = 60;
const baselineY = height / 2 + 8;

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

// ---------------------------
// Drawing helpers
// ---------------------------

// Bright, classic horizontal tricolor with very subtle white wave
function drawTriColorBackground(frameIndex) {
	const bandHeight = height / 3;
	const phase = frameIndex * 0.04;
	const waveAmplitude = 5;
	const waveLength = 260;
	const xStep = 12;

	// Base flat bands
	ctx.fillStyle = '#FF9933';
	ctx.fillRect(0, 0, width, bandHeight);

	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, bandHeight, width, bandHeight);

	ctx.fillStyle = '#138808';
	ctx.fillRect(0, bandHeight * 2, width, bandHeight);

	// Light-only cloth wave
	ctx.save();
	ctx.globalAlpha = 0.18;
	ctx.fillStyle = 'rgba(255,255,255,0.95)';

	const drawWave = (yOffset, phaseOffset) => {
		ctx.beginPath();
		for (let x = 0; x <= width; x += xStep) {
			const y =
				yOffset +
				Math.sin((x / waveLength) * 2 * Math.PI + phase + phaseOffset) *
					waveAmplitude;
			if (x === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		ctx.lineTo(width, yOffset + bandHeight);
		ctx.lineTo(0, yOffset + bandHeight);
		ctx.closePath();
		ctx.fill();
	};

	drawWave(bandHeight * 0.2, 0);
	drawWave(bandHeight * 1.2, Math.PI / 3);
	drawWave(bandHeight * 2.2, Math.PI / 2);

	ctx.restore();
}

// Simple, clean Ashoka Chakra on the right
function drawAshokChakra(frameIndex) {
	const chakraX = width - 140;
	const chakraY = height / 2;
	const chakraRadiusOuter = 50;
	const chakraRadiusInner = 40;
	const chakraSpokes = 24;
	const chakraAngle = frameIndex * 0.035;

	ctx.save();
	ctx.translate(chakraX, chakraY);
	ctx.rotate(chakraAngle);

	// Outer circle
	ctx.beginPath();
	ctx.lineWidth = 3;
	ctx.strokeStyle = '#000080';
	ctx.arc(0, 0, chakraRadiusOuter, 0, 2 * Math.PI);
	ctx.stroke();

	// Inner circle
	ctx.beginPath();
	ctx.lineWidth = 2;
	ctx.arc(0, 0, chakraRadiusInner, 0, 2 * Math.PI);
	ctx.stroke();

	// Spokes
	ctx.lineWidth = 2;
	for (let s = 0; s < chakraSpokes; s++) {
		const angle = (2 * Math.PI * s) / chakraSpokes;
		const inner = chakraRadiusInner * 0.1;
		ctx.beginPath();
		ctx.moveTo(inner * Math.cos(angle), inner * Math.sin(angle));
		ctx.lineTo(chakraRadiusInner * Math.cos(angle), chakraRadiusInner * Math.sin(angle));
		ctx.stroke();
	}

	// Center hub
	ctx.beginPath();
	ctx.fillStyle = '#000080';
	ctx.arc(0, 0, 5, 0, 2 * Math.PI);
	ctx.fill();

	ctx.restore();
}

// Stable, high-contrast text gradient
function createTextGradient() {
	const gradient = ctx.createLinearGradient(paddingLeft, 0, width / 2, 0);
	gradient.addColorStop(0, '#102A43');
	gradient.addColorStop(1, '#1E90FF');
	return gradient;
}

function drawTypingFrame(charIndex, frameIndex) {
	ctx.clearRect(0, 0, width, height);

	// Background and Chakra
	drawTriColorBackground(frameIndex);
	drawAshokChakra(frameIndex);

	// Text (no shadow to avoid dark halo)
	ctx.fillStyle = createTextGradient();
	ctx.shadowColor = 'transparent';
	ctx.shadowBlur = 0;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;

	const showCursor = frameIndex % cursorBlinkPeriod < cursorBlinkPeriod / 2;
	const visibleText =
		line.substring(0, charIndex) +
		(showCursor && charIndex <= line.length ? cursorChar : '');

	ctx.fillText(visibleText, paddingLeft, baselineY);
}

function drawFinalFrame() {
	ctx.clearRect(0, 0, width, height);

	const bandHeight = height / 3;

	ctx.fillStyle = '#FF9933';
	ctx.fillRect(0, 0, width, bandHeight);

	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, bandHeight, width, bandHeight);

	ctx.fillStyle = '#138808';
	ctx.fillRect(0, bandHeight * 2, width, bandHeight);

	drawAshokChakra(0);

	ctx.fillStyle = createTextGradient();
	ctx.shadowColor = 'transparent';
	ctx.shadowBlur = 0;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;

	ctx.fillText(line, paddingLeft, baselineY);
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

// Hold full name for a bit
for (let hold = 0; hold < 10; hold++) {
	drawTypingFrame(line.length, frameCounter);
	encoder.addFrame(ctx);
	frameCounter++;
}

// Final static hero frames
for (let k = 0; k < 20; k++) {
	drawFinalFrame();
	encoder.addFrame(ctx);
}

encoder.finish();

console.log('NameTyping.gif generated in assets/NameTyping.gif');
