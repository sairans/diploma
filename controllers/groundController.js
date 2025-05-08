const Ground = require('../models/ground');

// Получить все площадки
exports.getAllGrounds = async (req, res) => {
  try {
    const grounds = await Ground.find();
    res.json({ grounds });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Создать новую площадку
exports.createGround = async (req, res) => {
  try {
    const ground = new Ground(req.body);
    const saved = await ground.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Получить одну площадку по ID
exports.getGroundById = async (req, res) => {
  try {
    const ground = await Ground.findById(req.params.id);
    if (!ground) return res.status(404).json({ message: 'Not found' });
    res.json(ground);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Обновить площадку
exports.updateGround = async (req, res) => {
  try {
    const updated = await Ground.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Удалить площадку
exports.deleteGround = async (req, res) => {
  try {
    const deleted = await Ground.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Ground deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};