'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlaylistService } from '@/services/playlist'
import { TrackService } from '@/services/track'
import { useAuth } from '@/hooks/useAuth'
import { UploadButton } from '@/lib/uploadthing'
import { motion } from 'framer-motion'

export default function CreatePlaylistPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    genre: '',
    tracks: []
  })
  const [availableTracks, setAvailableTracks] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchTracks() {
      try {
        const { data } = await TrackService.getAllTracks()
        setAvailableTracks(data)
      } catch (e) {
        setError('Не удалось загрузить треки')
      }
    }

    if (user) fetchTracks()
  }, [user])

  const handleCoverUpload = (res) => {
    if (res?.[0]?.url) {
      setFormData(prev => ({ ...prev, coverImage: res[0].url }))
      setSuccess('Обложка загружена')
      setError(null)
    }
  }

  const handleTrackToggle = (trackId) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.includes(trackId)
        ? prev.tracks.filter(id => id !== trackId)
        : [...prev.tracks, trackId]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data } = await PlaylistService.create(formData)
      setSuccess('Плейлист успешно создан!')
      setTimeout(() => router.push(`/playlist/${data._id}`), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка создания плейлиста')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Для создания плейлиста нужно войти в систему</h2>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full hover:opacity-90 transition-all"
          >
            Войти
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            SC
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Создать плейлист
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
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-40 h-40 mb-4">
              <img
                src={formData.coverImage || '/default-cover.png'}
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

          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название плейлиста<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Жанр</label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">Выберите треки</label>
            <div className="max-h-60 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 custom-scrollbar">
              {availableTracks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Нет доступных треков</p>
              ) : (
                availableTracks.map((track) => (
                  <motion.label
                    key={track._id}
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.tracks.includes(track._id)}
                      onChange={() => handleTrackToggle(track._id)}
                      className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{track.title}</p>
                      <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                    </span>
                  </motion.label>
                ))
              )}
            </div>
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading || !formData.title}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition
              ${loading || !formData.title
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 hover:shadow-lg'}`}
          >
            {loading ? (
              <span className="flex justify-center items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Создание...
              </span>
            ) : (
              'Создать плейлист'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}