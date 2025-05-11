const Review = require('../models/review');
const Ground = require('../models/ground');
const Booking = require('../models/booking');

exports.createReview = async (req, res) => {
  try {
    const { ground, rating, comment } = req.body;

    const hasBooking = await Booking.findOne({
      user: req.user._id,
      ground: ground
    });
    if (!hasBooking) {
      return res.status(403).json({
        message: 'Вы не можете оставить отзыв без бронирования этой площадки'
      });
    }

    const exists = await Review.findOne({ ground, user: req.user._id });
    if (exists)
      return res.status(400).json({ message: 'Вы уже оставляли отзыв' });

    const review = await Review.create({
      user: req.user._id,
      ground,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Ошибка при создании отзыва', error: err.message });
  }
};

exports.getReviewsByGround = async (req, res) => {
  try {
    const reviews = await Review.find({ ground: req.params.id }).populate(
      'user',
      'name avatar'
    );
    const average =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        : null;
    res.json({ averageRating: average, reviews });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения отзывов' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Отзыв не найден' });

    if (
      review.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    await review.deleteOne();
    res.json({ message: 'Отзыв удалён' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка удаления отзыва' });
  }
};

exports.getReviewsForGround = async (req, res) => {
  req.params.id = req.params.id;
  return exports.getReviewsByGround(req, res);
};
