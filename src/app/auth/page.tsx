'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Building, Phone } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    last_name: '',
    institution: '',
    phone_number: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [microsoftLoading, setMicrosoftLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const { login, register } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle OAuth callbacks
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'google_login') {
      setMessage({ type: 'success', text: 'Successfully signed in with Google!' })
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else if (success === 'microsoft_login') {
      setMessage({ type: 'success', text: 'Successfully signed in with Microsoft!' })
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else if (error === 'google_auth_failed') {
      setMessage({ type: 'error', text: 'Google authentication failed. Please try again.' })
    } else if (error === 'microsoft_auth_failed') {
      setMessage({ type: 'error', text: 'Microsoft authentication failed. Please try again.' })
    }
  }, [searchParams, router])

  // Note: Removed Google One-Tap functionality to avoid FedCM errors
  // Users will use the traditional OAuth redirect flow instead

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      let result
      if (isLogin) {
        result = await login(formData.email, formData.password)
      } else {
        result = await register(formData)
      }

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        setTimeout(() => {
          if (isLogin) {
            router.push('/')
          } else {
            router.push('/')
          }
        }, 1500)
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true)
      const response = await fetch('http://localhost:5001/api/auth/google')
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        setMessage({ type: 'error', text: 'Failed to initiate Google sign-in' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Google sign-in failed' })
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
      } else {
        setMessage({ type: 'error', text: 'Failed to initiate Microsoft sign-in' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Microsoft sign-in failed' })
    } finally {
      setMicrosoftLoading(false)
    }
  }

  // Note: Removed Google One-Tap functionality to avoid FedCM errors
  // Users will use the traditional OAuth redirect flow instead

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-emerald-100/80">
            {isLogin ? 'Sign in to your Misbar Africa account' : 'Join Misbar Africa platform'}
          </p>
        </div>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl text-sm ${
              message.type === 'success' 
                ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30' 
                : 'bg-red-500/20 text-red-100 border border-red-500/30'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Google Sign-In Button */}
        <div className="mb-4">
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
                Connecting...
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
          <p className="text-center text-emerald-100/60 text-xs mt-2">
            Uses secure Google authentication
          </p>
        </div>

        {/* Microsoft Sign-In Button */}
        <div className="mb-6">
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
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#F3F2F1" d="M11.4 10.9c-.2-.1-.4-.2-.6-.2-.4 0-.7.2-.9.5-.2.3-.3.7-.3 1.2v.1h2.4v-.1c0-.5-.1-.9-.3-1.2-.2-.3-.5-.5-.9-.5-.2 0-.4.1-.6.2l.6.1z"/>
                  <path fill="#F3F2F1" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18.5c-4.7 0-8.5-3.8-8.5-8.5S7.3 3.5 12 3.5s8.5 3.8 8.5 8.5-3.8 8.5-8.5 8.5z"/>
                  <path fill="#0078D4" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm3.5 16h-7v-1.5h7V18zm0-2.5h-7V14h7v1.5zm0-2.5h-7v-1.5h7V13zm0-2.5h-7v-1.5h7V10.5zm0-2.5h-7V6.5h7V8z"/>
                </svg>
                Continue with Microsoft
              </>
            )}
          </button>
          <p className="text-center text-emerald-100/60 text-xs mt-2">
            Uses secure Microsoft authentication
          </p>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-emerald-100/60">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-300" />
                <input
                  type="text"
                  name="name"
                  placeholder="First Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-300" />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-300" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-300" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-300 hover:text-emerald-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {!isLogin && (
            <>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-300" />
                <input
                  type="text"
                  name="institution"
                  placeholder="Institution (Optional)"
                  value={formData.institution}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-300" />
                <input
                  type="tel"
                  name="phone_number"
                  placeholder="Phone Number (Optional)"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-emerald-100/80">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setMessage({ type: '', text: '' })
              }}
              className="ml-2 text-emerald-300 hover:text-emerald-200 font-semibold transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-center text-emerald-100/60 text-sm">
            <Link href="/" className="hover:text-emerald-200 transition-colors">
              ← Back to Home
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}