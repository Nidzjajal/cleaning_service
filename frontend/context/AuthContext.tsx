'use client'
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ requiresPasswordReset?: boolean }>
  logout: () => void
  refreshUser: () => Promise<void>
  updateUser: (newUser: User) => void
  isAuthenticated: boolean
}


const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const updateUser = useCallback((newUser: User) => {
    setUser(newUser)
    localStorage.setItem('hl_user', JSON.stringify(newUser))
  }, [])


  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('hl_token')
    localStorage.removeItem('hl_user')
    if (api.defaults.headers.common['Authorization']) {
      delete api.defaults.headers.common['Authorization']
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data.user)
    } catch (err: any) {
      console.error('Session verification failed, logging out...')
      logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/login?error=session_invalid'
      }
    }
  }, [logout])

  useEffect(() => {
    const savedToken = localStorage.getItem('hl_token')
    const savedUser = localStorage.getItem('hl_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    const { token: newToken, user: newUser, requiresPasswordReset } = res.data
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('hl_token', newToken)
    localStorage.setItem('hl_user', JSON.stringify(newUser))
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    return { requiresPasswordReset }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
