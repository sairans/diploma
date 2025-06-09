const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const groundController = require('../controllers/groundController');

// READ ALL
router.get('/', groundController.getAllGrounds);

// CREATE
router.post('/', protect, admin, groundController.createGround);

// READ ONE
router.get('/:id', groundController.getGroundById);

// UPDATE
router.put('/:id', protect, admin, groundController.updateGround);

// DELETE
router.delete('/:id', protect, admin, groundController.deleteGround);

// SEARCH
router.get('/search', groundController.searchGroundsByName);

// GET GROUNDS FOR CURRENT USER
router.get('/my/:id', protect, groundController.getGroundsByUser);

module.exports = router;
