const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const Booking = require('../models/booking');
const Ground = require('../models/ground');
const { sendEmail } = require('../utils/emailService');
const User = require('../models/user');

// Получить все бронирования текущего пользователя
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('ground');
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения бронирований', error: err.message });
  }
});

// Забронировать площадку
router.post('/', protect, async (req, res) => {
  try {
    const { ground, date, timeSlot } = req.body;

    if (!Array.isArray(timeSlot) || timeSlot.length === 0) {
      return res.status(400).json({ message: 'timeSlot должен быть массивом с хотя бы одним значением' });
    }
    // Проверка на дубли (усилена для пользователя)
    const existing = await Booking.findOne({
      ground,
      date,
      timeSlot: { $in: timeSlot },
      user: req.user._id
    });
    if (existing) {
      return res.status(400).json({ message: 'Вы уже бронировали один или несколько выбранных слотов для этой площадки и даты' });
    }
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Пользователь не найден или не авторизован' });
    }
    const booking = await Booking.create({
      user: req.user._id,
      ground,
      date,
      timeSlot
    });

    // booking — это уже сохранённый документ (await booking.save())
    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('ground', 'name location');

      const { name: userName, email } = populatedBooking.user;
      const { name: groundName, location } = populatedBooking.ground;

      const html = `
        <h2>Успешное бронирование</h2>
        <p><strong>Пользователь:</strong> ${userName}</p>
        <p><strong>Площадка:</strong> ${groundName}</p>
        <p><strong>Дата:</strong> ${populatedBooking.date.toDateString()}</p>
        <p><strong>Время:</strong> ${populatedBooking.timeSlot.join(', ')}</p>
        <p><strong>Локация:</strong> [${location.coordinates.join(', ')}]</p>
      `;

      await sendEmail({
        to: email,
        subject: 'Подтверждение бронирования',
        html
      });

      await sendEmail({
        to: email,
        bcc: 'sairanovs10@gmail.com',
        subject: 'Подтверждение бронирования',
        html
      });
      
    res.status(201).json({ booking });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при бронировании', error: err.message });
  }
});

// Получить занятые слоты по дате и площадке
router.get('/occupied', async (req, res) => {
  try {
    const { groundId, date } = req.query;
    if (!groundId || !date) {
      return res.status(400).json({ message: 'groundId и date обязательны' });
    }
    const bookings = await Booking.find({ ground: groundId, date });
    const timeSlots = bookings.flatMap(b => b.timeSlot.map(slot => slot.trim()));
    res.json({ occupiedSlots: timeSlots });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения занятых слотов', error: err.message });
  }
});

// Получить свободные слоты по дате и площадке
router.get('/available', async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения свободных слотов', error: err.message });
  }
});

// Получить ближайшие площадки
router.get('/nearby', async (req, res) => {
  try {
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
    res.json({ grounds });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка поиска ближайших площадок', error: err.message });
  }
});

// Получить все бронирования (только для админа)
router.get('/all', protect, admin, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user').populate('ground');
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения всех бронирований', error: err.message });
  }
});

// Обновить бронирование (только владелец или админ)
router.put('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Бронирование не найдено' });

    if (booking.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    const { date, timeSlot } = req.body;
    if (date) booking.date = date;
    if (timeSlot) booking.timeSlot = timeSlot;

    await booking.save();
    res.json({ message: 'Бронирование обновлено', booking });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка обновления бронирования', error: err.message });
  }
});

// Удалить бронирование (только владелец или админ)
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Бронирование не найдено' });

    if (booking.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    const user = await User.findById(booking.user);
    const ground = await Ground.findById(booking.ground);
    const date = booking.date.toDateString();

    await booking.deleteOne();
    await sendEmail({
      to: user.email,
      subject: 'Бронирование отменено',
      html: `<p>Вы отменили бронирование площадки ${ground.name} на ${date}</p>`
    });
    res.json({ message: 'Бронирование удалено' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка удаления бронирования', error: err.message });
  }
});

// GET all bookings (admin) or only user bookings, with optional date filtering
router.get('/bookings', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = req.user.isAdmin ? {} : { user: req.user._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }
    const bookings = await Booking.find(query).populate('user').populate('ground');
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;