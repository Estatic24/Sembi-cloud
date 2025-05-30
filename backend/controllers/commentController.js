const WebSocket = require('ws');
const Comment = require('../models/Comment');


module.exports = (wss) => {
  wss.on('connection', (ws) => {
    console.log('Клиент подключился к WebSocket (комментарии)');

    ws.on('message', async (messageData) => {
      try {
        const parsed = JSON.parse(messageData);
        const { type, text, author, playlistId, commentId } = parsed;

        if (type === 'getComments') {
          const comments = await Comment.find({ playlist: playlistId })
            .sort({ createdAt: 1 })
            .populate('author', 'username avatar');

          ws.send(
            JSON.stringify({
              type: 'history',
              playlistId,
              data: comments,
            })
          );
        }

        if (type === 'addComment') {
          const newComment = new Comment({ text, author, playlist: playlistId });
          await newComment.save();
          await newComment.populate('author', 'username avatar');

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: 'commentAdded',
                  playlistId,
                  data: newComment,
                })
              );
            }
          });
        }

        if (type === 'deleteComment') {
          const deletedComment = await Comment.findByIdAndDelete(commentId);
          if (deletedComment) {
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    type: 'commentDeleted',
                    playlistId: deletedComment.playlist.toString(),
                    commentId,
                  })
                );
              }
            });
          }
        }
      } catch (err) {
        console.error('Ошибка WebSocket (комментарии):', err);
      }
    });

    ws.on('close', () => {
      console.log('Клиент отключился от WebSocket (комментарии)');
    });
  });
};
