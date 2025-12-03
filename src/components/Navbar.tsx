'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { User, LogOut, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const { user, logout, loading } = useAuth()

  const navItems = [
    { name: 'Home', href: '/', icon: '🏡' },
    { name: 'Geoportal', href: '/map', icon: '🗺️' },
    { name: 'Forum', href: '/forum', icon: '💬' },
    { name: 'AI Chat', href: '/ai-chat', icon: '🤖' },
    { name: 'Journey', href: '/journey', icon: '🌍' },
    { name: 'About', href: '/#features', icon: '🌳' }
  ]

  const handleLogout = async () => {
    await logout()
    setIsProfileMenuOpen(false)
    setIsMenuOpen(false)
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
                  <Link
                    href="/auth"
                    className="block px-3 py-2 rounded-xl text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 text-center backdrop-blur-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
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