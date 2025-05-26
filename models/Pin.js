const mongoose = require('mongoose');

const pinSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 2 && 
               typeof v[0] === 'number' && 
               typeof v[1] === 'number' &&
               v[0] >= -180 && v[0] <= 180 && // longitude
               v[1] >= -90 && v[1] <= 90;    // latitude
      },
      message: 'Coordinates must be an array of [longitude, latitude] with valid values'
    }
  },
  bookurl: {
    type: String,
    trim: true
  },
  direction: {
    type: String,
    trim: true
  },
  learnmore: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    trim: true,
    default: 'attraction'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a 2dsphere index for geospatial queries
pinSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Pin', pinSchema); 