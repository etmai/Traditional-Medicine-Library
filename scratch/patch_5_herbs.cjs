const fs = require('fs');
const path = require('path');

const herbsPath = path.join(__dirname, '../src/data/herbs.js');
const tempPath = path.join(__dirname, 'temp_herbs3.cjs');

if (fs.existsSync(herbsPath)) {
  let content = fs.readFileSync(herbsPath, 'utf8');
  let jsContent = content.replace('export const herbs =', 'module.exports =');
  fs.writeFileSync(tempPath, jsContent, 'utf8');
  
  const herbs = require('./temp_herbs3.cjs');
  
  const imageMap = {
    'bach-truat': '/images/bach-truat.png',
    'phuc-linh': '/images/phuc-linh.png',
    'hoang-ky': '/images/hoang-ky.png',
    'que-chi': '/images/que-chi.png',
    'nguu-tat': '/images/nguu-tat.png'
  };
  
  let count = 0;
  for (const herb of herbs) {
    if (imageMap[herb.slug]) {
      herb.image = imageMap[herb.slug];
      count++;
    }
  }
  
  const newContent = 'export const herbs = ' + JSON.stringify(herbs, null, 2) + ';\n';
  fs.writeFileSync(herbsPath, newContent, 'utf8');
  console.log(`Successfully updated ${count} herbs in herbs.js!`);
  
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }
} else {
  console.error('herbs.js not found!');
}
