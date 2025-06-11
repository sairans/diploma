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

router.post('/', protect, createReview);

router.get('/ground/:id', getReviewsForGround);

router.get('/:id', getReviewsByGround);

router.delete('/:id', protect, deleteReview);

module.exports = router;
