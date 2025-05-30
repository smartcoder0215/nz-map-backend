const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/map-newzealand';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Routes
const pinsRouter = require('./routes/pins');
const overlayImagesRouter = require('./routes/overlayImages');
const pinIconsRouter = require('./routes/pinIcons');

app.use('/api/pins', pinsRouter);
app.use('/api/overlay-images', overlayImagesRouter);
app.use('/api/pin-icons', pinIconsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Map New Zealand API' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 