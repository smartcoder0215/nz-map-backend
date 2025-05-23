const mongoose = require('mongoose');

const overlayImageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('OverlayImage', overlayImageSchema); 