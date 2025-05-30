'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PlaylistService } from '@/services/playlist'
import { TrackService } from '@/services/track'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { UploadButton } from '@/lib/uploadthing'

export default function EditPlaylistPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [playlist, setPlaylist] = useState(null)
  const [tracks, setTracks] = useState([])
  const [availableTracks, setAvailableTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [playlistRes, tracksRes] = await Promise.all([
          PlaylistService.getById(id),
          TrackService.getAllTracks()
        ])
        
        if (playlistRes.data.createdBy._id !== user?._id) {
          router.push(`/playlist/${id}`)
          return
        }

        setPlaylist(playlistRes.data)
        setTracks(playlistRes.data.tracks)
        setAvailableTracks(tracksRes.data)
      } catch (error) {
        setError('Ошибка загрузки данных')
        console.error('Ошибка загрузки:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) loadData()
  }, [id, user, router])

  const handleCoverUpload = (res) => {
    if (res?.[0]?.url) {
      setPlaylist(prev => ({ ...prev, coverImage: res[0].url }))
      setSuccess('Обложка обновлена')
      setError(null)
    }
  }

  const handleAddTrack = (track) => {
    if (!tracks.some(t => t._id === track._id)) {
      setTracks(prev => [...prev, track])
    }
  }

  const handleRemoveTrack = (trackId) => {
    setTracks(prev => prev.filter(t => t._id !== trackId))
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError(null)
  
  try {
      const updatedPlaylist = {
      title: playlist.title,
      description: playlist.description,
      genre: playlist.genre,
      coverImage: playlist.coverImage,
      tracks: tracks.map(t => t._id)
    }

    const { data } = await PlaylistService.update(id, updatedPlaylist)
    
    setPlaylist(data)
    setTracks(data.tracks)
    
    setSuccess('Плейлист успешно обновлен!')
    setTimeout(() => router.push(`/playlist/${id}`), 1500)
  } catch (err) {
    setError(err.response?.data?.message || 'Ошибка обновления плейлиста')
    console.error('Ошибка при обновлении:', err)
  } finally {
    setLoading(false)
  }
}

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="animate-pulse text-purple-600 text-lg">Загрузка...</div>
    </div>
  )

  if (!playlist) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-purple-600 text-lg">Плейлист не найден</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            SC
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Редактировать плейлист
          </h1>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg mb-6 text-center"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg mb-6 text-center"
          >
            {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-40 h-40 mb-4">
              <img
                src={playlist.coverImage || '/default-cover.png'}
                alt="Обложка плейлиста"
                className="w-full h-full rounded-xl object-cover border-4 border-purple-100 shadow-md"
              />
              <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <UploadButton
                  endpoint="coverUploader"
                  onClientUploadComplete={handleCoverUpload}
                  onUploadError={() => setError('Ошибка загрузки обложки')}
                  appearance={{
                    button: 'bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 rounded-full text-white hover:from-purple-700 hover:to-pink-600 transition-all shadow-md',
                  }}
                />
              </div>
            </div>
            <span className="text-sm text-gray-500">Нажмите для загрузки обложки</span>
          </motion.div>

          {/* Title */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название плейлиста<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={playlist.title}
              onChange={(e) => setPlaylist(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </motion.div>

          {/* Description */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={playlist.description}
              onChange={(e) => setPlaylist(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </motion.div>

          {/* Genre */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Жанр</label>
            <input
              type="text"
              value={playlist.genre}
              onChange={(e) => setPlaylist(prev => ({ ...prev, genre: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </motion.div>

          {/* Current Tracks */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">Текущие треки</label>
            <div className="max-h-60 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 custom-scrollbar">
              {tracks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Нет добавленных треков</p>
              ) : (
                tracks.map((track) => (
                  <motion.div
                    key={track._id}
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{track.title}</p>
                        <p className="text-sm text-gray-500">{track.artist}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveTrack(track._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Available Tracks */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">Доступные треки</label>
            <div className="max-h-60 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 custom-scrollbar">
              {availableTracks
                .filter(t => !tracks.some(pt => pt._id === t._id))
                .map(track => (
                  <motion.div
                    key={track._id}
                    whileHover={{ x: 5 }}
                    onClick={() => handleAddTrack(track)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{track.title}</p>
                      <p className="text-sm text-gray-500">{track.artist}</p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <motion.button
              type="button"
              onClick={() => router.push(`/playlists/${id}`)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              Отмена
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-2 rounded-lg font-semibold text-white shadow-md transition
                ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 hover:shadow-lg'}`}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}