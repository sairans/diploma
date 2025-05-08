const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const { 
  createBooking, 
  updateBooking, 
  deleteBooking, 
  getMyBookings, 
  getAllBookings, 
  getOccupiedSlots, 
  getAvailableSlots, 
  getNearbyGrounds 
} = require('../controllers/bookingController');

// Получить все бронирования текущего пользователя
router.get('/my', protect, getMyBookings);

// Забронировать площадку
router.post('/', protect, createBooking);

// // Получить занятые слоты по дате и площадке
router.get('/occupied', getOccupiedSlots);

// // Получить свободные слоты по дате и площадке
router.get('/available', getAvailableSlots);

// // Получить ближайшие площадки
router.get('/nearby', getNearbyGrounds);

// Получить все бронирования (только для админа)
router.get('/all', protect, admin, getAllBookings);

// Обновить бронирование (только владелец или админ)
router.put('/:id', protect, updateBooking);

// Удалить бронирование (только владелец или админ)
router.delete('/:id', protect, deleteBooking);

module.exports = router;