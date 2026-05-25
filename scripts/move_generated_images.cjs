const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\maihu\\.gemini\\antigravity\\brain\\e4fa7177-19fc-470d-9ec7-f68077ee6ac2';
const IMAGES_DIR = path.resolve(__dirname, '../public/images');

const slug = process.argv[2];
const imageName = process.argv[3] || slug.replace(/-/g, '_');

if (!slug) {
  console.error('Usage: node scripts/move_generated_images.cjs [slug] [imageName]');
  process.exit(1);
}

if (!fs.existsSync(ARTIFACTS_DIR)) {
  console.error(`Artifacts directory does not exist: ${ARTIFACTS_DIR}`);
  process.exit(1);
}

// Find all matching pngs in the artifacts directory
const files = fs.readdirSync(ARTIFACTS_DIR);
const matches = files.filter(f => f.startsWith(imageName) && f.endsWith('.png'));

if (matches.length === 0) {
  console.error(`No generated image found for name: ${imageName} in ${ARTIFACTS_DIR}`);
  process.exit(1);
}

// Get the latest one based on file birthtime/mtime
const latestFile = matches.map(f => {
  const filePath = path.join(ARTIFACTS_DIR, f);
  const stats = fs.statSync(filePath);
  return { file: f, path: filePath, time: stats.mtimeMs };
}).sort((a, b) => b.time - a.time)[0];

const targetPath = path.join(IMAGES_DIR, `${slug}.png`);
fs.copyFileSync(latestFile.path, targetPath);
console.log(`Successfully copied ${latestFile.file} to public/images/${slug}.png`);
