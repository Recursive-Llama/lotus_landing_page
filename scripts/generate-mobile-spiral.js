/*
 Generates raster WebP images of the desktop spiral using Puppeteer.
 Outputs: public/spiral-mobile-1200.webp, -1600.webp, -2000.webp
*/

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUTPUTS = [1200, 1600, 2000];

const HTML = ({ width, height }) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html, body { margin: 0; padding: 0; background: #0a0b10; }
    .wrap { position: relative; width: ${width}px; height: ${height}px; background: #0a0b10; }
    @keyframes rotSlow { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
  </style>
</head>
<body>
  <div class="wrap">
    ${svgMarkup(width, height)}
  </div>
</body>
</html>`;

// This SVG mirrors the desktop look (4 rings + glow via layered strokes)
function svgMarkup(width, height) {
  // Parameters match app/lib/config.ts
  const SPIRAL = { a: 1.0, b: 0.1, turns: 12.0 };
  const COLOR_STOPS = [
    { stop: 0.0, color: '#28d8c1' },
    { stop: 0.3, color: '#7a7eff' },
    { stop: 0.55, color: '#e267ff' },
    { stop: 0.75, color: '#ff6ab1' },
    { stop: 1.0, color: '#ff6a3d' },
  ];
  const cx = width / 2;
  const cy = height / 2;
  const totalTheta = Math.PI * 2 * SPIRAL.turns;
  const baseRadius = SPIRAL.a * Math.exp(SPIRAL.b * totalTheta);
  const fit = 0.62;
  const pixelScale = (Math.min(width, height) * fit) / baseRadius;
  const gradientStops = COLOR_STOPS.map((s) => `<stop offset="${s.stop * 100}%" stop-color="${s.color}" />`).join('');

  function makePath(offset) {
    const step = 0.010;
    const pts = [];
    const targetPx = 0.4;
    const tStart = Math.log(targetPx / (SPIRAL.a * pixelScale)) / SPIRAL.b;
    for (let t = tStart; t <= totalTheta; t += step) {
      const r = SPIRAL.a * Math.exp(SPIRAL.b * t) * pixelScale * (1.0 - offset * 0.04);
      const x = cx + r * Math.cos(t);
      const y = cy + r * Math.sin(t);
      pts.push(`${x},${y}`);
    }
    return `M ${pts.join(' L ')}`;
  }

  const paths = Array.from({ length: 4 }, (_, i) => makePath(i));
  const layers = paths.map((p, i) => (
    `<g opacity="${(0.48 - i * 0.10).toFixed(2)}">`+
    `<path d="${p}" stroke="url(#grad)" stroke-opacity="0.14" stroke-width="${(16 - i * 2.5).toFixed(2)}" stroke-linecap="round" fill="none" />`+
    `<path d="${p}" stroke="url(#grad)" stroke-opacity="0.10" stroke-width="${(12 - i * 2).toFixed(2)}" stroke-linecap="round" fill="none" />`+
    `<path d="${p}" stroke="url(#grad)" stroke-width="${(2.2 - i * 0.15).toFixed(2)}" stroke-linecap="round" fill="none" />`+
    `</g>`
  )).join('');

  const yShift = 0; // desktop uses no mobile shift
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 ${yShift} ${width} ${height}" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">${gradientStops}</linearGradient></defs>
    <rect width="100%" height="100%" fill="#0a0b10" />
    <g>${layers}</g>
  </svg>`;
}

async function main() {
  const outDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: null, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  for (const h of OUTPUTS) {
    const w = Math.round(h * 0.5625) * 2; // generous width for cover; 16:9 *2 scaling
    const html = HTML({ width: w, height: h });
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'load' });
    const file = path.join(outDir, `spiral-mobile-${h}.webp`);
    const el = await page.$('.wrap');
    const buffer = await el.screenshot({ type: 'webp', quality: 90 });
    fs.writeFileSync(file, buffer);
    console.log('Wrote', path.relative(process.cwd(), file));
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

