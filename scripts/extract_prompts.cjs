const fs = require('fs');
const path = require('path');

const HERBS_PATH = path.resolve(__dirname, '../src/data/herbs.js');
const TEMP_PATH = path.resolve(__dirname, 'temp_herbs.cjs');

let content = fs.readFileSync(HERBS_PATH, 'utf8');
let jsContent = content.replace('export const herbs =', 'module.exports =');
fs.writeFileSync(TEMP_PATH, jsContent, 'utf8');
const herbs = require('./temp_herbs.cjs');
fs.unlinkSync(TEMP_PATH);

const translateToEnglish = (text) => {
  if (!text) return 'botanical details';
  const dict = {
    'Rễ': 'root', 'Củ': 'root tuber', 'Lá': 'leaves', 'Hoa': 'flowers', 'Quả': 'berries',
    'Hạt': 'seeds', 'Cành': 'twigs', 'Vỏ thân': 'bark', 'Toàn cây': 'whole plant',
    'Rễ củ đã chế': 'prepared root tuber', 'Thân rễ tươi': 'fresh aromatic rhizome',
    'Vỏ quả chín phơi lâu năm': 'dried aged peel', 'Quả chín': 'ripe fruits'
  };
  return dict[text] || text;
};

// Find the ones where the image is missing in public/images/
const IMAGES_DIR = path.resolve(__dirname, '../public/images');
const pendingHerbs = herbs.filter(herb => {
  if (!herb.image) return true;
  const localImagePath = path.join(IMAGES_DIR, herb.image.replace('/images/', ''));
  return !fs.existsSync(localImagePath);
});

const batch = pendingHerbs.slice(0, 20).map(herb => {
  const partEng = translateToEnglish(herb.part_used);
  return {
    slug: herb.slug,
    name_vn: herb.name_vn,
    scientific_name: herb.scientific_name,
    prompt: `A highly detailed, scientifically accurate botanical watercolor illustration of ${herb.scientific_name} (${herb.name_vn}), depicting its ${partEng} and leaves. Vibrant yet muted traditional colors, rich textures, elegant thin ink brush strokes, delicate watercolor washes, soft shading, isolated on clean off-white parchment paper texture background, botanical plate style, East Asian medicine aesthetic.`
  };
});

fs.writeFileSync(
  'C:\\Users\\maihu\\.gemini\\antigravity\\scratch\\prompts_utf8.json',
  JSON.stringify(batch, null, 2),
  'utf8'
);
console.log('Successfully wrote prompts to prompts_utf8.json');

