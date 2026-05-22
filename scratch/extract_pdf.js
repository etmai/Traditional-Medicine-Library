import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

const dataBuffer = fs.readFileSync('C:/Users/maihu/.gemini/antigravity/playground/celestial-ring/Chi Tiet Ten-p2.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('scratch/pdf2_text.txt', data.text);
    console.log('Extracted ' + data.numpages + ' pages. Output saved to scratch/pdf2_text.txt');
}).catch(function(error){
    console.error(error);
});
