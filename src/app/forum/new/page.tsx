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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to create a forum post.</p>
          <Link href="/auth" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Log In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/forum" 
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Back to Forum
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm"
        >
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category...</option>
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
                  className="p-4 rounded-lg"
                >
                  {(() => {
                    const selectedCategory = categories.find(c => c.id === parseInt(categoryId))
                    if (!selectedCategory) return null
                    const colors = getColorClasses(selectedCategory.color)
                    return (
                      <div className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">{selectedCategory.icon}</span>
                          <h3 className={`font-medium ${colors.text}`}>{selectedCategory.name}</h3>
                        </div>
                        <p className={`text-sm ${colors.text} opacity-90`}>{selectedCategory.description}</p>
                      </div>
                    )
                  })()}
                </motion.div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title for your post..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  maxLength={255}
                  required
                />
                <div className="mt-1 text-right">
                  <span className={`text-sm ${title.length > 200 ? 'text-red-500' : 'text-gray-500'}`}>
                    {title.length}/255
                  </span>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, questions, or insights..."
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
                  required
                />
                <div className="mt-1 text-right">
                  <span className="text-sm text-gray-500">
                    {content.length} characters
                  </span>
                </div>
              </div>

              {/* Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Community Guidelines</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Be respectful and constructive in your discussions</li>
                  <li>• Stay on topic and relevant to the chosen category</li>
                  <li>• Provide context and details to help others understand your question</li>
                  <li>• Search existing posts before creating new ones</li>
                  <li>• No spam, self-promotion, or inappropriate content</li>
                </ul>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <Link
                  href="/forum"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !content.trim() || !categoryId}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {submitting ? 'Creating...' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-8 bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Tips for a Great Post</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <span className="text-green-600 mt-1">✓</span>
                <div>
                  <h4 className="font-medium text-gray-900">Clear Title</h4>
                  <p className="text-sm text-gray-600">Make your title specific and easy to understand</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600 mt-1">✓</span>
                <div>
                  <h4 className="font-medium text-gray-900">Provide Context</h4>
                  <p className="text-sm text-gray-600">Include relevant background information</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <span className="text-green-600 mt-1">✓</span>
                <div>
                  <h4 className="font-medium text-gray-900">Ask Specific Questions</h4>
                  <p className="text-sm text-gray-600">Clear questions get better responses</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600 mt-1">✓</span>
                <div>
                  <h4 className="font-medium text-gray-900">Choose Right Category</h4>
                  <p className="text-sm text-gray-600">Help others find your post easily</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}