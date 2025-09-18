const fs = require('fs');
const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');

// Ensure assets directory exists
const outDir = 'assets';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Typing text
const text = "Hi There! 👋 नमस्ते! 🙏 I'm Soumyadip Majumder! चलो साथ में कोड लिखें! 🚀 চল কোডিং-এ স্বপ্নকে জীবন্ত করি! ✨";
const width = 800;
const height = 120;
const fontSize = 48;
const cursorChar = '|'; // Blinking cursor

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Gradient fill setup
const gradient = ctx.createLinearGradient(0, 0, width, 0);
gradient.addColorStop(0, '#00E5FF');
gradient.addColorStop(0.5, '#00FFC2');
gradient.addColorStop(1, '#00FFFF');

// Font setup
ctx.font = `${fontSize}px sans-serif`;
ctx.fillStyle = gradient;

// GIF encoder setup
const encoder = new GIFEncoder(width, height);
encoder.createReadStream().pipe(fs.createWriteStream(`${outDir}/typing.gif`));
encoder.start();
encoder.setRepeat(0);
encoder.setDelay(100);
encoder.setQuality(10);

// Typing animation with fade-in and cursor
for (let i = 1; i <= text.length; i++) {
  ctx.clearRect(0, 0, width, height);

  // Optional fade-in effect
  const alpha = Math.min(1, i / 10);
  ctx.globalAlpha = alpha;

  // Draw text with cursor
  const displayText = text.substring(0, i) + cursorChar;
  ctx.fillText(displayText, 10, 75);

  encoder.addFrame(ctx);
}

// Final frame without cursor
ctx.clearRect(0, 0, width, height);
ctx.globalAlpha = 1;
ctx.fillText(text, 10, 75);
encoder.addFrame(ctx);

encoder.finish();
console.log('✅ typing.gif generated in assets/');
