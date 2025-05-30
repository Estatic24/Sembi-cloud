'use client'

import { useEffect, useState } from 'react'
import { PlaylistService } from '@/services/playlist'
import { TrackService } from '@/services/track'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function HomePage() {
  const { user } = useAuth() || {}
  const [playlists, setPlaylists] = useState([])
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [randomTracks, setRandomTracks] = useState([])
  const [randomPlaylists, setRandomPlaylists] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [
          { data: tracksData },
          { data: randomTracksData },
          { data: randomPlaylistsData }
        ] = await Promise.all([
          TrackService.getAllTracks(),
          TrackService.getRandom(5),
          PlaylistService.getRandom(5)
        ])
        setTracks(tracksData)
        setRandomTracks(randomTracksData)
        setRandomPlaylists(randomPlaylistsData)
      } catch (err) {
        console.error('Ошибка загрузки:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-6 text-center">Загрузка...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="flex flex-col md:flex-row items-center gap-12 mb-16">
        <div className="md:w-1/2">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Откройте мир музыки с Sembi Cloud
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg">
            Создавайте, делитесь и открывайте новые плейлисты вместе с сообществом. Реальные взаимодействия в реальном времени.
          </p>
          <Link
            href={user ? '/playlists' : '/register'}
            className="inline-block px-8 py-3 bg-gradient-to-br from-purple-600 to-purple-400 text-white font-medium rounded-full hover:opacity-90 shadow-lg transition-all"
          >
            Начать бесплатно
          </Link>
        </div>
        <div className="md:w-1/2 rounded-2xl overflow-hidden shadow-xl">
          <img
            src="https://utfs.io/f/cqXP9NlENj5xy7mS45FkXVOjicSeLM0hJmF3uKYGqIC5E9rD"
            alt="Music App"
            className="w-full h-auto brightness-80"
          />
        </div>
      </section>

      <section className="mb-16 bg-gradient-to-br from-purple-600 to-purple-400 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Новый релиз недели</h2>
          <p className="text-purple-100 mb-6">Послушайте новый альбом Sigma Ryan - эксклюзивно на Sembi Cloud</p>
          <button className="px-6 py-2 bg-white text-purple-600 font-medium rounded-full hover:bg-opacity-90 transition-all">
            Слушать сейчас
          </button>
        </div>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute -bottom-16 right-1/4 w-36 h-36 bg-white bg-opacity-10 rounded-full"></div>
      </section>

      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Популярные плейлисты</h2>
          <Link href="/playlists" className="text-purple-600 font-medium hover:underline">
            Посмотреть все
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {randomPlaylists.map((playlist) => (
            <PlaylistCard key={playlist._id} playlist={playlist} />
          ))}
        </div>
      </section>

      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Рекомендуемые песни</h2>
          <Link href="/tracks" className="text-purple-600 font-medium hover:underline">
            Смотреть все
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {randomTracks.map((track) => (
            <TrackCard key={track._id} track={track} />
          ))}
        </div>
      </section>
    </div>
  )
}

function TrackCard({ track }) {
  return (
    <Link href={`/tracks/${track._id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all">
        <div className="relative h-40 overflow-hidden">
          <img
            src='/photo.jpg'
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold truncate">{track.title}</h3>
          <p className="text-sm text-gray-500 truncate">{track.artist || 'Неизвестный артист'}</p>
        </div>
      </div>
    </Link>
  )
}

function PlaylistCard({ playlist }) {
  return (
    <Link href={`/playlist/${playlist._id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all">
        <div className="relative h-40 overflow-hidden">
          <img
            src={playlist.coverImage || '/playlist-placeholder.jpg'}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white font-medium">Открыть</span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold truncate">{playlist.name}</h3>
          <p className="text-sm text-gray-500 truncate">
            {playlist.tracks?.length || 0} треков
          </p>
        </div>
      </div>
    </Link>
  )
}
