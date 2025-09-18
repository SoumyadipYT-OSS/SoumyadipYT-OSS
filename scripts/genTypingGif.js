const fs = require('fs');
const { createCanvas, registerFont } = require('canvas');
const GIFEncoder = require('gifencoder');

// Load Orbitron font (make sure it's in fonts/Orbitron-Regular.ttf)
registerFont('./fonts/Orbitron-Regular.ttf', { family: 'Orbitron' });

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
const height = 240;
const fontSize = 42;
const lineHeight = 60;
const cursorChar = '|';

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// GIF encoder setup
const encoder = new GIFEncoder(width, height);
encoder.createReadStream().pipe(fs.createWriteStream(`${outDir}/typing.gif`));
encoder.start();
encoder.setRepeat(0);
encoder.setDelay(100);
encoder.setQuality(10);

// Typing animation with all effects
ctx.font = `${fontSize}px Orbitron`;

for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
  const line = lines[lineIndex];
  for (let i = 1; i <= line.length; i++) {
    ctx.clearRect(0, 0, width, height);

    // Animated background gradient (changes per frame)
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    const shift = (lineIndex * 10 + i) % 100 / 100;
    bgGradient.addColorStop(0, `hsl(${(shift * 360)}, 60%, 15%)`);
    bgGradient.addColorStop(0.5, `hsl(${(shift * 360 + 60)}, 60%, 20%)`);
    bgGradient.addColorStop(1, `hsl(${(shift * 360 + 120)}, 60%, 25%)`);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Text glow pulse
    const glow = 8 + Math.sin(i / 2) * 4;
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = glow;

    // Text gradient fill
    const textGradient = ctx.createLinearGradient(0, 0, width, 0);
    textGradient.addColorStop(0, '#00E5FF');
    textGradient.addColorStop(0.5, '#FF00C8');
    textGradient.addColorStop(1, '#FFD700');
    ctx.fillStyle = textGradient;

    // Bengali line fade-in
    for (let j = 0; j <= lineIndex; j++) {
      const y = 80 + j * lineHeight;
      const alpha = j === lineIndex ? Math.min(1, i / 10) : 1;
      ctx.globalAlpha = alpha;

      const showCursor = i % 6 < 3;
      const displayText = j === lineIndex
        ? lines[j].substring(0, i) + (showCursor ? cursorChar : '')
        : lines[j];

      ctx.fillText(displayText, 40, y);
    }

    encoder.addFrame(ctx);
  }
}

// Final frame without cursor
ctx.clearRect(0, 0, width, height);
const finalBg = ctx.createLinearGradient(0, 0, width, height);
finalBg.addColorStop(0, '#1a1a2e');
finalBg.addColorStop(0.5, '#16213e');
finalBg.addColorStop(1, '#0f3460');
ctx.fillStyle = finalBg;
ctx.fillRect(0, 0, width, height);

ctx.shadowColor = '#00FFFF';
ctx.shadowBlur = 12;
ctx.fillStyle = textGradient;
ctx.globalAlpha = 1;

for (let j = 0; j < lines.length; j++) {
  const y = 80 + j * lineHeight;
  ctx.fillText(lines[j], 40, y);
}

encoder.addFrame(ctx);
encoder.finish();

console.log('Bengali-English cinematic GIF generated in assets/');
