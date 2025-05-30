'use client'

import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'next/navigation'


export default function MainLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  if (loading || !user) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>
  }

  return (
    <>
      <main>{children}</main>
    </>
  )
}
