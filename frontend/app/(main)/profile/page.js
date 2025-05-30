'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { UserService } from '../../../services/user'
import { UploadButton } from '../../../lib/uploadthing'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: '',
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [profileResp, playlistsResp] = await Promise.all([
          UserService.getProfile(),
          UserService.getMyPlaylists(),
        ])
        console.log('Playlists response:', playlistsResp) 
        setProfile(profileResp.data)
        setPlaylists(playlistsResp.data)
        setFormData({
          username: profileResp.data.username,
          email: profileResp.data.email,
          avatar: profileResp.data.avatar || '',
        })
      } catch {
        setError('Ошибка загрузки данных')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAvatarUpload = (res) => {
    if (res && res[0]?.url) {
      setFormData((prev) => ({ ...prev, avatar: res[0].url }))
      setSuccess('Аватар обновлен')
      setError(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const updated = {
        username: formData.username,
        email: formData.email,
        avatar: formData.avatar,
      }
      const { data } = await UserService.updateProfile(updated)
      setProfile(data)
      setSuccess('Профиль успешно обновлен')
    } catch {
      setError('Ошибка обновления профиля')
    }
  }

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
        Загрузка профиля...
      </motion.div>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-purple-600 text-lg">Профиль не найден</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Мой профиль</h1>
          <Link 
              href="/favorites" 
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
              Избранное
            </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20"
            >
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col items-center mb-6">
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      className="relative group"
                    >
                      <img
                        src={formData.avatar || '/default-avatar.png'}
                        alt="Аватар"
                        className="w-32 h-32 rounded-full object-cover border-4 border-purple-100 shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <UploadButton
                          endpoint="avatarUploader"
                          onClientUploadComplete={handleAvatarUpload}
                          onUploadError={() => setError('Ошибка загрузки аватара')}
                          appearance={{
                            button: 'bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 rounded-full text-white hover:from-purple-700 hover:to-pink-600 transition-all shadow-md',
                          }}
                        />
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error && (
                      <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-center font-medium mb-4">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-center font-medium mb-4">
                        {success}
                      </div>
                    )}
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1">Имя пользователя</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="pt-4"
                  >
                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Сохранить изменения
                    </button>
                  </motion.div>
                </form>

                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6"
                >
                  <button
                    onClick={logout}
                    className="w-full py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Выйти из аккаунта
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20 h-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  Мои плейлисты
                </h2>

                {playlists.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-8 text-gray-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <p>У вас пока нет плейлистов</p>
                    <Link href="/create-playlist" className="mt-2 inline-block text-purple-600 hover:text-purple-500 font-medium transition-colors">
                      Создать плейлист
                    </Link>
                  </motion.div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {playlists.map((playlist, index) => (
                      <motion.div
                        key={playlist._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href={`/playlist/${playlist._id}`}
                          className="block p-4 bg-gray-50 hover:bg-purple-50 rounded-lg transition-all group border border-gray-100"
                        >
                          <h3 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors truncate">{playlist.title}</h3>
                          <p className="text-sm text-gray-500 truncate">{playlist.description || 'Без описания'}</p>
                          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                            <span>
                              {Array.isArray(playlist.tracks) ? playlist.tracks.length : 0} треков
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c4b5fd;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8b5cf6;
        }
      `}</style>
    </div>
  )
}