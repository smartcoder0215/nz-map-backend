const mongoose = require('mongoose');

const pinIconSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  cloudinaryId: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PinIcon', pinIconSchema); 