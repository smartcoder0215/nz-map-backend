const express = require('express');
const router = express.Router();
const OverlayImage = require('../models/OverlayImage');
const { uploadMiddleware, cloudinary } = require('../config/cloudinary');

// Get all overlay images
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all overlay images...');
    const images = await OverlayImage.find().sort({ createdAt: -1 });
    console.log(`Found ${images.length} images`);
    res.json(images);
  } catch (error) {
    console.error('Error fetching overlay images:', error);
    res.status(500).json({ message: 'Failed to fetch overlay images', error: error.message });
  }
});

// Upload new overlay image
router.post('/', uploadMiddleware, async (req, res) => {
  console.log('=== Starting overlay image upload ===');
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  try {
    if (!req.file) {
      console.error('No file provided in request');
      return res.status(400).json({ message: 'No image file provided' });
    }

    console.log('File details:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      fieldname: req.file.fieldname
    });

    // Verify Cloudinary upload
    console.log('Verifying Cloudinary upload...');
    const cloudinaryResult = await cloudinary.uploader.explicit(req.file.filename, {
      type: 'upload',
      resource_type: 'image'
    });
    console.log('Cloudinary verification result:', cloudinaryResult);

    console.log('Creating new OverlayImage document...');
    const newImage = new OverlayImage({
      name: req.body.name || req.file.originalname,
      cloudinaryId: req.file.filename,
      url: req.file.path
    });

    console.log('Saving image to database...');
    const savedImage = await newImage.save();
    console.log('Successfully saved image:', savedImage);
    
    res.status(201).json(savedImage);
  } catch (error) {
    console.error('=== Error in overlay image upload ===');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // If there was an error and the file was uploaded to Cloudinary, try to delete it
    if (req.file && req.file.filename) {
      console.log('Attempting to clean up Cloudinary file:', req.file.filename);
      try {
        await cloudinary.uploader.destroy(req.file.filename);
        console.log('Successfully deleted file from Cloudinary');
      } catch (deleteError) {
        console.error('Error deleting failed upload from Cloudinary:', deleteError);
      }
    }

    res.status(500).json({ 
      message: 'Failed to upload overlay image',
      error: error.message
    });
  }
});

// Set active overlay image
router.patch('/:id/activate', async (req, res) => {
  console.log('=== Activating overlay image ===');
  console.log('Image ID:', req.params.id);
  
  try {
    console.log('Deactivating all existing images...');
    await OverlayImage.updateMany({}, { isActive: false });
    
    console.log('Activating new image...');
    const image = await OverlayImage.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    
    if (!image) {
      console.error('Image not found:', req.params.id);
      return res.status(404).json({ message: 'Image not found' });
    }
    
    console.log('Successfully activated image:', image);
    res.json(image);
  } catch (error) {
    console.error('Error activating overlay image:', error);
    res.status(500).json({ 
      message: 'Failed to activate overlay image', 
      error: error.message 
    });
  }
});

// Delete overlay image
router.delete('/:id', async (req, res) => {
  console.log('=== Deleting overlay image ===');
  console.log('Image ID:', req.params.id);
  
  try {
    console.log('Finding image in database...');
    const image = await OverlayImage.findById(req.params.id);
    if (!image) {
      console.error('Image not found:', req.params.id);
      return res.status(404).json({ message: 'Image not found' });
    }

    console.log('Deleting from Cloudinary...');
    try {
      await cloudinary.uploader.destroy(image.cloudinaryId);
      console.log('Successfully deleted from Cloudinary');
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
    }
    
    console.log('Deleting from database...');
    await image.deleteOne();
    console.log('Successfully deleted from database');
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting overlay image:', error);
    res.status(500).json({ 
      message: 'Failed to delete overlay image', 
      error: error.message 
    });
  }
});

module.exports = router; 