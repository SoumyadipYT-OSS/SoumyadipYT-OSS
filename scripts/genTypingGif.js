const fs = require('fs');
const { createCanvas, registerFont, loadImage } = require('canvas');
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
const cursorChar = '⚛';

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

    // 🇮🇳 Realistic cloth wave background
    const waveAmplitude = 30;
    const waveFrequency = 0.05;
    const wavePhase = i / 5;
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);

    for (let y = 0; y <= height; y += 10) {
      const offset = Math.sin(waveFrequency * y + wavePhase) * waveAmplitude;
      const color = y < height / 3
        ? '#FF9933'
        : y < (2 * height) / 3
        ? '#FFFFFF'
        : '#138808';
      bgGradient.addColorStop(y / height, color);
    }

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Rotating Ashok Chakra behind text
    const chakraX = width / 2;
    const chakraY = height / 2;
    const chakraRadius = 60;
    const chakraSpokes = 24;
    const chakraAngle = i * 0.05;

    ctx.save();
    ctx.translate(chakraX, chakraY);
    ctx.rotate(chakraAngle);
    ctx.strokeStyle = '#000080';
    ctx.lineWidth = 2;
    for (let s = 0; s < chakraSpokes; s++) {
      const angle = (2 * Math.PI * s) / chakraSpokes;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(chakraRadius * Math.cos(angle), chakraRadius * Math.sin(angle));
      ctx.stroke();
    }
    ctx.restore();

    // Particle trail for character reveal
    const chakraHue = (i * 8) % 360;
    ctx.shadowColor = `hsl(${chakraHue}, 100%, 50%)`;
    ctx.shadowBlur = 12 + Math.cos(i / 3) * 6;

    const textGradient = ctx.createLinearGradient(0, 0, width, 0);
    textGradient.addColorStop(0, `hsl(${chakraHue}, 100%, 30%)`);
    textGradient.addColorStop(1, `hsl(${(chakraHue + 60) % 360}, 100%, 40%)`);
    ctx.fillStyle = textGradient;

    for (let j = 0; j <= lineIndex; j++) {
      const y = 100 + j * lineHeight;
      const alpha = j === lineIndex ? Math.min(1, i / 10) : 1;
      ctx.globalAlpha = alpha;

      const showCursor = i % 6 < 3;
      const displayText = j === lineIndex
        ? lines[j].substring(0, i) + (showCursor ? cursorChar : '')
        : lines[j];

      ctx.fillText(displayText, 40, y);

      // Particle sparkle trail
      if (j === lineIndex && i < lines[j].length) {
        const sparkleX = 40 + ctx.measureText(lines[j].substring(0, i)).width;
        const sparkleY = y - 10;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 4, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${(chakraHue + 120) % 360}, 100%, 70%)`;
        ctx.fill();
      }
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

// Radial burst
const burstGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
burstGradient.addColorStop(0, '#FFD700');
burstGradient.addColorStop(1, 'transparent');
ctx.fillStyle = burstGradient;
ctx.fillRect(0, 0, width, height);

// Chakra glow
ctx.shadowColor = '#000080';
ctx.shadowBlur = 16;
ctx.globalAlpha = 1;

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
