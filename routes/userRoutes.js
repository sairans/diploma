const express = require('express');
const {
  registerUser,
  loginUser,
  getAllUsers,
  updateUserProfile,
  addUserCard,
  deleteUserCard,
  getMyProfile,
  getUserCards,
  forgotPassword,
  changePassword
} = require('../controllers/userController');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const admin = require('../middlewares/admin');

router.get('/me', protect, (req, res) => {
  res.status(200).json(req.user);
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', protect, admin, getAllUsers);
router.put('/me', protect, updateUserProfile);
router.put('/payment', protect, addUserCard);
router.delete('/payment/:id', protect, deleteUserCard);
router.get('/payment', protect, getUserCards);
router.get('/me', protect, getMyProfile);
router.post('/forgot-password', forgotPassword);
router.put('/password', protect, changePassword);

module.exports = router;
