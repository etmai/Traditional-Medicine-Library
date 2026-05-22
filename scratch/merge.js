import fs from 'fs';
import { herbs as existingHerbs } from '../src/data/herbs.js';

const newHerbs = JSON.parse(fs.readFileSync('scratch/extracted_herbs_p4.json', 'utf8'));

let maxId = 0;
const existingSlugs = new Set();
const existingNames = new Set();

existingHerbs.forEach(h => {
  if (h.id > maxId) {
    maxId = h.id;
  }
  if (h.slug) {
    existingSlugs.add(h.slug.toLowerCase().trim());
  }
  if (h.name_vn) {
    existingNames.add(h.name_vn.toLowerCase().trim());
  }
});

console.log(`Existing herbs count: ${existingHerbs.length}`);
console.log(`Max existing ID: ${maxId}`);

let addedCount = 0;
let skippedCount = 0;
const mergedHerbs = [...existingHerbs];

newHerbs.forEach(h => {
  const slug = h.slug.toLowerCase().trim();
  const name = h.name_vn.toLowerCase().trim();
  
  if (existingSlugs.has(slug) || existingNames.has(name)) {
    skippedCount++;
    return;
  }
  
  maxId++;
  const herbToAppend = {
    id: maxId,
    ...h
  };
  
  mergedHerbs.push(herbToAppend);
  existingSlugs.add(slug);
  existingNames.add(name);
  addedCount++;
});

console.log(`Added: ${addedCount} herbs.`);
console.log(`Skipped (duplicates): ${skippedCount} herbs.`);
console.log(`Total merged herbs: ${mergedHerbs.length}`);

const outputContent = `export const herbs = ${JSON.stringify(mergedHerbs, null, 2)};\n`;
fs.writeFileSync('src/data/herbs.js', outputContent, 'utf8');
console.log('Successfully wrote to src/data/herbs.js.');
