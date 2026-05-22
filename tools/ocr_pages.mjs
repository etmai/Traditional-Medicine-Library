import { createWorker } from 'tesseract.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const [, , inputDir, outputFile, startArg, endArg, prefix = 'cay-thuoc-p'] = process.argv;

if (!inputDir || !outputFile || !startArg || !endArg) {
  console.error('Usage: node tools/ocr_pages.mjs <inputDir> <outputFile> <startPage> <endPage> [prefix]');
  process.exit(1);
}

const startPage = Number(startArg);
const endPage = Number(endArg);

await fs.mkdir(path.dirname(outputFile), { recursive: true });

const worker = await createWorker('vie+eng');
const chunks = [];

for (let page = startPage; page <= endPage; page += 1) {
  const file = path.join(inputDir, `${prefix}${page}.png`);
  try {
    await fs.access(file);
  } catch {
    console.warn(`Missing ${file}`);
    continue;
  }

  console.error(`OCR page ${page}`);
  const { data } = await worker.recognize(file);
  chunks.push(`\n\n===== PDF PAGE ${page} =====\n${data.text.trim()}\n`);
}

await worker.terminate();
await fs.writeFile(outputFile, chunks.join('').trim() + '\n', 'utf8');
console.error(`Wrote ${outputFile}`);
