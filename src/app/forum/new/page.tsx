'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

interface Category {
  id: number
  name: string
  description: string
  icon: string
  color: string
}

export default function NewPostPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    fetchCategories()
  }, [user, router])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/forum/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim() || !content.trim() || !categoryId) return

    setSubmitting(true)
    try {
      const response = await fetch('http://localhost:5001/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category_id: parseInt(categoryId)
        })
      })

      const data = await response.json()
      if (data.success) {
        router.push(`/forum/post/${data.post.id}`)
      } else {
        alert(data.message || 'Failed to create post')
      }
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; border: string } } = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' }
    }
    return colorMap[color] || colorMap.green
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-green-50/90 via-emerald-50/95 to-teal-50/90 -z-10"></div>
        <div className="text-center relative z-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Authentication Required</h2>
          <p className="text-xl text-gray-600 mb-8">Please log in to create a forum discussion.</p>
          <Link href="/auth" className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            🚀 Log In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-green-50/90 via-emerald-50/95 to-teal-50/90 -z-10"></div>
        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
          <p className="text-xl text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Nature-themed background matching main app */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-50/90 via-emerald-50/95 to-teal-50/90 -z-10"></div>
      
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`bg-leaf-${i}`}
            className="absolute opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 1.5 + 1}rem`,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 3, -3, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 4,
            }}
          >
            🍃
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-sm shadow-lg border-b border-green-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link 
              href="/forum" 
              className="inline-flex items-center text-green-700 hover:text-green-800 font-semibold text-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Forum
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">✨ Create New Discussion</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-green-200/30">
            <h2 className="text-xl font-bold text-gray-900">
              📝 Start a New Discussion
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Share your questions, insights, or experiences with the community
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Category Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  📁 Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 text-lg"
                  required
                >
                  <option value="">Select a category for your discussion...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Category Info */}
              {categoryId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="p-4 rounded-xl"
                >
                  {(() => {
                    const selectedCategory = categories.find(c => c.id === parseInt(categoryId))
                    if (!selectedCategory) return null
                    const colors = getColorClasses(selectedCategory.color)
                    return (
                      <div className={`${colors.bg} ${colors.border} border rounded-xl p-4`}>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-3xl">{selectedCategory.icon}</span>
                          <h3 className={`font-bold text-lg ${colors.text}`}>{selectedCategory.name}</h3>
                        </div>
                        <p className={`text-sm ${colors.text} opacity-90`}>{selectedCategory.description}</p>
                      </div>
                    )
                  })()}
                </motion.div>
              )}

              {/* Title */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  📰 Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Write a clear and descriptive title for your discussion..."
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 text-lg"
                  maxLength={255}
                  required
                />
                <div className="mt-2 text-right">
                  <span className={`text-sm ${title.length > 200 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                    {title.length}/255 characters
                  </span>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  💬 Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, questions, or insights in detail. Provide context to help others understand your perspective..."
                  rows={12}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 resize-y text-lg"
                  required
                />
                <div className="mt-2 text-right">
                  <span className="text-sm text-gray-500">
                    {content.length} characters
                  </span>
                </div>
              </div>

              {/* Guidelines */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 text-lg mb-4 flex items-center">
                  <span className="text-2xl mr-2">📋</span>
                  Community Guidelines
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">✓</span>
                      Be respectful and constructive in discussions
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">✓</span>
                      Stay on topic relevant to chosen category
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">✓</span>
                      Provide context and helpful details
                    </li>
                  </ul>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">✓</span>
                      Search existing posts before creating new ones
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">✓</span>
                      No spam or inappropriate content
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">✓</span>
                      Credit sources when sharing information
                    </li>
                  </ul>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <Link
                  href="/forum"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </Link>
                
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    All fields marked with <span className="text-red-500">*</span> are required
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !title.trim() || !content.trim() || !categoryId}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Creating...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        🚀 Publish Discussion
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50 p-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-3">💡</span>
            Tips for a Great Discussion
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-green-600 text-xl mt-1">✓</span>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Clear Title</h4>
                  <p className="text-gray-600">Make your title specific and easy to understand</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-600 text-xl mt-1">✓</span>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Provide Context</h4>
                  <p className="text-gray-600">Include relevant background information</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-green-600 text-xl mt-1">✓</span>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Ask Specific Questions</h4>
                  <p className="text-gray-600">Clear questions get better responses</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-600 text-xl mt-1">✓</span>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Choose Right Category</h4>
                  <p className="text-gray-600">Help others find your post easily</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}