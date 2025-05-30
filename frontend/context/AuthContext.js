"use client";

import React, { createContext, useState, useEffect, useContext } from 'react'
import api from '../services/api'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = Cookies.get('accessToken')
        if (!token) {
          setLoading(false)
          return
        }
        
        const res = await api.get('/users/profile')
        setUser(res.data)
      } catch (error) {
        console.error('Auth error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const login = async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials)
      Cookies.set('accessToken', res.data.accessToken)
      Cookies.set('refreshToken', res.data.refreshToken)
      setUser(res.data.user)
      return true
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}