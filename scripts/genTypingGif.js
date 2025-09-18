const fs = require('fs');
const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');

// Ensure assets directory exists
const outDir = 'assets';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Text content (refined, less emoji-heavy)
const text = "Hi, I'm Soumyadip Majumder — Bengali-first systems architect. Let's build modular, multilingual onboarding together.";
const width = 1000;
const height = 160;
const fontSize = 42;
const cursorChar = '|';

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Gradient background
const bgGradient = ctx.createLinearGradient(0, 0, width, height);
bgGradient.addColorStop(0, '#0f0c29');
bgGradient.addColorStop(0.5, '#302b63');
bgGradient.addColorStop(1, '#24243e');

// Gradient text fill
const textGradient = ctx.createLinearGradient(0, 0, width, 0);
textGradient.addColorStop(0, '#00E5FF');
textGradient.addColorStop(0.5, '#FF00C8');
textGradient.addColorStop(1, '#FFD700');

// GIF encoder setup
const encoder = new GIFEncoder(width, height);
encoder.createReadStream().pipe(fs.createWriteStream(`${outDir}/typing.gif`));
encoder.start();
encoder.setRepeat(0);
encoder.setDelay(100);
encoder.setQuality(10);

// Typing animation
for (let i = 1; i <= text.length; i++) {
  ctx.clearRect(0, 0, width, height);

  // Background fill
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Text setup
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = textGradient;
  ctx.shadowColor = '#00FFFF';
  ctx.shadowBlur = 12;

  // Draw text with cursor
  const displayText = text.substring(0, i) + cursorChar;
  ctx.fillText(displayText, 40, 100);

  encoder.addFrame(ctx);
}

// Final frame without cursor
ctx.clearRect(0, 0, width, height);
ctx.fillStyle = bgGradient;
ctx.fillRect(0, 0, width, height);

ctx.font = `${fontSize}px sans-serif`;
ctx.fillStyle = textGradient;
ctx.shadowColor = '#00FFFF';
ctx.shadowBlur = 12;
ctx.fillText(text, 40, 100);

encoder.addFrame(ctx);
encoder.finish();

console.log('typing.gif generated with futuristic gradient!');
