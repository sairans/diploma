const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const Booking = require('../models/booking');
const Ground = require('../models/ground');

// Получить все бронирования текущего пользователя
router.get('/my', protect, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate('ground');
  res.json(bookings);
});

// Забронировать площадку
router.post('/', protect, async (req, res) => {
  const { ground, date, timeSlot } = req.body;

  if (!Array.isArray(timeSlot) || timeSlot.length === 0) {
    return res.status(400).json({ message: 'timeSlot должен быть массивом с хотя бы одним значением' });
  }
  
  // Проверка на дубли
  const existing = await Booking.findOne({
    ground,
    date,
    timeSlot: { $in: timeSlot }
  });
  
  if (existing) {
    return res.status(400).json({ message: 'Один или несколько слотов уже забронированы' });
  }
  
  const booking = await Booking.create({
    user: req.user._id,
    ground,
    date,
    timeSlot
  });
  res.status(201).json(booking);
});

// Получить занятые слоты по дате и площадке
router.get('/occupied', async (req, res) => {
  const { groundId, date } = req.query;

  if (!groundId || !date) {
    return res.status(400).json({ message: 'groundId и date обязательны' });
  }

  const bookings = await Booking.find({ ground: groundId, date });

  const timeSlots = bookings.flatMap(b => b.timeSlot.map(slot => slot.trim()));
  res.json({ occupiedSlots: timeSlots });
});

// Получить свободные слоты по дате и площадке
router.get('/available', async (req, res) => {
  const { groundId, date } = req.query;

  if (!groundId || !date) {
    return res.status(400).json({ message: 'groundId и date обязательны' });
  }

  const ground = await Ground.findById(groundId);
  if (!ground) return res.status(404).json({ message: 'Площадка не найдена' });

  if (!ground.availableHours || !ground.availableHours.start || !ground.availableHours.end) {
    return res.status(400).json({ message: 'availableHours не указаны для площадки' });
  }
  
  const startHour = parseInt(ground.availableHours.start.split(':')[0]);
  const endHour = parseInt(ground.availableHours.end.split(':')[0]);

  const allSlots = [];
  for (let h = startHour; h < endHour; h++) {
    allSlots.push(`${String(h).padStart(2, '0')}:00–${String(h + 1).padStart(2, '0')}:00`);
  }

  const bookings = await Booking.find({ ground: groundId, date });
  const occupied = bookings.flatMap(b => b.timeSlot.map(slot => slot.trim()));

  const available = allSlots.filter(slot => !occupied.includes(slot.trim()));
  res.json({ availableSlots: available });
});

// Получить ближайшие площадки
router.get('/nearby', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ message: 'Coordinates required' });

  const grounds = await Ground.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: 5000 // 5 км радиус
      }
    }
  });

  res.json(grounds);
});

module.exports = router;