const Booking = require('../models/booking');
const User = require('../models/user');
const Ground = require('../models/ground');
const { sendEmail } = require('../utils/emailService');

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const { ground, date, timeSlot } = req.body;

    // 1. Валидация входных данных
    if (!ground || !date || !timeSlot?.length) {
      return res
        .status(400)
        .json({ message: 'Не все обязательные поля заполнены' });
    }

    // 2. Проверка существования площадки
    const groundData = await Ground.findById(ground);
    if (!groundData) {
      return res.status(404).json({ message: 'Площадка не найдена' });
    }

    // 3. Проверка дня недели
    const bookingDate = new Date(date);
    if (isNaN(bookingDate)) {
      return res.status(400).json({ message: 'Неверный формат даты' });
    }

    const dayOfWeek = bookingDate.getDay();
    if (!groundData.availableWeekdays.includes(dayOfWeek)) {
      return res.status(400).json({
        message: `Площадка не работает по ${getWeekdayName(dayOfWeek)}`
      });
    }

    // 4. Проверка пересечения временных слотов
    const existingBookings = await Booking.find({
      ground,
      date,
      timeSlot: { $in: timeSlot }
    });

    if (existingBookings.length > 0) {
      const conflictUsers = await User.find({
        _id: { $in: existingBookings.map((b) => b.user) }
      });

      return res.status(400).json({
        message: 'Конфликт бронирования',
        conflicts: existingBookings.map((b) => ({
          timeSlot: b.timeSlot,
          user:
            conflictUsers.find((u) => u._id.equals(b.user))?.name ||
            'Неизвестный пользователь'
        }))
      });
    }

    // 5. Создание бронирования
    const booking = new Booking({
      user: req.user._id,
      ground,
      date: bookingDate,
      timeSlot
    });

    await booking.save();

    // 6. Отправка email
    const user = await User.findById(req.user._id);
    if (user?.email) {
      const html = `
        <h2>Подтверждение бронирования</h2>
        <p>Площадка: ${groundData.name}</p>
        <p>Дата: ${bookingDate.toLocaleDateString('ru-RU')}</p>
        <p>Время: ${timeSlot.join(', ')}</p>
      `;

      await sendEmail({
        to: user.email,
        subject: 'Подтверждение бронирования',
        html
      });
    }

    res.status(201).json(booking);
  } catch (err) {
    console.error('Ошибка создания бронирования:', err);
    res.status(500).json({
      message: 'Ошибка сервера при создании бронирования',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Вспомогательная функция для названий дней недели
function getWeekdayName(dayNumber) {
  const weekdays = [
    'воскресеньям',
    'понедельникам',
    'вторникам',
    'средам',
    'четвергам',
    'пятницам',
    'субботам'
  ];
  return weekdays[dayNumber] || 'неизвестному дню';
}

// Get my bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate(
      'ground'
    );
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
    if (!booking)
      return res.status(404).json({ message: 'Бронирование не найдено' });

    if (
      booking.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    const { date, timeSlot } = req.body;
    if (date) {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Сбрасываем время для сравнения только дат

      if (selectedDate < today) {
        return res
          .status(400)
          .json({ message: 'Нельзя выбрать прошедшую дату' });
      }
      booking.date = date;
    }

    // Проверка доступности временных слотов с конфликтом
    if (timeSlot) {
      const conflicting = await Booking.find({
        _id: { $ne: booking._id },
        ground: booking.ground,
        date: booking.date,
        timeSlot: { $in: timeSlot }
      });

      if (conflicting.length > 0) {
        return res.status(400).json({
          message: 'Некоторые из выбранных временных слотов уже заняты',
          conflicts: conflicting.map((b) => b.timeSlot).flat()
        });
      }

      booking.timeSlot = timeSlot;
    }

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

    await sendEmail({
      to: user.email,
      subject: 'Изменение бронирования',
      html
    });
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

    if (
      booking.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
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
    const timeSlots = bookings.flatMap((b) =>
      b.timeSlot.map((slot) => slot.trim())
    );
    res.json({ occupiedSlots: timeSlots });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Ошибка получения занятых слотов', error: err.message });
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
    if (!ground)
      return res.status(404).json({ message: 'Площадка не найдена' });

    const dayOfWeek = new Date(date).getDay();
    if (!ground.availableWeekdays.includes(dayOfWeek)) {
      return res.json({ availableSlots: [] });
    }

    if (
      !ground.availableHours ||
      !ground.availableHours.start ||
      !ground.availableHours.end
    ) {
      return res
        .status(400)
        .json({ message: 'availableHours не указаны для площадки' });
    }
    const startHour = parseInt(ground.availableHours.start.split(':')[0]);
    const endHour = parseInt(ground.availableHours.end.split(':')[0]);
    const allSlots = [];
    for (let h = startHour; h < endHour; h++) {
      allSlots.push(
        `${String(h).padStart(2, '0')}:00–${String(h + 1).padStart(2, '0')}:00`
      );
    }
    const bookings = await Booking.find({ ground: groundId, date });
    const occupied = bookings.flatMap((b) =>
      b.timeSlot.map((slot) => slot.trim())
    );
    const available = allSlots.filter(
      (slot) => !occupied.includes(slot.trim())
    );
    res.json({ availableSlots: available });
  } catch (err) {
    res.status(500).json({
      message: 'Ошибка получения свободных слотов',
      error: err.message
    });
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
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    });

    res.json({ grounds: nearbyGrounds });
  } catch (err) {
    res.status(500).json({
      message: 'Ошибка поиска ближайших площадок',
      error: err.message
    });
  }
};
