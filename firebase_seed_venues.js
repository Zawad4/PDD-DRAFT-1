import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const firebaseConfig = {
  apiKey: "AIzaSyBJse-qZuxrbKM51ze5HQaw31CitPsdV5o",
  authDomain: "turfington-b759a.firebaseapp.com",
  projectId: "turfington-b759a",
  storageBucket: "turfington-b759a.firebasestorage.app",
  messagingSenderId: "147940618215",
  appId: "1:147940618215:web:13f38ed41f9a6b6c7f9742"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dbPath = path.resolve('turfington_db.json');
const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

async function seed() {
  console.log('--- SEEDING FIREBASE FIRESTORE VENUES ---');

  const venuesToInsert = dbData.venues.map((v) => ({
    name: v.name,
    sport: v.sport || 'Sports',
    lat: v.lat || 13.0827,
    lng: v.lng || 80.2707,
    price: v.price || (v.price_per_hr ? `₹${v.price_per_hr}/hr` : '₹1,000/hr'),
    rating: v.rating || 4.8,
    image_url: v.image_url || v.image,
    active: true
  }));

  const venuesRef = collection(db, 'venues');
  let count = 0;
  for (const venue of venuesToInsert) {
    await addDoc(venuesRef, venue);
    count++;
  }

  console.log(`Successfully seeded ${count} venues into Firestore 'venues' collection!`);
  console.log('\n--- SEEDING COMPLETE ---');
}

seed().catch(console.error);
