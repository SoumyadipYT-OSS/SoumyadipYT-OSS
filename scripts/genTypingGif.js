const fs = require('fs');
const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');

// Ensure assets directory exists
const outDir = 'assets';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const text = "Hi There! 👋 नमस्ते! 🙏 I'm Soumyadip Majumder! चलो साथ में कोड लिखें! 🚀 চল কোডিং-এ স্বপ্নকে জীবন্ত করি! ✨";
const width = 800;
const height = 120;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
ctx.font = '48px sans-serif';         // 시스템-ডিপেনডেন্ট ফন্ট ব্যবহার করুন
ctx.fillStyle = '#00E5FF';

const encoder = new GIFEncoder(width, height);
encoder.createReadStream().pipe(fs.createWriteStream(`${outDir}/typing.gif`));
encoder.start();
encoder.setRepeat(0);
encoder.setDelay(100);
encoder.setQuality(10);

for (let i = 1; i <= text.length; i++) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillText(text.substring(0, i), 10, 75);
  encoder.addFrame(ctx);
}

encoder.finish();
console.log('typing.gif generated in assets/');
