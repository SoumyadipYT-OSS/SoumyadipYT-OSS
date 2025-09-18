const fs = require('fs');
const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');

// Ensure assets directory exists
const outDir = 'assets';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Multilingual onboarding lines
const lines = [
  "Hi, I'm Soumyadip Majumder 👨‍💻",
  "Inventive backend developer & Bengali-first educator 🌐",
  "চলো কোডিং দিয়ে স্বপ্নকে বাস্তব করি ✨",
  "Contributor onboarding starts here 🚀"
];

const width = 1200;
const height = 200;
const fontSize = 40;
const lineHeight = 60;
const cursorChar = '|';

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Background gradient
const bgGradient = ctx.createLinearGradient(0, 0, width, height);
bgGradient.addColorStop(0, '#1a1a2e');
bgGradient.addColorStop(0.5, '#16213e');
bgGradient.addColorStop(1, '#0f3460');

// Text gradient
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

// Typing animation line by line
ctx.font = `${fontSize}px sans-serif`;
ctx.shadowColor = '#00FFFF';
ctx.shadowBlur = 12;

for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
  const line = lines[lineIndex];
  for (let i = 1; i <= line.length; i++) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = textGradient;
    for (let j = 0; j <= lineIndex; j++) {
      const y = 80 + j * lineHeight;
      const displayText = j === lineIndex
        ? lines[j].substring(0, i) + cursorChar
        : lines[j];
      ctx.fillText(displayText, 40, y);
    }

    encoder.addFrame(ctx);
  }
}

// Final frame without cursor
ctx.clearRect(0, 0, width, height);
ctx.fillStyle = bgGradient;
ctx.fillRect(0, 0, width, height);

ctx.fillStyle = textGradient;
for (let j = 0; j < lines.length; j++) {
  const y = 80 + j * lineHeight;
  ctx.fillText(lines[j], 40, y);
}
encoder.addFrame(ctx);

encoder.finish();
console.log('Bengali-English onboarding GIF generated!');
