const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { admin } = require('../middlewares/auth');
const Ground = require('../models/ground');

// GET all grounds
router.get('/', async (req, res) => {
  const query = {};
  if (req.query.city) query.city = req.query.city;
  if (req.query.sport) query.sport = req.query.sport;
  const grounds = await Ground.find(query);
  res.json(grounds);
});

// POST create ground (for admin)
router.post('/', protect, async (req, res) => {
  const ground = await Ground.create(req.body);
  res.status(201).json(ground);
});

// PUT update ground
router.put('/:id', protect, admin, async (req, res) => {
  const updated = await Ground.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE ground
router.delete('/:id', protect, admin, async (req, res) => {
  await Ground.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = router;