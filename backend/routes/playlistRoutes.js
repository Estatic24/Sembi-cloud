const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const playlistController = require('../controllers/playlistController');
const Playlist = require('../models/Playlist');

router.get('/random', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5
    const randomPlaylists = await Playlist.aggregate([
      { $match: {
          coverImage: { $exists: true, $ne: null, $ne: '' }
        }
      },
      { $sample: { size: limit } }
    ])
    res.json(randomPlaylists)
  } catch (error) {
    console.error('Ошибка при получении случайных треков:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.get('/search', playlistController.searchPlaylists);
router.post('/', authMiddleware, playlistController.createPlaylist);
router.get('/:id', playlistController.getPlaylistById);
router.put('/:id', authMiddleware, playlistController.updatePlaylist);
router.delete('/:id', authMiddleware, playlistController.deletePlaylist);
router.post('/:id/like', authMiddleware, playlistController.toggleLikePlaylist);
router.post('/:id/favorite', authMiddleware, playlistController.toggleFavoritePlaylist);
router.get('/', playlistController.getAllPlaylists);

module.exports = router;