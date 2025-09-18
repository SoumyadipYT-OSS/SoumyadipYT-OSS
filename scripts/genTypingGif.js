/**
 * প্রয়োজনীয় প্যাকেজ: canvas, gifencoder
 * npm install canvas gifencoder
 */
const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');
const fs = require('fs');

const text = "Hi There! 👋 नमस्ते! 🙏 I'm Soumyadip Majumder! चलो साथ में कोड लिखें! 🚀 চল কোডিং-এ স্বপ্নকে জীবন্ত করি! ✨";
const width = 800;
const height = 120;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
ctx.font = '48px Orbitron, sans-serif';
ctx.fillStyle = '#00E5FF';

const encoder = new GIFEncoder(width, height);
encoder.createReadStream().pipe(fs.createWriteStream('assets/typing.gif'));
encoder.start();
encoder.setRepeat(0);    // 0 = loop forever
encoder.setDelay(100);   // 100ms per frame
encoder.setQuality(10);  // 10 = high quality

for (let i = 1; i <= text.length; i++) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillText(text.substring(0, i), 10, 75);
  encoder.addFrame(ctx);
}

encoder.finish();
console.log('typing.gif generated in assets/');
