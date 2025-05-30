const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const commentController = require('../controllers/commentController');

router.post('/:playlistId', authMiddleware, commentController.addComment);
router.get('/:playlistId', commentController.getCommentsForPlaylist);
router.delete('/:commentId', authMiddleware, commentController.deleteComment);

module.exports = router;