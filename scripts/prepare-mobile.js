const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');

// 1. Copy hp/index.html to root index.html so Capacitor loads the game directly
const hpIndex = path.join(outDir, 'hp', 'index.html');
const rootIndex = path.join(outDir, 'index.html');
if (fs.existsSync(hpIndex)) {
  fs.copyFileSync(hpIndex, rootIndex);
  console.log('Copied hp/index.html -> index.html (game = home page)');
}

// 2. Remove non-game assets to reduce app size
const removePaths = ['models', 'file.svg', 'globe.svg', 'next.svg', 'vercel.svg', 'window.svg'];
for (const p of removePaths) {
  const fullPath = path.join(outDir, p);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true });
    console.log('Removed:', p);
  }
}

// 3. Remove non-game pages (bg remover, test3d, portfolio)
const removePages = ['bg', 'test3d'];
for (const p of removePages) {
  const fullPath = path.join(outDir, p);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true });
    console.log('Removed page:', p);
  }
}

console.log('Mobile build prepared successfully.');
