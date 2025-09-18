const fs = require('fs');
const { createCanvas, registerFont } = require('canvas');
const GIFEncoder = require('gifencoder');

// Load Orbitron font if available
const fontPath = './fonts/Orbitron-Regular.ttf';
const fontFamily = fs.existsSync(fontPath) ? 'Orbitron' : 'sans-serif';
if (fs.existsSync(fontPath)) {
  registerFont(fontPath, { family: 'Orbitron' });
  console.log('Orbitron font loaded');
} else {
  console.warn('Orbitron font not found, using sans-serif fallback');
}

// Ensure assets directory exists
const outDir = 'assets';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Typing lines
const lines = [
  "Hi, I'm Soumyadip Majumder 👨‍💻",
  "A developer from India & Bengali-first educator 🌐",
  "Contributor onboarding starts here 🚀"
];

const width = 1200;
const height = 360; // Increased height for better spacing
const fontSize = 42;
const lineHeight = 70;
const cursorChar = '⎸'; // Sleek cursor

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// GIF encoder setup
const encoder = new GIFEncoder(width, height);
encoder.createReadStream().pipe(fs.createWriteStream(`${outDir}/typing.gif`));
encoder.start();
encoder.setRepeat(0);
encoder.setDelay(100);
encoder.setQuality(10);

// Set base font
ctx.font = `${fontSize}px ${fontFamily}`;

// Typing animation
for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
  const line = lines[lineIndex];
  for (let i = 1; i <= line.length; i++) {
    ctx.clearRect(0, 0, width, height);

    // Animated background gradient
    const shift = (lineIndex * 10 + i) % 360;
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, `hsl(${shift}, 60%, 15%)`);
    bgGradient.addColorStop(0.5, `hsl(${(shift + 60) % 360}, 60%, 20%)`);
    bgGradient.addColorStop(1, `hsl(${(shift + 120) % 360}, 60%, 25%)`);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Animated text gradient
    const textGradient = ctx.createLinearGradient(0, 0, width, 0);
    textGradient.addColorStop(0, `hsl(${(shift + 180) % 360}, 100%, 60%)`);
    textGradient.addColorStop(1, `hsl(${(shift + 240) % 360}, 100%, 60%)`);
    ctx.fillStyle = textGradient;

    // Pulsing glow
    ctx.shadowColor = `hsl(${(shift + 300) % 360}, 100%, 50%)`;
    ctx.shadowBlur = 10 + Math.sin(i / 2) * 6;

    // Line-by-line typing with blinking cursor
    for (let j = 0; j <= lineIndex; j++) {
      const y = 100 + j * lineHeight;
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

// Final frame (no cursor, full glow)
ctx.clearRect(0, 0, width, height);
const finalBg = ctx.createLinearGradient(0, 0, width, height);
finalBg.addColorStop(0, '#1a1a2e');
finalBg.addColorStop(0.5, '#16213e');
finalBg.addColorStop(1, '#0f3460');
ctx.fillStyle = finalBg;
ctx.fillRect(0, 0, width, height);

ctx.shadowColor = '#00FFFF';
ctx.shadowBlur = 14;
ctx.globalAlpha = 1;

// Final text gradient
const finalTextGradient = ctx.createLinearGradient(0, 0, width, 0);
finalTextGradient.addColorStop(0, '#00E5FF');
finalTextGradient.addColorStop(0.5, '#FF00C8');
finalTextGradient.addColorStop(1, '#FFD700');
ctx.fillStyle = finalTextGradient;

for (let j = 0; j < lines.length; j++) {
  const y = 100 + j * lineHeight;
  ctx.fillText(lines[j], 40, y);
}

encoder.addFrame(ctx);
encoder.finish();

console.log('Cinematic typing.gif generated in assets/');
