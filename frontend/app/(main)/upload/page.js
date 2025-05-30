'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadButton } from '@/lib/uploadthing'
import { TrackService } from '@/services/track'
import { motion } from 'framer-motion'

export default function UploadTrackPage() {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [genre, setGenre] = useState('')
  const [duration, setDuration] = useState('')
  const [audioUrl, setAudioUrl] = useState('')

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()  

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        title,
        artist,
        genre,
        duration,
        audioUrl,
      }

      const { data } = await TrackService.suggestTrack(payload)
      setSuccess('Трек успешно загружен!')
      setTimeout(() => router.push('/'), 1500)
    } catch (err) {
      console.error(err)
      setError('Ошибка при загрузке трека')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            SC
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Загрузка трека
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
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Название трека</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Исполнитель</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
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
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Продолжительность (секунды)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="pt-2"
          >
            <label className="block text-sm font-medium text-gray-700 mb-3">Аудиофайл</label>
            {audioUrl ? (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                Файл успешно загружен!
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <UploadButton
                  endpoint="audioUploader"
                  onClientUploadComplete={(res) => {
                    setAudioUrl(res[0].url)
                  }}
                  onUploadError={(err) => {
                    console.error(err)
                    setError('Ошибка загрузки файла')
                  }}
                  appearance={{
                    button: "bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 rounded-full text-white hover:from-purple-700 hover:to-pink-600 transition-all shadow-md",
                  }}
                />
                <p className="mt-2 text-sm text-gray-500">Перетащите файл сюда или нажмите для выбора</p>
              </div>
            )}
          </motion.div>

          <motion.button
            type="submit"
            disabled={!audioUrl || !title || !artist || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition
              ${(!audioUrl || !title || !artist || loading) 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 hover:shadow-lg'}`}
          >
            {loading ? (
              <span className="flex justify-center items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Загрузка...
              </span>
            ) : (
              'Загрузить трек'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}