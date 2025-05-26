const express = require('express');
const router = express.Router();
const PinIcon = require('../models/PinIcon');
const { uploadMiddleware, cloudinary } = require('../config/cloudinary');

// Get all pin icons
router.get('/', async (req, res) => {
  try {
    const icons = await PinIcon.find().sort({ createdAt: -1 });
    res.json(icons);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pin icons', error: error.message });
  }
});

// Upload new pin icon
router.post('/', uploadMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No icon file provided' });
    }
    // Verify Cloudinary upload
    await cloudinary.uploader.explicit(req.file.filename, {
      type: 'upload',
      resource_type: 'image'
    });
    const newIcon = new PinIcon({
      name: req.body.name || req.file.originalname,
      cloudinaryId: req.file.filename,
      url: req.file.path
    });
    const savedIcon = await newIcon.save();
    res.status(201).json(savedIcon);
  } catch (error) {
    if (req.file && req.file.filename) {
      try { await cloudinary.uploader.destroy(req.file.filename); } catch {}
    }
    res.status(500).json({ message: 'Failed to upload pin icon', error: error.message });
  }
});

// Delete pin icon
router.delete('/:id', async (req, res) => {
  try {
    const icon = await PinIcon.findById(req.params.id);
    if (!icon) return res.status(404).json({ message: 'Icon not found' });
    try { await cloudinary.uploader.destroy(icon.cloudinaryId); } catch {}
    await icon.deleteOne();
    res.json({ message: 'Icon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete pin icon', error: error.message });
  }
});

module.exports = router; 