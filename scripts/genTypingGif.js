const fs = require('fs');
const { createCanvas, registerFont } = require('canvas');
const GIFEncoder = require('gifencoder');

// Load Orbitron font
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
  "A developer from India 🇮🇳 & Bengali-first educator",
  "Contributor onboarding starts here"
];

const width = 1200;
const height = 360;
const fontSize = 42;
const lineHeight = 70;
const cursorChar = '⚛'; // Chakra-inspired cursor

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

    // 🇮🇳 Realistic waving tricolor background
    const waveAmplitude = 30;
    const waveFrequency = 0.05;
    const wavePhase = i / 5;
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);

    for (let y = 0; y <= height; y += 10) {
      const offset = Math.sin(waveFrequency * y + wavePhase) * waveAmplitude;
      const color = y < height / 3
        ? '#FF9933'   // Saffron
        : y < (2 * height) / 3
        ? '#FFFFFF'   // White
        : '#138808';  // Green
      bgGradient.addColorStop(y / height, color);
    }

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Ashok Chakra-inspired animated text gradient
    const chakraHue = (i * 8) % 360;
    const textGradient = ctx.createLinearGradient(0, 0, width, 0);
    textGradient.addColorStop(0, `hsl(${chakraHue}, 100%, 30%)`);
    textGradient.addColorStop(1, `hsl(${(chakraHue + 60) % 360}, 100%, 40%)`);
    ctx.fillStyle = textGradient;

    // Rotational shimmer glow
    ctx.shadowColor = `hsl(${(chakraHue + 180) % 360}, 100%, 50%)`;
    ctx.shadowBlur = 12 + Math.cos(i / 3) * 6;

    // Line-by-line typing with chakra cursor
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

// Final frame with golden burst
ctx.clearRect(0, 0, width, height);
const finalBg = ctx.createLinearGradient(0, 0, width, height);
finalBg.addColorStop(0, '#FF9933');
finalBg.addColorStop(0.5, '#FFFFFF');
finalBg.addColorStop(1, '#138808');
ctx.fillStyle = finalBg;
ctx.fillRect(0, 0, width, height);

// Radial burst behind text
const burstGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
burstGradient.addColorStop(0, '#FFD700');
burstGradient.addColorStop(1, 'transparent');
ctx.fillStyle = burstGradient;
ctx.fillRect(0, 0, width, height);

ctx.shadowColor = '#000080'; // Chakra blue
ctx.shadowBlur = 16;
ctx.globalAlpha = 1;

// Final text gradient
const finalTextGradient = ctx.createLinearGradient(0, 0, width, 0);
finalTextGradient.addColorStop(0, '#000080');
finalTextGradient.addColorStop(1, '#1E90FF');
ctx.fillStyle = finalTextGradient;

for (let j = 0; j < lines.length; j++) {
  const y = 100 + j * lineHeight;
  ctx.fillText(lines[j], 40, y);
}

encoder.addFrame(ctx);
encoder.finish();

console.log('Tricolor cinematic typing.gif generated in assets/');
