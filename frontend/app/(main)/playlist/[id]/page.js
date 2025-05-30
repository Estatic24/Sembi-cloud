'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PlaylistService } from '@/services/playlist'
import { TrackService } from '@/services/track'
import { CommentService } from '@/services/comment'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function PlaylistPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')

  const wsRef = useRef(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connectWebSocket = () => {
    if (!id) return

    const wsUrl = (process.env.NEXT_PUBLIC_WS_URL || 'wss://sembi-cloud.onrender.com') + `?playlistId=${id}`
    wsRef.current = new WebSocket(wsUrl)

    wsRef.current.onopen = () => {
      console.log('WebSocket connection established')
      reconnectAttempts.current = 0
      // Запрашиваем комментарии при подключении
      wsRef.current.send(JSON.stringify({
        type: 'getComments',
        playlistId: id
      }))
    }

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        console.log('WebSocket message received:', message)
        
        switch (message.type) {
          case 'history':
            setComments(message.data)
            break
          case 'commentAdded':
            setComments(prev => [...prev, message.data])
            break
          case 'commentDeleted':
            setComments(prev => prev.filter(c => c._id !== message.commentId))
            break
          default:
            console.warn('Unknown message type:', message.type)
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err)
      }
    }

    wsRef.current.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason)
      if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
        console.log(`Reconnecting in ${delay}ms...`)
        reconnectAttempts.current++
        setTimeout(connectWebSocket, delay)
      }
    }

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const { data } = await PlaylistService.getById(id)
        setPlaylist(data)
        setIsLiked(data.likes.includes(user?._id))
        setIsFavorite(user?.favorites?.includes(id))
        setLikeCount(data.likes.length)
      } catch (err) {
        setError('Ошибка загрузки плейлиста')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [id, user])

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !user || !wsRef.current) return
    
    try {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'addComment',
          text: newComment.trim(),
          author: user._id,
          playlistId: id
        }))
        setNewComment('')
      } else {
        // Fallback к HTTP
        const { data } = await CommentService.create(id, newComment.trim())
        setComments(prev => [...prev, data])
        setNewComment('')
      }
    } catch (err) {
      console.error('Ошибка при отправке комментария:', err)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'deleteComment',
          commentId,
          userId: user._id
        }))
      } else {
        await CommentService.delete(commentId)
        setComments(prev => prev.filter(c => c._id !== commentId))
      }
    } catch (err) {
      console.error('Ошибка при удалении комментария:', err)
    }
  }
  
  const handleLike = async () => {
    if (!user) return router.push('/login')
    try {
      await PlaylistService.toggleLike(id)
      setIsLiked(!isLiked)
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
    } catch (err) {
      console.error('Ошибка при лайке:', err)
    }
  }

  const handleFavorite = async () => {
    if (!user) return router.push('/login')
    try {
      await PlaylistService.toggleFavorite(id)
      setIsFavorite(!isFavorite)
    } catch (err) {
      console.error('Ошибка при добавлении в избранное:', err)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="animate-pulse text-purple-600 text-lg">Загрузка плейлиста...</div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-red-600 text-lg">{error}</div>
    </div>
  )

  if (!playlist) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-purple-600 text-lg">Плейлист не найден</div>
    </div>
  )

  const isAuthor = user?._id === playlist.createdBy?._id

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6 pb-32">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
      >
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative w-full md:w-64 h-64 flex-shrink-0"
          >
            <img
              src={playlist.coverImage || '/default-cover.png'}
              alt={playlist.title}
              className="w-full h-full rounded-xl object-cover border-4 border-purple-100 shadow-md"
            />
          </motion.div>

          <div className="flex-1">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{playlist.title}</h1>
              <p className="text-gray-600 mb-4">{playlist.description || 'Без описания'}</p>
              {playlist.genre && (
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm mb-4">
                  {playlist.genre}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${isLiked ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{likeCount}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFavorite}
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${isFavorite ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>Избранное</span>
              </motion.button>

              {isAuthor && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/playlist/${id}/edit`)}
                  className="ml-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full hover:opacity-90 transition-all"
                >
                  Редактировать
                </motion.button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            Треки
          </h2>

          {playlist.tracks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
              <p>В этом плейлисте пока нет треков</p>
              {isAuthor && (
                <button 
                  onClick={() => router.push(`/playlists/${id}/edit`)}
                  className="mt-4 px-4 py-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors"
                >
                  Добавить треки
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {playlist.tracks.map((track, index) => (
                <motion.div
                  key={track._id}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/tracks/${track._id}`)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 w-6 text-right">{index + 1}</span>
                    <div>
                      <h3 className="font-medium text-gray-800">{track.title}</h3>
                      <p className="text-sm text-gray-500">{track.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                      {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Комментарии
        </h2>

        {comments.length === 0 ? (
          <p className="text-gray-500 mb-4">Пока нет комментариев</p>
        ) : (
          <div className="space-y-3 mb-6">
            {comments.map((comment) => (
              <motion.div
                key={comment._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={comment.author?.avatar || '/default-avatar.png'}
                      alt={comment.author?.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-medium">{comment.author?.username || 'Гость'}</span>
                  </div>
                  {user?._id === comment.author?._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-gray-700">{comment.text}</p>
              </motion.div>
            ))}
          </div>
        )}

        {user ? (
          <div className="space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Написать комментарий..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <motion.button
              onClick={handleCommentSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!newComment.trim()}
              className={`px-4 py-2 rounded-lg font-medium text-white ${!newComment.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600'}`}
            >
              Отправить
            </motion.button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-2">Чтобы оставить комментарий, войдите в систему</p>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:opacity-90"
            >
              Войти
            </button>
          </div>
        )}
      </div>
      </motion.div>
    </div>
    
  )
}
