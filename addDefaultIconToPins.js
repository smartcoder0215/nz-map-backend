const mongoose = require('mongoose');
const Pin = require('./models/Pin');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/map-newzealand';

async function addDefaultIcon() {
  await mongoose.connect(MONGODB_URI);
  const result = await Pin.updateMany(
    { icon: { $exists: false } },
    { $set: { icon: 'attraction' } }
  );
  console.log('Pins updated:', result.modifiedCount);
  await mongoose.disconnect();
}

addDefaultIcon().catch(err => {
  console.error(err);
  process.exit(1);
}); 