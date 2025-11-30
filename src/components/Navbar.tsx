'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { User, LogOut, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [microsoftLoading, setMicrosoftLoading] = useState(false)
  const { user, logout, loading } = useAuth()

  const navItems = [
    { name: 'Home', href: '/', icon: '🏡' },
    { name: 'Geoportal', href: '/map', icon: '🗺️' },
    { name: 'AI Chat', href: '/ai-chat', icon: '🤖' },
    { name: 'Journey', href: '/journey', icon: '🌍' },
    { name: 'About', href: '/#features', icon: '🌳' }
  ]

  const handleLogout = async () => {
    await logout()
    setIsProfileMenuOpen(false)
    setIsMenuOpen(false)
  }

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true)
      const response = await fetch('http://localhost:5001/api/auth/google')
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Google sign-in failed:', error)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleMicrosoftSignIn = async () => {
    try {
      setMicrosoftLoading(true)
      const response = await fetch('http://localhost:5001/api/auth/microsoft')
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Microsoft sign-in failed:', error)
    } finally {
      setMicrosoftLoading(false)
    }
  }

  return (
    <nav className="nature-gradient shadow-lg sticky top-0 z-50 border-b border-green-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-white/90 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <span className="text-2xl">🌿</span>
              </div>
              <span className="text-xl font-bold text-white drop-shadow-lg">Misbar Africa</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {/* Auth Section */}
              <div className="ml-4 flex items-center space-x-2">
                {loading ? (
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                    >
                      <User className="w-4 h-4" />
                      <span>{user.name}</span>
                    </button>
                    
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 overflow-hidden">
                        <Link
                          href="/profile"
                          className="block px-4 py-3 text-sm text-gray-800 hover:bg-emerald-50 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          👤 My Profile
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="block px-4 py-3 text-sm text-gray-800 hover:bg-emerald-50 transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            🛡️ Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {/* Google Sign-In Button */}
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {googleLoading ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                    </button>
                    
                    {/* Microsoft Sign-In Button */}
                    <button
                      onClick={handleMicrosoftSignIn}
                      disabled={microsoftLoading}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {microsoftLoading ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#0078D4" d="M11.4 10.9c-.2-.1-.4-.2-.6-.2-.4 0-.7.2-.9.5-.2.3-.3.7-.3 1.2v.1h2.4v-.1c0-.5-.1-.9-.3-1.2-.2-.3-.5-.5-.9-.5-.2 0-.4.1-.6.2l.6.1z"/>
                          <path fill="#0078D4" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm3.5 16h-7v-1.5h7V18zm0-2.5h-7V14h7v1.5zm0-2.5h-7v-1.5h7V13zm0-2.5h-7v-1.5h7V10.5zm0-2.5h-7V6.5h7V8z"/>
                        </svg>
                      )}
                    </button>
                    
                    {/* Traditional Sign In Link */}
                    <Link
                      href="/auth"
                      className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-emerald-600/25"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-white/90 hover:text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 transition-all duration-200 backdrop-blur-sm"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 nature-gradient/95 backdrop-blur-md border-t border-green-200/50">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 rounded-xl text-base font-medium text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200 flex items-center space-x-3 backdrop-blur-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
            
            {/* Mobile Auth Section */}
            <div className="border-t border-white/10 pt-3 mt-3">
              {loading ? (
                <div className="flex items-center justify-center py-2">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : user ? (
                <>
                  <div className="px-3 py-2 text-white/80 text-sm">
                    👋 Welcome, {user.name}!
                  </div>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-xl text-base font-medium text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200 flex items-center space-x-3 backdrop-blur-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>My Profile</span>
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 rounded-xl text-base font-medium text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200 flex items-center space-x-3 backdrop-blur-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>🛡️</span>
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-base font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-all duration-200 flex items-center space-x-3 backdrop-blur-sm"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Mobile OAuth Buttons */}
                  <div className="px-3 py-2 space-y-2">
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {googleLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Connecting to Google...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Continue with Google
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleMicrosoftSignIn}
                      disabled={microsoftLoading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {microsoftLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Connecting to Microsoft...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#0078D4" d="M11.4 10.9c-.2-.1-.4-.2-.6-.2-.4 0-.7.2-.9.5-.2.3-.3.7-.3 1.2v.1h2.4v-.1c0-.5-.1-.9-.3-1.2-.2-.3-.5-.5-.9-.5-.2 0-.4.1-.6.2l.6.1z"/>
                            <path fill="#0078D4" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm3.5 16h-7v-1.5h7V18zm0-2.5h-7V14h7v1.5zm0-2.5h-7v-1.5h7V13zm0-2.5h-7v-1.5h7V10.5zm0-2.5h-7V6.5h7V8z"/>
                          </svg>
                          Continue with Microsoft
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Traditional Sign In Link */}
                  <Link
                    href="/auth"
                    className="block px-3 py-2 rounded-xl text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In with Email
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}