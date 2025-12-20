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

// Layout tweaks
const paddingLeft = 80;
const paddingTop = 120;

// Animation timing
const typingDelayMs = 70;
const encoderDelayMs = typingDelayMs;
const cursorBlinkPeriod = 8; // lower = faster blink

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

function drawTriColorBackground(frameIndex) {
	// Subtle animated tricolor with diagonal blend instead of harsh bands
	const phase = frameIndex * 0.03;

	const gradient = ctx.createLinearGradient(0, 0, width, height);
	gradient.addColorStop(0.0, '#FF9933');
	gradient.addColorStop(0.48 + Math.sin(phase) * 0.02, '#FFEFD5');
	gradient.addColorStop(0.52 + Math.sin(phase + 1) * 0.02, '#F8F8F8');
	gradient.addColorStop(1.0, '#138808');

	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, width, height);

	// Very soft cloth-like wave overlay using alpha
	const waveAmplitude = 18;
	const waveFrequency = 0.02;
	const stripeHeight = 6;

	ctx.save();
	ctx.globalAlpha = 0.12;
	ctx.fillStyle = '#FFFFFF';

	for (let y = 0; y < height; y += stripeHeight) {
		const offset = Math.sin(waveFrequency * y + phase) * waveAmplitude;
		ctx.beginPath();
		ctx.moveTo(offset, y);
		ctx.lineTo(width + offset, y + stripeHeight / 2);
		ctx.lineTo(width + offset, y + stripeHeight);
		ctx.lineTo(offset, y + stripeHeight / 2);
		ctx.closePath();
		ctx.fill();
	}

	ctx.restore();
}

function drawAshokChakra(frameIndex) {
	const chakraX = width - 220;
	const chakraY = height / 2;
	const chakraRadiusOuter = 80;
	const chakraRadiusInner = 70;
	const chakraSpokes = 24;
	const chakraAngle = frameIndex * 0.04;

	ctx.save();
	ctx.translate(chakraX, chakraY);
	ctx.rotate(chakraAngle);

	// Outer circle
	ctx.beginPath();
	ctx.lineWidth = 4;
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

function createTextGradient(frameIndex) {
	const hueBase = (frameIndex * 3) % 360;
	const gradient = ctx.createLinearGradient(paddingLeft, 0, width / 2, 0);

	gradient.addColorStop(0, `hsl(${hueBase}, 90%, 30%)`);
	gradient.addColorStop(0.5, `hsl(${(hueBase + 40) % 360}, 95%, 45%)`);
	gradient.addColorStop(1, `hsl(${(hueBase + 80) % 360}, 90%, 55%)`);

	return gradient;
}

function drawTypingFrame(lineIndex, charIndex, frameIndex) {
	ctx.clearRect(0, 0, width, height);

	// Background
	drawTriColorBackground(frameIndex);

	// Chakra on the right
	drawAshokChakra(frameIndex);

	// Text styling
	ctx.fillStyle = createTextGradient(frameIndex);
	ctx.shadowColor = 'rgba(0,0,0,0.35)';
	ctx.shadowBlur = 12;
	ctx.shadowOffsetX = 2;
	ctx.shadowOffsetY = 2;

	for (let j = 0; j <= lineIndex; j++) {
		const y = paddingTop + j * lineHeight;

		// Subtle fade-in for the current line
		const alpha = j === lineIndex ? Math.min(1, charIndex / 10) : 1;
		ctx.globalAlpha = alpha;

		const showCursor = frameIndex % cursorBlinkPeriod < cursorBlinkPeriod / 2;
		const isCurrentLine = j === lineIndex;
		const fullText = lines[j];

		const visibleText = isCurrentLine
			? fullText.substring(0, charIndex) + (showCursor && charIndex <= fullText.length ? cursorChar : '')
			: fullText;

		ctx.fillText(visibleText, paddingLeft, y);

		// Subtle sparkle at typing position
		if (isCurrentLine && charIndex < fullText.length) {
			const typedWidth = ctx.measureText(fullText.substring(0, charIndex)).width;
			const sparkleX = paddingLeft + typedWidth + 6;
			const sparkleY = y - fontSize / 3;

			const sparkleHue = (frameIndex * 5 + j * 40) % 360;
			ctx.save();
			ctx.globalAlpha = 0.9;
			ctx.fillStyle = `hsl(${sparkleHue}, 100%, 70%)`;
			ctx.beginPath();
			ctx.arc(sparkleX, sparkleY, 4, 0, 2 * Math.PI);
			ctx.fill();
			ctx.restore();
		}
	}

	// Reset for next frame
	ctx.globalAlpha = 1;
}

function drawFinalFrame() {
	ctx.clearRect(0, 0, width, height);

	// Strong but clean tricolor base
	const finalBg = ctx.createLinearGradient(0, 0, width, height);
	finalBg.addColorStop(0, '#FF9933');
	finalBg.addColorStop(0.5, '#FFFFFF');
	finalBg.addColorStop(1, '#138808');
	ctx.fillStyle = finalBg;
	ctx.fillRect(0, 0, width, height);

	// Soft golden radial burst from center-left
	const burstGradient = ctx.createRadialGradient(
		width * 0.25,
		height / 2,
		0,
		width * 0.25,
		height / 2,
		width * 0.8
	);
	burstGradient.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
	burstGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
	ctx.fillStyle = burstGradient;
	ctx.fillRect(0, 0, width, height);

	// Chakra on the right, static
	drawAshokChakra(0);

	// Final text
	const finalTextGradient = ctx.createLinearGradient(paddingLeft, 0, width / 2, 0);
	finalTextGradient.addColorStop(0, '#000040');
	finalTextGradient.addColorStop(1, '#1E90FF');
	ctx.fillStyle = finalTextGradient;

	ctx.shadowColor = 'rgba(0,0,0,0.45)';
	ctx.shadowBlur = 14;
	ctx.shadowOffsetX = 3;
	ctx.shadowOffsetY = 3;

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

	// Hold completed line for a few frames before moving to next line
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
