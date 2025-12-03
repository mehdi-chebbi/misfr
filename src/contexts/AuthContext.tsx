'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  name: string
  last_name: string
  email: string
  institution?: string
  phone_number?: string
  role: 'admin' | 'user'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (userData: {
    name: string
    last_name: string
    email: string
    password: string
    institution?: string
    phone_number?: string
  }) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  loading: boolean
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
        }
      }
    } catch (error) {
      // Gracefully handle server unavailable - don't crash the app
      console.log('Auth server unavailable, continuing without authentication')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        throw new Error('Server unavailable')
      }

      const data = await response.json()
      
      if (data.success) {
        setUser(data.user)
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      return { success: false, message: 'Login server unavailable. Please ensure the authentication server is running on port 5001.' }
    }
  }

  const register = async (userData: {
    name: string
    last_name: string
    email: string
    password: string
    institution?: string
    phone_number?: string
  }) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        throw new Error('Server unavailable')
      }

      const data = await response.json()
      
      if (data.success) {
        setUser(data.user)
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      return { success: false, message: 'Registration server unavailable. Please ensure the authentication server is running on port 5001.' }
    }
  }

  const logout = async () => {
    try {
      await fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.log('Logout server unavailable, clearing local session')
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  )
}