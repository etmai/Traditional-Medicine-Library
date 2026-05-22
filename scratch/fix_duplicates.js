import fs from 'fs';

const filePath = 'src/data/herbs.js';
let content = fs.readFileSync(filePath, 'utf8');

// Find the duplicate block
// We know it starts at a specific place.
// Let's use a regex to find the duplicate part of the array.
// The array looks like [..., herb76, herb77...herb86, herb77...herb86, herb87...]

// Actually, I'll just parse the file as a string, find the indices of the duplicate IDs and remove them.
// A simpler way: Find the first occurrence of ID 77 and the second occurrence.
// Remove everything between the end of the first ID 86 and the end of the second ID 86.

const lines = content.split('\n');
let first86End = -1;
let second86End = -1;
let count86 = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('id: 86,')) {
    count86++;
    // Find the closing brace of this object
    let j = i;
    while (j < lines.length && !lines[j].trim().startsWith('}')) {
      j++;
    }
    if (count86 === 1) first86End = j;
    if (count86 === 2) second86End = j;
  }
}

if (first86End !== -1 && second86End !== -1) {
  console.log(`Found first ID 86 at line ${first86End + 1}, second at ${second86End + 1}`);
  // We want to remove the SECOND block of 77-86.
  // The second block starts after first86End.
  const newLines = [
    ...lines.slice(0, first86End + 1),
    ...lines.slice(second86End + 1)
  ];
  
  // Also need to make sure there's a comma after the first block
  if (!newLines[first86End].includes(',')) {
     newLines[first86End] = newLines[first86End].replace('}', '},');
  }

  fs.writeFileSync(filePath, newLines.join('\n'));
  console.log('Fixed duplicate herbs successfully.');
} else {
  console.log('Could not find duplicates.');
  console.log(`Count 86: ${count86}`);
}
