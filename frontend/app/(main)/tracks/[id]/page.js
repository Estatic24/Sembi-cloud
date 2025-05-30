'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { TrackService } from '@/services/track'
import { usePlayer } from '@/context/PlayerContext'
import { motion } from 'framer-motion'

export default function TrackPage() {
  const { id } = useParams()
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()
  const [track, setTrack] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: trackData } = await TrackService.getById(id)
        setTrack(trackData)
      } catch (err) {
        setError('Ошибка загрузки трека')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id])

  const handlePlay = () => {
    if (track) {
      if (currentTrack?._id === track._id) {
        togglePlay()
      } else {
        playTrack(track, [track])
      }
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="animate-pulse text-purple-600 text-lg">Загрузка трека...</div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-red-600 text-lg">{error}</div>
    </div>
  )

  if (!track) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-purple-600 text-lg">Трек не найден</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            SC
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{track.title}</h1>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
            <img 
              src='/defaultcover.png'
              alt={track.title}
              className="h-full w-full object-cover rounded-xl"
            />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">{track.artist}</p>
            <p className="text-sm text-gray-500">{track.genre}</p>
            <p className="text-xs text-gray-400 mt-1">
              {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
            </p>
          </div>
        </div>

        {track.description && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-600 mb-6 p-4 bg-gray-50 rounded-lg"
          >
            {track.description}
          </motion.p>
        )}

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gray-50 rounded-xl p-4 mb-6"
        >
          <button 
            onClick={handlePlay}
            className={`px-6 py-2 rounded-full font-medium ${currentTrack?._id === track._id && isPlaying ? 'bg-red-500 text-white' : 'bg-purple-600 text-white'}`}
          >
            {currentTrack?._id === track._id && isPlaying ? 'Пауза' : 'Слушать'}
          </button>
        </motion.div>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Загружено: {new Date(track.createdAt).toLocaleDateString()}</span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {track.views || 0} прослушиваний
          </span>
        </div>
      </motion.div>
    </div>
  )
}