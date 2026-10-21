import fs from 'fs';
import path from 'path';

console.log('=== VERIFYING VENUE IMAGES ===\n');

// 1. Load turfington_db.json
const dbPath = path.resolve('turfington_db.json');
const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const requiredVenues = [
  'Turf Together',
  'TLK Sports Academy',
  'Thiram Sports Academy – Poonamallee',
  'Whistle Podu Arena',
  'PAV Sports Club',
  'EcoSport Badminton Arena',
  'Gladius Turf',
  'Hybrid Athlete Badminton Club',
  'Mithraa Sports Academy'
];

console.log(`Checking ${requiredVenues.length} required venues in database...`);

const foundVenues = [];
const imageMap = new Map();
const duplicates = [];

dbData.venues.forEach(v => {
  const name = v.name;
  const img = v.image_url || v.image;
  
  if (imageMap.has(img)) {
    duplicates.push({ name, previous: imageMap.get(img), img });
  } else {
    imageMap.set(img, name);
  }
  
  if (requiredVenues.includes(name)) {
    foundVenues.push(v);
  }
});

console.log(`Found ${foundVenues.length} / ${requiredVenues.length} required venues in turfington_db.json.`);

let missing = requiredVenues.filter(r => !foundVenues.some(f => f.name === r));
if (missing.length > 0) {
  console.error('ERROR: Missing venues in database:', missing);
  process.exit(1);
} else {
  console.log('SUCCESS: All 9 required venues found in turfington_db.json!');
}

if (duplicates.length > 0) {
  console.error('ERROR: Duplicate images found across venues:', duplicates);
  process.exit(1);
} else {
  console.log('SUCCESS: Zero duplicate images found across all venues in database!');
}

console.log('\nList of 9 venues with their unique image URLs:');
foundVenues.forEach(v => {
  console.log(`- ${v.name}: ${v.image_url || v.image}`);
});

console.log('\n=== ALL CHECKS PASSED SUCCESSFULLY ===');
