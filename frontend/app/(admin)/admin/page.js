'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaUsers, FaMusic, FaList, FaChartBar, FaUserShield, FaTrash, FaCheck, FaTimes } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { AdminService } from '@/services/admin'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [tracks, setTracks] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, tracksData, playlistsData] = await Promise.all([
        AdminService.getStats(),
        AdminService.getUsers(),
        AdminService.getTracks(),
        AdminService.getPlaylists()
      ]);
      
      setStats(statsData.data);
      setUsers(usersData.data.users);
      setTracks(tracksData.data.tracks);
      setPlaylists(playlistsData.data.playlists);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
  }, []);

  const approveTrack = async (trackId) => {
  try {
    const response = await AdminService.approveTrack(trackId);
    
    setTracks(tracks.map(track => 
      track._id === trackId ? { ...track, isApproved: true } : track
    ));
    
    if (stats) {
      setStats({
        ...stats,
        pendingTracksCount: stats.pendingTracksCount - 1,
        tracksCount: stats.tracksCount + 1
      });
    }
    
    toast.success('Трек успешно одобрен');
  } catch (error) {
    console.error('Ошибка при одобрении трека:', error);
    toast.error(error.response?.data?.message || 'Ошибка при одобрении трека');
  }
};

  const changeUserRole = async (userId, newRole) => {
    try {
      await AdminService.changeUserRole(userId, newRole)
      setUsers(users.map(u => 
        u._id === userId ? { ...u, role: newRole } : u
      ))
      toast.success('Роль пользователя изменена')
    } catch {
      toast.error('Ошибка изменения роли')
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Вы уверены, что хотите удалить пользователя?')) return
    
    try {
      await AdminService.deleteUser(userId)
      setUsers(users.filter(u => u._id !== userId))
      toast.success('Пользователь удален')
    } catch {
      toast.error('Ошибка удаления пользователя')
    }
  }

  const deleteTrack = async (trackId) => {
    if (!confirm('Вы уверены, что хотите удалить трек?')) return
    
    try {
      await AdminService.deleteTrack(trackId)
      setTracks(tracks.filter(t => t._id !== trackId))
      toast.success('Трек удален')
    } catch {
      toast.error('Ошибка удаления трека')
    }
  }

  const deletePlaylist = async (playlistId) => {
    if (!confirm('Вы уверены, что хотите удалить плейлист?')) return
    
    try {
      await AdminService.deletePlaylist(playlistId)
      setPlaylists(playlists.filter(p => p._id !== playlistId))
      toast.success('Плейлист удален')
    } catch {
      toast.error('Ошибка удаления плейлиста')
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Управление пользователями</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              src={user.avatar || '/default-avatar.png'} 
                              alt={user.username}
                              className="h-10 w-10 rounded-full"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => changeUserRole(user._id, e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                        >
                          <option value="user">Пользователь</option>
                          <option value="admin">Администратор</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <FaTrash /> Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'tracks':
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Управление треками</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Артист</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tracks.map(track => (
                    <tr key={track._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{track.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{track.artist}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                           track.isApproved 
                           ? 'bg-green-100 text-green-800' 
                           : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {track.isApproved ? 'Одобрен' : 'Ожидает'}
                       </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                         {!track.isApproved && (
                        <button
                          onClick={() => approveTrack(track._id)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        >
                          <FaCheck /> Одобрить
                        </button>
                        )}
                        <button
                          onClick={() => deleteTrack(track._id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                        <FaTrash /> Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'playlists':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Управление плейлистами</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Название</th>
                    <th className="px-4 py-2 text-left">Автор</th>
                    <th className="px-4 py-2 text-left">Треков</th>
                    <th className="px-4 py-2 text-left">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {playlists.map(playlist => (
                    <tr key={playlist._id} className="border-b">
                      <td className="px-4 py-3">{playlist.title}</td>
                      <td className="px-4 py-3">
                        {playlist.createdBy?.username || 'Неизвестный'}
                      </td>
                      <td className="px-4 py-3">{playlist.tracks?.length || 0}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deletePlaylist(playlist._id)}
                          className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                        >
                          <FaTrash /> Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      default:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Статистика</h2>
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard 
                  icon={<FaUsers className="text-blue-500 text-2xl" />}
                  title="Пользователи"
                  value={stats.usersCount}
                />
                <StatCard 
                  icon={<FaMusic className="text-purple-500 text-2xl" />}
                  title="Треки"
                  value={stats.tracksCount}
                />
                <StatCard 
                  icon={<FaList className="text-green-500 text-2xl" />}
                  title="Плейлисты"
                  value={stats.playlistsCount}
                />
                <StatCard 
                  icon={<FaUserShield className="text-yellow-500 text-2xl" />}
                  title="На модерации"
                  value={stats.pendingTracksCount}
                />
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Панель администратора</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 bg-white rounded-lg shadow p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
              >
                <FaChartBar />
                Статистика
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'users' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
              >
                <FaUsers />
                Пользователи
              </button>
              <button
                onClick={() => setActiveTab('tracks')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'tracks' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
              >
                <FaMusic />
                Треки
              </button>
              <button
                onClick={() => setActiveTab('playlists')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'playlists' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
              >
                <FaList />
                Плейлисты
              </button>
            </nav>
          </div>
          
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
      <div className="bg-white p-3 rounded-full shadow">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}