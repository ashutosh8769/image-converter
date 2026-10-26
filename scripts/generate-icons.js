const sharp = require('sharp');
const path = require('path');

async function createIcon(size, filename) {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6366f1" />
          <stop offset="50%" stop-color="#4f46e5" />
          <stop offset="100%" stop-color="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#grad)" />
      <text x="50%" y="58%" font-size="${Math.round(size * 0.42)}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">OC</text>
    </svg>
  `;

  const outPath = path.join(__dirname, '..', 'public', filename);
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log('Generated icon:', outPath);
}

Promise.all([
  createIcon(192, 'icon-192.png'),
  createIcon(512, 'icon-512.png'),
  createIcon(64, 'favicon.png'),
]).then(() => console.log('All icons generated successfully!'));
