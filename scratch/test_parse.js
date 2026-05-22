import { herbs } from '../src/data/herbs.js';
import { interactions } from '../src/data/interactions.js';

console.log('--- DATA INTEGRITY CHECK ---');
console.log('Herbs parsed successfully:', herbs.length);
console.log('Interactions parsed successfully:', interactions.length);

// Basic cross-check
const herbNames = new Set(herbs.map(h => h.name_vn));
const interactionErrors = [];

interactions.forEach((inter, index) => {
  if (!herbNames.has(inter.herb1)) interactionErrors.push(`Interaction ${index}: ${inter.herb1} not found in herbs.js`);
  if (!herbNames.has(inter.herb2)) interactionErrors.push(`Interaction ${index}: ${inter.herb2} not found in herbs.js`);
});

if (interactionErrors.length > 0) {
  console.warn('Found', interactionErrors.length, 'naming mismatches in interactions.js (usually okay if deliberate, but check for typos):');
  // Only show first 5 to avoid noise
  interactionErrors.slice(0, 5).forEach(e => console.warn(' -', e));
} else {
  console.log('All interaction herb names match herbs.js entries.');
}

console.log('--- CHECK COMPLETE ---');
