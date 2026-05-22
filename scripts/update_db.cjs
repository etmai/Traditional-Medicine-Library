const fs = require('fs');
const path = require('path');

const HERBS_PATH = path.resolve(__dirname, '../src/data/herbs.js');
const TEMP_PATH = path.resolve(__dirname, 'temp_herbs.cjs');
const IMAGES_DIR = path.resolve(__dirname, '../public/images');

if (fs.existsSync(HERBS_PATH)) {
  let content = fs.readFileSync(HERBS_PATH, 'utf8');
  let jsContent = content.replace('export const herbs =', 'module.exports =');
  fs.writeFileSync(TEMP_PATH, jsContent, 'utf8');
  
  const herbs = require('./temp_herbs.cjs');
  let count = 0;
  
  // Quét tất cả file trong public/images
  const files = fs.readdirSync(IMAGES_DIR);
  const imageMap = {};
  files.forEach(f => {
    if (f.endsWith('.png') || f.endsWith('.jpg')) {
      const slug = f.replace('.png', '').replace('.jpg', '');
      imageMap[slug] = `/images/${f}`;
    }
  });

  for (const herb of herbs) {
    if (imageMap[herb.slug] && herb.image !== imageMap[herb.slug]) {
      herb.image = imageMap[herb.slug];
      count++;
    }
  }
  
  const newContent = 'export const herbs = ' + JSON.stringify(herbs, null, 2) + ';\n';
  fs.writeFileSync(HERBS_PATH, newContent, 'utf8');
  console.log(`Đã đồng bộ ${count} ảnh mới vào cơ sở dữ liệu herbs.js!`);
  
  if (fs.existsSync(TEMP_PATH)) fs.unlinkSync(TEMP_PATH);
}
