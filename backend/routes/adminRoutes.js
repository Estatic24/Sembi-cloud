const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/users', authMiddleware, adminMiddleware, adminController.getUsers);
router.put('/users/:id/role', authMiddleware, adminMiddleware, adminController.updateUserRole);
router.delete('/users/:id', authMiddleware, adminMiddleware, adminController.deleteUser);
router.put('/users/:id/status', authMiddleware, adminMiddleware, adminController.toggleUserStatus);
router.put('/tracks/:id/approve', authMiddleware, adminMiddleware, adminController.approveTrack);

router.get('/playlists', authMiddleware, adminMiddleware, adminController.getPlaylists);
router.delete('/playlists/:id', authMiddleware, adminMiddleware, adminController.deletePlaylist);

router.get('/tracks', authMiddleware, adminMiddleware, adminController.getAllTracksAdmin);
router.delete('/tracks/:id', authMiddleware, adminMiddleware, adminController.deleteTrack);

router.get('/stats', authMiddleware, adminMiddleware, adminController.getStats);

module.exports = router;
