'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { UserService } from '@/services/user'
import { PlaylistService } from '@/services/playlist'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const favoritesData = await UserService.getFavorites()
      setFavorites(Array.isArray(favoritesData) ? favoritesData : [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch favorites:', err)
      setError('Ошибка загрузки избранного')
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (playlistId) => {
    try {
      await PlaylistService.toggleFavorite(playlistId)
      
      await fetchFavorites()
    } catch (err) {
      console.error('Failed to remove favorite:', err)
      setError('Ошибка при удалении из избранного')
    }
  }

  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-purple-600 text-lg flex items-center gap-2"
      >
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Загрузка избранного...
      </motion.div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-red-600 text-lg">{error}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Мои избранные плейлисты</h1>
          <p className="text-gray-600">Все плейлисты, которые вы добавили в избранное</p>
        </motion.div>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-xl shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <p className="text-gray-500 mb-4">У вас пока нет избранных плейлистов</p>
            <Link 
              href="/" 
              className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:opacity-90 transition-all"
            >
              Найти плейлисты
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {favorites.map((playlist) => (
              <motion.div
                key={playlist._id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
              >
                <Link href={`/playlist/${playlist._id}`} className="flex">
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={playlist.coverImage || '/default-cover.png'}
                      alt={playlist.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{playlist.title}</h3>
                    <div className="flex items-center mb-2">
                      <img
                        src={playlist.createdBy?.avatar || '/default-avatar.png'}
                        alt={playlist.createdBy?.username || 'Неизвестный автор'}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span className="text-sm text-gray-500">
                        {playlist.createdBy?.username || 'Неизвестный автор'}
                      </span>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveFavorite(playlist._id);
                  }}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Удалить из избранного
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}