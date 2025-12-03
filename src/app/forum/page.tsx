'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

interface Category {
  id: number
  name: string
  description: string
  icon: string
  color: string
  post_count: number
}

interface Post {
  id: number
  title: string
  content: string
  author_name: string
  author_last_name: string
  author_institution: string
  category_name: string
  category_color: string
  category_icon: string
  views: number
  reply_count: number
  created_at: string
  last_reply_at: string | null
}

export default function ForumPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState<'categories' | 'posts'>('categories')

  useEffect(() => {
    fetchCategories()
    fetchPosts()
  }, [selectedCategory, searchTerm, currentPage])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/forum/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (selectedCategory) {
        params.append('category_id', selectedCategory.toString())
      }
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`http://localhost:5001/api/forum/posts?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setPosts(data.posts)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
              <p className="text-gray-600 mt-1">Connect with environmental experts across Africa</p>
            </div>
            {user && (
              <Link
                href="/forum/new"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Post
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-white text-green-700 border-t-2 border-x-2 border-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
              activeTab === 'posts'
                ? 'bg-white text-green-700 border-t-2 border-x-2 border-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Posts
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="sm:w-64">
              <select
                value={selectedCategory || ''}
                onChange={(e) => {
                  setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedCategory(category.id)
                  setActiveTab('posts')
                }}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{category.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getColorClasses(category.color).bg} ${getColorClasses(category.color).text}`}>
                        {category.post_count} posts
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{category.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600 mb-4">
                  {selectedCategory || searchTerm 
                    ? 'Try adjusting your filters or search terms' 
                    : 'Be the first to start a conversation!'}
                </p>
                {user && !selectedCategory && !searchTerm && (
                  <Link
                    href="/forum/new"
                    className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Create First Post
                  </Link>
                )}
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Link href={`/forum/post/${post.id}`} className="block p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(post.category_color).bg} ${getColorClasses(post.category_color).text} mr-3`}>
                              {post.category_icon} {post.category_name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(post.created_at)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-green-700 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            {truncateContent(post.content)}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="font-medium">
                              {post.author_name} {post.author_last_name}
                            </span>
                            {post.author_institution && (
                              <span className="ml-2">• {post.author_institution}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end ml-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              👁️ {post.views}
                            </span>
                            <span className="flex items-center">
                              💬 {post.reply_count}
                            </span>
                          </div>
                          {post.last_reply_at && (
                            <span className="mt-2">
                              Last reply: {formatDate(post.last_reply_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      {currentPage > 1 && (
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Previous
                        </button>
                      )}
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-green-600 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      {currentPage < totalPages && (
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}