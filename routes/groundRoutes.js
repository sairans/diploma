const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const Ground = require('../models/ground');

// READ ALL
router.get('/', async (req, res) => {
  try {
    const grounds = await Ground.find();
    res.json(grounds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE
router.post('/', protect, admin, async (req, res) => {
  try {
    const ground = new Ground(req.body);
    const savedGround = await ground.save();
    res.status(201).json(savedGround);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const ground = await Ground.findById(req.params.id);
    if (!ground) return res.status(404).json({ message: 'Not found' });
    res.json(ground);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const updated = await Ground.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const deleted = await Ground.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Ground deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;