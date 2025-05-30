'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlaylistService } from '@/services/playlist'
import { motion } from 'framer-motion'
import { useDebounce } from '@/hooks/useDebounce'

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    if (debouncedQuery.trim()) {
      handleSearch()
    } else {
      setResults([])
    }
  }, [debouncedQuery])

  const handleSearch = async (e) => {
  e?.preventDefault();
  
  if (!query.trim()) {
    setError('Пожалуйста, введите поисковый запрос');
    return;
  }

  setLoading(true);
  setError(null);
  
  try {
    const response = await PlaylistService.search(query);
    
    if (response.data.success === false) {
      throw new Error(response.data.message || 'Ошибка при выполнении поиска');
    }

    setResults(response.data.data || []);
    
  } catch (error) {
    console.error('Search error:', error);
    let errorMessage = 'Ошибка при выполнении поиска';
    if (error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    } else if (error.request) {
      errorMessage = 'Не удалось соединиться с сервером';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    setError(errorMessage);
    setResults([]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-6"
        >
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск плейлистов, жанров или пользователей..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`px-6 py-3 rounded-lg font-medium text-white ${!query.trim() || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600'}`}
            >
              {loading ? 'Поиск...' : 'Найти'}
            </button>
          </form>
        </motion.div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : results.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {results.map((playlist) => (
              <motion.div
                key={playlist._id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 cursor-pointer"
                onClick={() => router.push(`/playlist/${playlist._id}`)}
              >
                <div className="flex">
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={playlist.coverImage || '/default-cover.png'}
                      alt={playlist.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{playlist.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{playlist.genre || 'Без жанра'}</p>
                    <div className="flex items-center">
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
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          query && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Ничего не найдено. Попробуйте другой запрос.</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}