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
    name: req.body.name,
    description: req.body.description,
    coordinates: {
      type: 'Point',
      coordinates: [req.body.longitude, req.body.latitude]
    },
    type: req.body.type,
    rating: req.body.rating
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

    if (req.body.name) pin.name = req.body.name;
    if (req.body.description) pin.description = req.body.description;
    if (req.body.type) pin.type = req.body.type;
    if (req.body.rating) pin.rating = req.body.rating;
    if (req.body.longitude && req.body.latitude) {
      pin.coordinates = {
        type: 'Point',
        coordinates: [req.body.longitude, req.body.latitude]
      };
    }

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