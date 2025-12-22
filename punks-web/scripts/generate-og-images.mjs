// scripts/generate-og-images.cjs
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const VOID = '#0B0E27';
const CYAN = '#00D9FF';
const MAGENTA = '#FF00FF';
const GOLD = '#D4AF37';
const TEXT = '#E3E3E3';

function drawBase(ctx, width, height) {
  const grd = ctx.createLinearGradient(0, 0, width, height);
  grd.addColorStop(0, '#050712');
  grd.addColorStop(1, '#0B0E27');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(0,217,255,0.15)';
  ctx.lineWidth = 1;
  const spacing = 80;
  for (let x = 0; x < width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(0,217,255,0.03)';
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1);
  }
}

function drawChromeBand(ctx, width, height) {
  const bandH = Math.floor(height * 0.12);
  const bandY = Math.floor(height * 0.76);

  for (let i = 0; i < bandH; i++) {
    const t = i / (bandH - 1);
    const stops = [
      [0.0, [168, 169, 173]],
      [0.2, [227, 227, 227]],
      [0.45, [192, 192, 195]],
      [0.65, [227, 227, 227]],
      [1.0, [168, 169, 173]],
    ];
    let col = stops[stops.length - 1][1];
    for (let j = 0; j < stops.length - 1; j++) {
      const [p0, c0] = stops[j];
      const [p1, c1] = stops[j + 1];
      if (t >= p0 && t <= p1) {
        const u = (t - p0) / (p1 - p0);
        col = [
          Math.round(c0[0] * (1 - u) + c1[0] * u),
          Math.round(c0[1] * (1 - u) + c1[1] * u),
          Math.round(c0[2] * (1 - u) + c1[2] * u),
        ];
        break;
      }
    }
    ctx.strokeStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
    ctx.beginPath();
    ctx.moveTo(0, bandY + i);
    ctx.lineTo(width, bandY + i);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.fillRect(0, bandY, width, bandH);
}

function drawNodeRing(ctx, width, height, accentColor) {
  const cx = Math.floor(width * 0.78);
  const cy = Math.floor(height * 0.33);
  const r = Math.floor(Math.min(width, height) * 0.18);

  ctx.save();
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.3);
  grad.addColorStop(0, accentColor.replace('1)', '0.6)'));
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  const segs = 18;
  for (let i = 0; i < segs; i++) {
    const a0 = (2 * Math.PI / segs) * i;
    const a1 = a0 + (2 * Math.PI / segs) * 0.6;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
}

function drawGlowText(ctx, text, x, y, fontSize, accentColor) {
  ctx.font = `900 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.textBaseline = 'top';

  const glowLevels = [
    { offset: 6, alpha: 0.13 },
    { offset: 4, alpha: 0.22 },
    { offset: 2, alpha: 0.36 },
  ];

  glowLevels.forEach(({ offset, alpha }) => {
    ctx.fillStyle = accentColor.replace('1)', `${alpha})`);
    ctx.fillText(text, x + offset, y);
    ctx.fillText(text, x - offset, y);
    ctx.fillText(text, x, y + offset);
    ctx.fillText(text, x, y - offset);
  });

  ctx.fillStyle = TEXT;
  ctx.fillText(text, x, y);
}

function makeImage(width, height, title, subtitle) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  drawBase(ctx, width, height);
  drawChromeBand(ctx, width, height);
  drawNodeRing(ctx, width, height, 'rgba(0,217,255,1)');

  const titleX = Math.floor(width * 0.08);
  const titleY = Math.floor(height * 0.18);

  drawGlowText(ctx, title, titleX, titleY, Math.floor(height * 0.14), 'rgba(0,217,255,1)');

  if (subtitle && subtitle.trim()) {
    ctx.font = `500 ${Math.floor(height * 0.055)}px system-ui, sans-serif`;
    ctx.fillStyle = 'rgb(168,169,173)';
    ctx.fillText(subtitle, titleX, titleY + Math.floor(height * 0.17));
  }

  const barY = Math.floor(height * 0.62);
  const barW = Math.floor(width * 0.04);
  const barH = Math.floor(height * 0.015);
  const spacing = Math.floor(width * 0.055);
  const colors = [CYAN, MAGENTA, '#00FF00', GOLD];

  colors.forEach((c, i) => {
    const x = titleX + i * spacing;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.roundRect(x, barY, barW, barH, 6);
    ctx.fill();
  });

  return canvas;
}

function savePng(canvas, name) {
  const outPath = path.join('public', name);
  const out = fs.createWriteStream(outPath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => console.log(`Saved ${outPath}`));
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

savePng(
  makeImage(1200, 630, 'THE CYPHERS', 'Privacy is punk • Inscribed on Dogecoin'),
  'opengraph-image.png'
);

savePng(
  makeImage(1200, 675, 'THE CYPHERS', 'Encrypted identities for builders'),
  'twitter-image.png'
);

savePng(
  makeImage(1080, 1080, 'THE CYPHERS', 'punks.24hrmvp.xyz'),
  'og-square.png'
);

savePng(makeImage(512, 512, 'C', ''), 'icon-512.png');
savePng(makeImage(192, 192, 'C', ''), 'icon-192.png');
