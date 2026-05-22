const fs = require('fs');
const path = require('path');

const HERBS_PATH = path.resolve(__dirname, '../src/data/herbs.js');
const TEMP_PATH = path.resolve(__dirname, 'temp_herbs.cjs');
const IMAGES_DIR = path.resolve(__dirname, '../public/images');

const count = parseInt(process.argv[2]) || 5;

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

const pendingHerbs = herbs.filter(herb => {
  if (!herb.image) return true;
  const localImagePath = path.join(IMAGES_DIR, herb.image.replace('/images/', ''));
  return !fs.existsSync(localImagePath);
});

const batch = pendingHerbs.slice(0, count).map(herb => {
  const partEng = translateToEnglish(herb.part_used);
  return {
    slug: herb.slug,
    name: herb.name_vn,
    prompt: `A highly detailed, scientifically accurate botanical watercolor illustration of ${herb.scientific_name} (${herb.name_vn}), depicting its ${partEng} and leaves. Vibrant yet muted traditional colors, rich textures, elegant thin ink brush strokes, delicate watercolor washes, soft shading, isolated on clean off-white parchment paper texture background, botanical plate style, East Asian medicine aesthetic.`
  };
});

console.log(JSON.stringify(batch, null, 2));
