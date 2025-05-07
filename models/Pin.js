const mongoose = require('mongoose');

const pinSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  type: {
    type: String,
    required: true,
    enum: ['restaurant', 'hotel', 'attraction']
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a 2dsphere index for geospatial queries
pinSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Pin', pinSchema); 