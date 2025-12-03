'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

interface Reply {
  id: number
  content: string
  author_name: string
  author_last_name: string
  author_institution: string
  author_role: string
  created_at: string
  updated_at: string
}

interface Post {
  id: number
  title: string
  content: string
  author_name: string
  author_last_name: string
  author_institution: string
  author_role: string
  category_name: string
  category_color: string
  views: number
  reply_count: number
  created_at: string
  last_reply_at: string | null
}

export default function ForumPostPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const [editingPost, setEditingPost] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/forum/posts/${postId}`)
      const data = await response.json()
      
      if (data.success) {
        setPost(data.post)
        setReplies(data.replies)
        setEditTitle(data.post.title)
        setEditContent(data.post.content)
      } else {
        router.push('/forum')
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
      router.push('/forum')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !replyContent.trim()) return

    setSubmittingReply(true)
    try {
      const response = await fetch(`http://localhost:5001/api/forum/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        credentials: 'include',
        body: JSON.stringify({ content: replyContent })
      })

      const data = await response.json()
      if (data.success) {
        setReplyContent('')
        fetchPost() // Refresh post to show new reply
      } else {
        alert(data.message || 'Failed to post reply')
      }
    } catch (error) {
      console.error('Failed to post reply:', error)
      alert('Failed to post reply')
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleEditPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editTitle.trim() || !editContent.trim()) return

    try {
      const response = await fetch(`http://localhost:5001/api/forum/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        credentials: 'include',
        body: JSON.stringify({ 
          title: editTitle, 
          content: editContent 
        })
      })

      const data = await response.json()
      if (data.success) {
        setEditingPost(false)
        fetchPost() // Refresh post data
      } else {
        alert(data.message || 'Failed to update post')
      }
    } catch (error) {
      console.error('Failed to update post:', error)
      alert('Failed to update post')
    }
  }

  const handleDeletePost = async () => {
    if (!user || !post) return

    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5001/api/forum/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          },
          credentials: 'include'
        })

        const data = await response.json()
        if (data.success) {
          router.push('/forum')
        } else {
          alert(data.message || 'Failed to delete post')
        }
      } catch (error) {
        console.error('Failed to delete post:', error)
        alert('Failed to delete post')
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canEditPost = () => {
    if (!user || !post) return false
    return user.id === post.author_id || user.role === 'admin'
  }

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string } } = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-800' },
      green: { bg: 'bg-green-100', text: 'text-green-800' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-800' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-800' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-800' }
    }
    return colorMap[color] || colorMap.green
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
          <Link href="/forum" className="text-green-600 hover:text-green-700">
            ← Back to Forum
          </Link>
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
            {canEditPost() && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditingPost(!editingPost)}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  {editingPost ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={handleDeletePost}
                  className="text-red-600 hover:text-red-700 font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Post */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50 mb-8 overflow-hidden"
        >
          {/* Post Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-green-200/30">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${getColorClasses(post.category_color).bg} ${getColorClasses(post.category_color).text} shadow-md`}>
                  {post.category_icon} {post.category_name}
                </span>
                <span className="text-gray-600 font-medium">
                  {formatDate(post.created_at)}
                </span>
              </div>
              
              {/* Author Info - Moved to top right */}
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-gray-900 text-lg">
                    {post.author_name} {post.author_last_name}
                  </span>
                  {post.author_role === 'admin' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 shadow-sm">
                      Admin
                    </span>
                  )}
                </div>
                {post.author_institution && (
                  <div className="text-sm text-gray-600">{post.author_institution}</div>
                )}
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-8">
            {editingPost ? (
              <form onSubmit={handleEditPost} className="space-y-6">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold"
                  required
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
                  required
                />
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPost(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                  {post.title}
                </h1>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Post Footer with Stats */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-gray-600">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <span className="text-lg">👁️</span>
                  <span className="font-semibold text-gray-700">
                    {post.views} views
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                  <span className="text-lg">💬</span>
                  <span className="font-semibold text-green-700">
                    {post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}
                  </span>
                </div>
              </div>
              {post.last_reply_at && (
                <div className="text-sm text-gray-500">
                  Last reply: {formatDate(post.last_reply_at)}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Replies Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              💬 {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
            </h2>
            {user && (
              <button
                onClick={() => {
                  const replyForm = document.getElementById('reply-form');
                  replyForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="text-green-600 hover:text-green-700 font-semibold transition-colors"
              >
                ↓ Add Reply
              </button>
            )}
          </div>
          
          {replies.length === 0 ? (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50">
              <div className="text-6xl mb-4">💭</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No replies yet</h3>
              <p className="text-lg text-gray-600">
                Be the first to share your thoughts on this discussion!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {replies.map((reply, index) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900 text-lg">
                              {reply.author_name} {reply.author_last_name}
                            </span>
                            {reply.author_role === 'admin' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 shadow-sm">
                                Admin
                              </span>
                            )}
                          </div>
                          {reply.author_institution && (
                            <div className="text-sm text-gray-600">{reply.author_institution}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {formatDate(reply.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Form - Moved to bottom after all replies */}
        {user && (
          <motion.div
            id="reply-form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200/50">
                <h3 className="text-xl font-bold text-gray-900">
                  ✍️ Share Your Thoughts
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Join the conversation and contribute to this discussion
                </p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleReply} className="space-y-6">
                  <div>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Share your insights, ask questions, or provide helpful information..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y text-lg"
                      required
                    />
                    <div className="mt-2 text-right">
                      <span className="text-sm text-gray-500">
                        {replyContent.length} characters
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      💡 Be respectful and constructive in your response
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReply || !replyContent.trim()}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                    >
                      {submittingReply ? 'Posting...' : 'Post Reply'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}

        {/* Login Prompt for non-users */}
        {!user && (
          <div className="mt-8 text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50 p-8">
            <div className="text-5xl mb-4">🔐</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Join the Conversation</h3>
            <p className="text-lg text-gray-600 mb-6">
              Log in to share your thoughts and engage with the community
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              🚀 Log In to Reply
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}