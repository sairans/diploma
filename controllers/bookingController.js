const Booking = require('../models/booking');
const User = require('../models/user');
const Ground = require('../models/ground');
const { sendEmail } = require('../utils/emailService');

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const { ground, date, timeSlot } = req.body;

    const conflict = await Booking.findOne({
        ground,
        date,
        timeSlot: { $in: timeSlot }
      });
    if (conflict) return res.status(400).json({ message: 'Слот уже занят' });
    const existing = await Booking.findOne({
        ground,
        date,
        timeSlot: { $in: timeSlot },
        user: req.user._id
      });
    if (existing) return res.status(400).json({ message: 'Слот уже занят вами' });

    const booking = new Booking({ user: req.user._id, ground, date, timeSlot });
    await booking.save();

    const user = await User.findById(req.user._id);
    const groundData = await Ground.findById(ground);

    const html = `
      <h2>Подтверждение бронирования</h2>
      <p>Пользователь: ${user.name}</p>
      <p>Площадка: ${groundData.name}</p>
      <p>Дата: ${new Date(date).toDateString()}</p>
      <p>Время: ${timeSlot.join(', ')}</p>
    `;

    await sendEmail({ to: user.email, subject: 'Новое бронирование', html });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка создания бронирования', error: err.message });
  }
};

// Get my bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('ground');
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения бронирований' });
  }
};

// Get all bookings (admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user').populate('ground');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения всех бронирований' });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
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

    const user = await User.findById(booking.user);
    const ground = await Ground.findById(booking.ground);

    const html = `
      <h2>Бронирование обновлено</h2>
      <p>Пользователь: ${user.name}</p>
      <p>Площадка: ${ground.name}</p>
      <p>Дата: ${new Date(booking.date).toDateString()}</p>
      <p>Время: ${booking.timeSlot.join(', ')}</p>
    `;

    await sendEmail({ to: user.email, subject: 'Изменение бронирования', html });
    res.json({ message: 'Обновлено', booking });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка обновления', error: err.message });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Не найдено' });

    if (booking.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    const user = await User.findById(booking.user);
    const ground = await Ground.findById(booking.ground);

    const html = `
      <h2>Бронирование отменено</h2>
      <p>Пользователь: ${user.name}</p>
      <p>Площадка: ${ground.name}</p>
      <p>Дата: ${new Date(booking.date).toDateString()}</p>
      <p>Время: ${booking.timeSlot.join(', ')}</p>
    `;

    await sendEmail({ to: user.email, subject: 'Отмена бронирования', html });

    await booking.deleteOne();
    res.json({ message: 'Удалено' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка удаления', error: err.message });
  }
};

// Get occupied time slots for a ground and date
exports.getOccupiedSlots = async (req, res) => {
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
  };
  
  // Get available time slots for a ground and date
  exports.getAvailableSlots = async (req, res) => {
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
  };
  
  // Get nearby grounds based on location
  exports.getNearbyGrounds = async (req, res) => {
    try {
      const { latitude, longitude, radius = 5000 } = req.query; // радиус по умолчанию 5км
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Необходимо указать координаты' });
      }
  
      const nearbyGrounds = await Ground.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: parseInt(radius)
          }
        }
      });
  
      res.json({ grounds: nearbyGrounds });
    } catch (err) {
      res.status(500).json({ message: 'Ошибка поиска ближайших площадок', error: err.message });
    }
  };