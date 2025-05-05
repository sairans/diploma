const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const router = express.Router();
const { protect } = require('../middlewares/auth');

router.get('/me', protect, (req, res) => {
  res.status(200).json(req.user);
});

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;