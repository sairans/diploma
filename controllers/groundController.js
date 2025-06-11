const Ground = require('../models/ground');
const cloudinary = require('../utils/cloudinary');

exports.getAllGrounds = async (req, res) => {
  try {
    const grounds = await Ground.find();
    res.json({ grounds });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchGroundsByName = async (req, res) => {
  try {
    const query = req.query.name;
    if (!query) {
      return res
        .status(400)
        .json({ message: 'Параметр name обязателен для поиска' });
    }
    const regex = new RegExp(query, 'i'); // регистронезависимый поиск
    const results = await Ground.find({ name: regex });
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createGround = async (req, res) => {
  try {
    const existingGround = await Ground.findOne({ name: req.body.name });
    if (existingGround) {
      return res
        .status(409)
        .json({ message: 'Площадка с таким именем уже существует' });
    }

    if (
      !req.body.name ||
      !req.body.type ||
      !req.body.location?.coordinates ||
      !req.body.availableHours?.start ||
      !req.body.availableHours?.end ||
      !req.body.address
    ) {
      return res.status(400).json({
        message: 'Пожалуйста, укажите name, type, location и availableHours'
      });
    }

    const ground = new Ground(req.body);

    ground.owner = req.user._id;

    ground.contact = {
      instagram: req.body.contact?.instagram || '',
      phone: req.body.contact?.phone || ''
    };

    if (!req.body.info?.size || !req.body.info?.cover) {
      return res
        .status(400)
        .json({ message: 'Укажите размер и покрытие поля' });
    }

    ground.info = {
      size: req.body.info.size,
      cover: req.body.info.cover,
      balls: req.body.info?.balls || 'paid'
    };

    if (!Array.isArray(req.body.availableWeekdays)) {
      req.body.availableWeekdays = [1, 2, 3, 4, 5];
    }

    const saved = await ground.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getGroundById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'Не указан ID' });
    }
    const ground = await Ground.findById(req.params.id);
    if (!ground) return res.status(404).json({ message: 'Not found' });
    res.json(ground);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGroundsByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const grounds = await Ground.find({ owner: userId });
    res.json({ grounds });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateGround = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'Не указан ID площадки' });
    }
    if (!Array.isArray(req.body.availableWeekdays)) {
      req.body.availableWeekdays = [1, 2, 3, 4, 5];
    }
    if (req.body.contact) {
      req.body['contact.instagram'] = req.body.contact.instagram || '';
      req.body['contact.phone'] = req.body.contact.phone || '';
    }
    if (req.body.info) {
      req.body['info.size'] = req.body.info.size;
      req.body['info.surface'] = req.body.info.surface;
      req.body['info.balls'] = req.body.info.balls || 'paid';
    }
    const updated = await Ground.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteGround = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'Не указан ID' });
    }
    const deleted = await Ground.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Ground deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ message: 'No publicId' });

    const result = await cloudinary.uploader.destroy(publicId);
    res.json({ message: 'Image deleted', result });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting image', error: err });
  }
};
