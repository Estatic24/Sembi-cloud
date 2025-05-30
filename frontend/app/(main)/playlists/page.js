'use client'

import { useEffect, useState } from 'react'
import { PlaylistService } from '@/services/playlist'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function PlaylistsPage() {
  const { user } = useAuth() || {};
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
  async function fetchPlaylists() {
    try {
      setLoading(true);
      setError(null);
      console.log('Запрос плейлистов...');
      const { data } = await PlaylistService.getAllPlaylists();
      console.log('Получены плейлисты:', data);
      setPlaylists(data);
    } catch (err) {
      console.error('Полная ошибка загрузки:', {
        message: err.message,
        response: err.response?.data,
        stack: err.stack
      });
      setError(`Ошибка: ${err.message || 'Неизвестная ошибка сервера'}`);
    } finally {
      setLoading(false);
    }
  }

  fetchPlaylists();
}, []);

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-6 text-center">Загрузка плейлистов...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Все плейлисты</h1>
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Поиск плейлистов..."
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>

      {user && (
        <div className="mb-8">
          <Link
            href="/playlist/create"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Создать плейлист
          </Link>
        </div>
      )}

      {filteredPlaylists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Плейлисты не найдены</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-purple-600 hover:underline"
            >
              Очистить поиск
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredPlaylists.map((playlist) => (
            <PlaylistCard key={playlist._id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlaylistCard({ playlist }) {
  return (
    <Link href={`/playlist/${playlist._id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all h-full flex flex-col">
        <div className="relative h-40 overflow-hidden">
          <img
            src={playlist.coverImage || '/playlist-placeholder.jpg'}
            alt={playlist.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white font-medium">Открыть</span>
          </div>
        </div>
        <div className="p-4 flex-grow">
          <h3 className="font-semibold truncate">{playlist.title}</h3>
          <p className="text-sm text-gray-500 truncate">
            {playlist.tracks?.length || 0} треков
          </p>
          {playlist.createdBy && (
            <p className="text-xs text-gray-400 mt-2">
              Создатель: {playlist.createdBy.username || 'Неизвестный пользователь'}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}