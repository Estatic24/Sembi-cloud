const express = require('express');
const router = express.Router();
const Track = require('../models/Track')
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const trackController = require('../controllers/trackController');


router.get('/random', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5
    const randomTracks = await Track.aggregate([
      { $match: { isApproved: true } },
      { $sample: { size: limit } }
    ])
    res.json(randomTracks)
  } catch (error) {
    console.error('Ошибка при получении случайных треков:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})
router.post('/', authMiddleware, adminMiddleware, trackController.addTrack);
router.get('/pending', authMiddleware, adminMiddleware, trackController.getPendingTracks);
router.put('/:id/approve', authMiddleware, adminMiddleware, trackController.approveTrack);

router.post('/suggest', authMiddleware, trackController.suggestTrack);
router.get('/', trackController.getApprovedTracks);

router.post('/:trackId/playlists/:playlistId', authMiddleware, trackController.addTrackToPlaylist);
router.delete('/:trackId/playlists/:playlistId', authMiddleware, trackController.removeTrackFromPlaylist);

router.get('/all', trackController.getAllTracks);

router.get('/:id', trackController.getTrackById);

module.exports = router;