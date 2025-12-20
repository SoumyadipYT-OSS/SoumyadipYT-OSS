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
	'A developer from India 🇮🇳',
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
	// Classic horizontal flag with smoother, more "cloth-like" waves
	const bandHeight = height / 3;
	const phase = frameIndex * 0.04;
	const waveAmplitude = 12;
	const waveLength = 180;
	const xStep = 6;

	// Solid base bands
	ctx.fillStyle = '#FF9933';
	ctx.fillRect(0, 0, width, bandHeight);

	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, bandHeight, width, bandHeight);

	ctx.fillStyle = '#138808';
	ctx.fillRect(0, bandHeight * 2, width, bandHeight);

	// Global soft vignette to keep focus on center area
	const vignette = ctx.createRadialGradient(
		width / 2,
		height / 2,
		height / 4,
		width / 2,
		height / 2,
		width
	);
	vignette.addColorStop(0, 'rgba(0,0,0,0)');
	vignette.addColorStop(1, 'rgba(0,0,0,0.25)');
	ctx.fillStyle = vignette;
	ctx.fillRect(0, 0, width, height);

	// Band-specific wave highlights/shadows
	ctx.save();
	ctx.globalAlpha = 0.18;

	// Helper to draw a single wavy strip
	const drawWaveStrip = (yOffset, color, phaseOffset, amplitudeMultiplier) => {
		ctx.fillStyle = color;
		ctx.beginPath();
		for (let x = 0; x <= width; x += xStep) {
			const wave =
				Math.sin((x / waveLength) * 2 * Math.PI + phase + phaseOffset) *
				waveAmplitude *
				amplitudeMultiplier;
			const y = yOffset + wave;
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
	drawWaveStrip(
		bandHeight * 0.25,
		'rgba(255, 255, 255, 0.65)',
		0,
		1.0
	);

	// Middle band subtle shading
	drawWaveStrip(
		bandHeight * 1.25,
		'rgba(0, 0, 0, 0.18)',
		Math.PI / 3,
		0.8
	);

	// Bottom band highlight
	drawWaveStrip(
		bandHeight * 2.4,
		'rgba(255, 255, 255, 0.4)',
		Math.PI / 2,
		1.1
	);

	ctx.restore();
}

function drawAshokChakra(frameIndex) {
	const chakraX = width - 230;
	const chakraY = height / 2;
	const chakraRadiusOuter = 78;
	const chakraRadiusInner = 68;
	const chakraSpokes = 24;
	const chakraAngle = frameIndex * 0.035;

	ctx.save();
	ctx.translate(chakraX, chakraY);
	ctx.rotate(chakraAngle);

	// Outer glow ring
	const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, chakraRadiusOuter * 1.4);
	glowGradient.addColorStop(0, 'rgba(0, 0, 128, 0.6)');
	glowGradient.addColorStop(1, 'rgba(0, 0, 128, 0)');
	ctx.fillStyle = glowGradient;
	ctx.beginPath();
	ctx.arc(0, 0, chakraRadiusOuter * 1.4, 0, 2 * Math.PI);
	ctx.fill();

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
		const inner = chakraRadiusInner * 0.15;
		ctx.beginPath();
		ctx.moveTo(inner * Math.cos(angle), inner * Math.sin(angle));
		ctx.lineTo(chakraRadiusInner * Math.cos(angle), chakraRadiusInner * Math.sin(angle));
		ctx.stroke();
	}

	// Center hub
	ctx.beginPath();
	ctx.fillStyle = '#000080';
	ctx.arc(0, 0, 7, 0, 2 * Math.PI);
	ctx.fill();

	ctx.restore();
}

function createTextGradient(frameIndex) {
	const hueBase = (frameIndex * 2.5) % 360;
	const gradient = ctx.createLinearGradient(paddingLeft, 0, width / 2.2, 0);

	gradient.addColorStop(0, `hsl(${hueBase}, 85%, 30%)`);
	gradient.addColorStop(0.45, `hsl(${(hueBase + 35) % 360}, 95%, 45%)`);
	gradient.addColorStop(1, `hsl(${(hueBase + 75) % 360}, 90%, 55%)`);

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
	ctx.shadowBlur = 10;
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

			const sparkleHue = (frameIndex * 4 + j * 35) % 360;
			ctx.save();
			ctx.globalAlpha = 0.85;
			ctx.fillStyle = `hsl(${sparkleHue}, 100%, 70%)`;
			ctx.beginPath();
			ctx.arc(sparkleX, sparkleY, 3.5, 0, 2 * Math.PI);
			ctx.fill();
			ctx.restore();
		}
	}

	// Reset for next frame
	ctx.globalAlpha = 1;
}

function drawFinalFrame() {
	ctx.clearRect(0, 0, width, height);

	// Static classic horizontal tricolor
	const bandHeight = height / 3;

	ctx.fillStyle = '#FF9933';
	ctx.fillRect(0, 0, width, bandHeight);

	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, bandHeight, width, bandHeight);

	ctx.fillStyle = '#138808';
	ctx.fillRect(0, bandHeight * 2, width, bandHeight);

	// Gentle global glow
	const burstGradient = ctx.createRadialGradient(
		width * 0.28,
		height / 2,
		0,
		width * 0.28,
		height / 2,
		width * 0.9
	);
	burstGradient.addColorStop(0, 'rgba(255, 215, 0, 0.35)');
	burstGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
	ctx.fillStyle = burstGradient;
	ctx.fillRect(0, 0, width, height);

	// Chakra on the right, static
	drawAshokChakra(0);

	// Final text
	const finalTextGradient = ctx.createLinearGradient(paddingLeft, 0, width / 2.2, 0);
	finalTextGradient.addColorStop(0, '#000033');
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
