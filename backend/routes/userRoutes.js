const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);
router.get('/playlists', authMiddleware, userController.getUserPlaylists);
router.get('/favorites', authMiddleware, userController.getUserFavorites);
router.post('/favorites/:id', authMiddleware, userController.toggleFavoritePlaylist);



module.exports = router;