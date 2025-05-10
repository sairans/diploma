const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  createReview,
  getReviewsByGround,
  deleteReview,
  getReviewsForGround
} = require('../controllers/reviewController');
const { get } = require('mongoose');

// Оставить отзыв
router.post('/', protect, createReview);

// Получить отзывы по площадке через /ground/:id
router.get('/ground/:id', getReviewsForGround);

// Получить отзывы по площадке (старый маршрут)
router.get('/:id', getReviewsByGround);

// Удалить отзыв
router.delete('/:id', protect, deleteReview);

module.exports = router;
