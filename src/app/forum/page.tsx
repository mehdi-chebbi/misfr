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
    <div className="min-h-screen">
      {/* Nature-themed background matching main app */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-50/90 via-emerald-50/95 to-teal-50/90 -z-10"></div>
      
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`bg-leaf-${i}`}
            className="absolute opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 1.5 + 1}rem`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          >
            🍃
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-sm shadow-lg border-b border-green-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-black bg-gradient-to-r from-green-700 via-emerald-600 to-teal-700 bg-clip-text text-transparent mb-3"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              Community Forum
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 font-medium"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Connect with environmental experts across Africa 🌍
            </motion.p>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-200/50 p-1">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'categories'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
              }`}
            >
              📁 Categories
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'posts'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
              }`}
            >
              💬 All Posts
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder="Search discussions, topics, and questions..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 text-lg"
                />
              </div>
            </div>
            <div className="lg:w-80">
              <select
                value={selectedCategory || ''}
                onChange={(e) => {
                  setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 text-lg"
              >
                <option value="">🌍 All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Create Post Button - Now right under search bar */}
          {user && (
            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link
                href="/forum/new"
                className="inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                ✨ Create New Post
              </Link>
            </motion.div>
          )}
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => {
                  setSelectedCategory(category.id)
                  setActiveTab('posts')
                }}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-white/90">
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getColorClasses(category.color).bg} ${getColorClasses(category.color).text} shadow-md`}>
                      {category.post_count} posts
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{category.description}</p>
                  
                  {/* Hover indicator */}
                  <div className="mt-4 flex items-center text-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Explore discussions</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
                <p className="text-xl text-gray-600 font-medium">Loading discussions...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50">
                <div className="text-6xl mb-6">💬</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No discussions found</h3>
                <p className="text-lg text-gray-600 mb-8">
                  {selectedCategory || searchTerm 
                    ? 'Try adjusting your filters or search terms' 
                    : 'Be the first to start a conversation!'}
                </p>
                {user && !selectedCategory && !searchTerm && (
                  <Link
                    href="/forum/new"
                    className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    ✨ Start First Discussion
                  </Link>
                )}
              </div>
            ) : (
              <>
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <Link href={`/forum/post/${post.id}`} className="block">
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:bg-white/90">
                        {/* Post Header with Category and Author */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold ${getColorClasses(post.category_color).bg} ${getColorClasses(post.category_color).text} shadow-md`}>
                              {post.category_icon} {post.category_name}
                            </span>
                            <span className="text-sm text-gray-500 font-medium">
                              {formatDate(post.created_at)}
                            </span>
                          </div>
                          
                          {/* Author Info - Moved to top right */}
                          <div className="text-right">
                            <div className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                              {post.author_name} {post.author_last_name}
                            </div>
                            {post.author_institution && (
                              <div className="text-sm text-gray-600">{post.author_institution}</div>
                            )}
                          </div>
                        </div>

                        {/* Post Title */}
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-700 transition-colors leading-tight">
                          {post.title}
                        </h3>

                        {/* Post Content Preview */}
                        <p className="text-gray-700 text-lg leading-relaxed mb-6 line-clamp-3">
                          {truncateContent(post.content, 200)}
                        </p>

                        {/* Bottom Section - Views and Reply Counts */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6 text-gray-600">
                            {/* Views - Made more visible */}
                            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                              <span className="text-lg">👁️</span>
                              <span className="font-semibold text-gray-700">
                                {post.views} views
                              </span>
                            </div>
                            
                            {/* Replies - Made more visible */}
                            <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                              <span className="text-lg">💬</span>
                              <span className="font-semibold text-green-700">
                                {post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}
                              </span>
                            </div>
                          </div>

                          {/* Last Reply Info */}
                          {post.last_reply_at && (
                            <div className="text-sm text-gray-500">
                              Last reply: {formatDate(post.last_reply_at)}
                            </div>
                          )}
                        </div>

                        {/* Hover Indicator */}
                        <div className="mt-4 flex items-center text-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span>Read full discussion</span>
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-200/50 p-2">
                      {currentPage > 1 && (
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="px-4 py-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg font-semibold transition-all duration-300"
                        >
                          ← Previous
                        </button>
                      )}
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 mx-1 rounded-lg font-semibold transition-all duration-300 ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                              : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      {currentPage < totalPages && (
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="px-4 py-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg font-semibold transition-all duration-300"
                        >
                          Next →
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