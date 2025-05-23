const express = require('express');
const router = express.Router();
const OverlayImage = require('../models/OverlayImage');
const { upload } = require('../config/cloudinary');

// Get all overlay images
router.get('/', async (req, res) => {
  try {
    const images = await OverlayImage.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload new overlay image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const newImage = new OverlayImage({
      name: req.body.name || req.file.originalname,
      cloudinaryId: req.file.filename,
      url: req.file.path
    });

    const savedImage = await newImage.save();
    res.status(201).json(savedImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Set active overlay image
router.patch('/:id/activate', async (req, res) => {
  try {
    // First, deactivate all images
    await OverlayImage.updateMany({}, { isActive: false });
    
    // Then activate the selected image
    const image = await OverlayImage.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    res.json(image);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete overlay image
router.delete('/:id', async (req, res) => {
  try {
    const image = await OverlayImage.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.cloudinaryId);
    
    // Delete from database
    await image.deleteOne();
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 