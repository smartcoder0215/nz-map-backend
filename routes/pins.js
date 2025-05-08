const express = require('express');
const router = express.Router();
const Pin = require('../models/Pin');

// Get all pins
router.get('/', async (req, res) => {
  try {
    const pins = await Pin.find();
    res.json(pins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new pin
router.post('/', async (req, res) => {
  const pin = new Pin({
    title: req.body.title,
    description: req.body.description,
    image: req.body.image,
    coordinates: req.body.coordinates,
    bookurl: req.body.bookurl,
    direction: req.body.direction,
    learnmore: req.body.learnmore
  });

  try {
    const newPin = await pin.save();
    res.status(201).json(newPin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get pins within a radius (in kilometers)
router.get('/nearby', async (req, res) => {
  try {
    const { longitude, latitude, radius } = req.query;
    const pins = await Pin.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      }
    });
    res.json(pins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a pin
router.patch('/:id', async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    if (req.body.title) pin.title = req.body.title;
    if (req.body.description) pin.description = req.body.description;
    if (req.body.image) pin.image = req.body.image;
    if (req.body.coordinates) pin.coordinates = req.body.coordinates;
    if (req.body.bookurl) pin.bookurl = req.body.bookurl;
    if (req.body.direction) pin.direction = req.body.direction;
    if (req.body.learnmore) pin.learnmore = req.body.learnmore;

    const updatedPin = await pin.save();
    res.json(updatedPin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a pin
router.delete('/:id', async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }
    await pin.deleteOne();
    res.json({ message: 'Pin deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 