'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              SC
            </div>
            <Link href="/" className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Sembi Cloud
            </Link>
          </div>

          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="font-medium hover:text-purple-600 transition-colors">
              Главная
            </Link>
            <Link href="/search" className="font-medium hover:text-purple-600 transition-colors">
              Поиск
            </Link>
            {user && (
              <Link href="/playlist/create" className="font-medium hover:text-purple-600 transition-colors">
                Создать плейлист
              </Link>
            )}
            {user?.role === 'admin' && (  // Изменили isAdmin на role === 'admin'
              <Link href="/admin" className="font-medium hover:text-purple-600 transition-colors">
                Админка
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <div className="flex items-center space-x-4">
                  <Link href="/profile" className="text-sm font-medium hover:text-purple-600">
                    {user.username}
                  </Link>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-purple-600 border border-purple-600 rounded-full hover:bg-purple-50 transition-colors"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-purple-600 border border-purple-600 rounded-full hover:bg-purple-50 transition-colors"
                >
                  Вход
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-purple-600 to-purple-400 rounded-full hover:opacity-90 shadow-md transition-all"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}