'use client'
import { useState, useEffect } from 'react'
import { TrackService } from '@/services/track'
import { PlaylistService } from '@/services/playlist'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function TracksPage() {
  const { user } = useAuth()
  const [tracks, setTracks] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTracks()
    fetchPlaylists()
  }, [])

  const fetchTracks = async () => {
    try {
      const { data } = await TrackService.getApproved()
      setTracks(data)
    } catch (err) {
      console.error('Error fetching tracks:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlaylists = async () => {
    if (!user) return
    try {
      const { data } = await PlaylistService.getById(user._id)
      setPlaylists(data)
    } catch (err) {
      console.error('Error fetching playlists:', err)
    }
  }

  const addToPlaylist = async (playlistId, trackId) => {
    try {
      await TrackService.addToPlaylist(playlistId, trackId)
      fetchTracks()
    } catch (err) {
      console.error('Error adding to playlist:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Треки</h1>
        {user && (
          <Link
            href="/upload"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Добавить трек
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((track) => (
          <motion.div
            key={track._id}
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="relative h-48 w-full">
              <img
                src={track.coverImage || '/default-cover.png'}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">{track.title}</h3>
              <p className="text-gray-600">{track.artist}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-500">
                  {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                </span>
                {user && playlists.length > 0 && (
                  <div className="relative group">
                    <button className="text-sm text-purple-600 hover:text-purple-800">
                      Добавить в плейлист
                    </button>
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                      {playlists.map((playlist) => (
                        <button
                          key={playlist._id}
                          onClick={() => addToPlaylist(playlist._id, track._id)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          {playlist.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
