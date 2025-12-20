const fs = require('fs');
const { createCanvas, registerFont } = require('canvas');
const GIFEncoder = require('gifencoder');

// ---------------------------
// Configuration & Setup
// ---------------------------

const fontPath = './fonts/Orbitron-Regular.ttf';
const fontFamily = fs.existsSync(fontPath) ? 'Orbitron' : 'sans-serif';

if (fs.existsSync(fontPath)) {
	registerFont(fontPath, { family: 'Orbitron' });
	console.log('Orbitron font loaded');
} else {
	console.warn('Orbitron font not found, using sans-serif fallback');
}

const outDir = 'assets';

if (!fs.existsSync(outDir)) {
	fs.mkdirSync(outDir, { recursive: true });
}

// Typing lines (content unchanged)
const lines = [
	"Hi, I'm Soumyadip Majumder 👨‍💻",
	'A developer from India 🇮🇳 & Bengali-first educator',
	'Contributor onboarding starts here'
];

const width = 1200;
const height = 360;
const fontSize = 42;
const lineHeight = 70;
const cursorChar = '⚛';

// Layout
const paddingLeft = 80;
const paddingTop = 120;

// Animation timing
const typingDelayMs = 70;
const encoderDelayMs = typingDelayMs;
const cursorBlinkPeriod = 8;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// GIF encoder setup
const encoder = new GIFEncoder(width, height);
encoder.createReadStream().pipe(fs.createWriteStream(`${outDir}/typing.gif`));
encoder.start();
encoder.setRepeat(0);
encoder.setDelay(encoderDelayMs);
encoder.setQuality(10);

// Base font
ctx.font = `${fontSize}px ${fontFamily}`;
ctx.textBaseline = 'middle';

// ---------------------------
// Helper functions
// ---------------------------

// BRIGHT, CLEAN, CLASSIC FLAG BACKGROUND
function drawTriColorBackground(frameIndex) {
	const bandHeight = height / 3;
	const phase = frameIndex * 0.04;
	const waveAmplitude = 6;       // very subtle
	const waveLength = 220;
	const xStep = 8;

	// Flat tricolor bands
	ctx.fillStyle = '#FF9933';
	ctx.fillRect(0, 0, width, bandHeight);

	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, bandHeight, width, bandHeight);

	ctx.fillStyle = '#138808';
	ctx.fillRect(0, bandHeight * 2, width, bandHeight);

	// Very soft light-wave on each band (no darkening)
	ctx.save();
	ctx.globalAlpha = 0.18;

	const drawWave = (yOffset, color, phaseOffset) => {
		ctx.fillStyle = color;
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

	// Top band highlight
	drawWave(bandHeight * 0.2, 'rgba(255,255,255,0.6)', 0);
	// Middle band highlight
	drawWave(bandHeight * 1.2, 'rgba(255,255,255,0.3)', Math.PI / 3);
	// Bottom band highlight
	drawWave(bandHeight * 2.3, 'rgba(255,255,255,0.35)', Math.PI / 2);

	ctx.restore();
}

// Keep Chakra, text gradient, typing logic as you last had them

function drawAshokChakra(frameIndex) {
	const chakraX = width - 240;
	const chakraY = height / 2;
	const chakraRadiusOuter = 70;
	const chakraRadiusInner = 58;
	const chakraSpokes = 24;
	const chakraAngle = frameIndex * 0.03;

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
	ctx.arc(0, 0, 6, 0, 2 * Math.PI);
	ctx.fill();

	ctx.restore();
}

function createTextGradient() {
	const gradient = ctx.createLinearGradient(paddingLeft, 0, width / 2.2, 0);
	gradient.addColorStop(0, '#102A43');  // dark blue
	gradient.addColorStop(1, '#1E90FF');  // dodger blue
	return gradient;
}

function drawTypingFrame(lineIndex, charIndex, frameIndex) {
	ctx.clearRect(0, 0, width, height);

	// Background
	drawTriColorBackground(frameIndex);

	// Chakra on the right
	drawAshokChakra(frameIndex);

	// Text styling
	ctx.fillStyle = createTextGradient();
	ctx.shadowColor = 'rgba(0,0,0,0.25)';
	ctx.shadowBlur = 6;
	ctx.shadowOffsetX = 2;
	ctx.shadowOffsetY = 2;

	for (let j = 0; j <= lineIndex; j++) {
		const y = paddingTop + j * lineHeight;

		const alpha = j === lineIndex ? Math.min(1, charIndex / 8) : 1;
		ctx.globalAlpha = alpha;

		const showCursor = frameIndex % cursorBlinkPeriod < cursorBlinkPeriod / 2;
		const isCurrentLine = j === lineIndex;
		const fullText = lines[j];

		const visibleText = isCurrentLine
			? fullText.substring(0, charIndex) + (showCursor && charIndex <= fullText.length ? cursorChar : '')
			: fullText;

		ctx.fillText(visibleText, paddingLeft, y);
	}

	ctx.globalAlpha = 1;
}

// FINAL FRAME: flat bright flag, no vignette

function drawFinalFrame() {
	ctx.clearRect(0, 0, width, height);

	const bandHeight = height / 3;

	ctx.fillStyle = '#FF9933';
	ctx.fillRect(0, 0, width, bandHeight);

	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, bandHeight, width, bandHeight);

	ctx.fillStyle = '#138808';
	ctx.fillRect(0, bandHeight * 2, width, bandHeight);

	// Static Chakra
	drawAshokChakra(0);

	// Text
	const finalTextGradient = createTextGradient();
	ctx.fillStyle = finalTextGradient;

	ctx.shadowColor = 'rgba(0,0,0,0.3)';
	ctx.shadowBlur = 8;
	ctx.shadowOffsetX = 2;
	ctx.shadowOffsetY = 2;

	for (let j = 0; j < lines.length; j++) {
		const y = paddingTop + j * lineHeight;
		ctx.fillText(lines[j], paddingLeft, y);
	}
}

// ---------------------------
// Animation loop
// ---------------------------

let frameCounter = 0;

for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
	const line = lines[lineIndex];

	for (let i = 1; i <= line.length; i++) {
		drawTypingFrame(lineIndex, i, frameCounter);
		encoder.addFrame(ctx);
		frameCounter++;
	}

	for (let hold = 0; hold < 6; hold++) {
		drawTypingFrame(lineIndex, line.length, frameCounter);
		encoder.addFrame(ctx);
		frameCounter++;
	}
}

// Final hero frame
for (let k = 0; k < 15; k++) {
	drawFinalFrame();
	encoder.addFrame(ctx);
}

encoder.finish();

console.log('Tricolor cinematic typing.gif generated in assets/');
