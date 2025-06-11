const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const groundController = require('../controllers/groundController');

router.get('/', groundController.getAllGrounds);

router.post('/', protect, admin, groundController.createGround);

router.get('/:id', groundController.getGroundById);

router.put('/:id', protect, admin, groundController.updateGround);

router.delete('/:id', protect, admin, groundController.deleteGround);

router.get('/search', groundController.searchGroundsByName);

router.get('/my/:id', protect, groundController.getGroundsByUser);

router.post('/delete-image', protect, groundController.deleteImage);

module.exports = router;
