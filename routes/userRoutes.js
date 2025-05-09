const express = require('express');
const { registerUser, loginUser, getAllUsers } = require('../controllers/userController');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const admin = require('../middlewares/admin');

router.get('/me', protect, (req, res) => {
  res.status(200).json(req.user);
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', protect, admin, getAllUsers);

module.exports = router;