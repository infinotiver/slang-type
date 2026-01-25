#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, 'src', 'data', 'data.json');

// Read the data
const rawData = fs.readFileSync(dataPath, 'utf-8');
const data = JSON.parse(rawData);

// Function to remove duplicates while preserving order
function removeDuplicates(arr) {
  const seen = new Set();
  return arr.filter(word => {
    const lowerWord = word.toLowerCase();
    if (seen.has(lowerWord)) {
      return false;
    }
    seen.add(lowerWord);
    return true;
  });
}

// Process each language
const cleaned = {};
let totalRemoved = 0;

for (const [language, words] of Object.entries(data)) {
  const originalCount = words.length;
  cleaned[language] = removeDuplicates(words);
  const removed = originalCount - cleaned[language].length;
  totalRemoved += removed;
  
  console.log(`${language}: ${originalCount} words → ${cleaned[language].length} words (removed ${removed} duplicates)`);
}

// Write back to file with nice formatting
fs.writeFileSync(dataPath, JSON.stringify(cleaned, null, 2) + '\n');

console.log(`\nTotal duplicates removed: ${totalRemoved}`);
console.log(`Updated ${dataPath}`);
