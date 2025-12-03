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
            {canEditPost() && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingPost(!editingPost)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {editingPost ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={handleDeletePost}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm mb-8"
        >
          <div className="p-6">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getColorClasses(post.category_color).bg} ${getColorClasses(post.category_color).text}`}>
                  {post.category_name}
                </span>
                <span className="text-sm text-gray-500">
                  Posted on {formatDate(post.created_at)}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>👁️ {post.views} views</span>
                <span>💬 {post.reply_count} replies</span>
              </div>
            </div>

            {/* Post Title and Content */}
            {editingPost ? (
              <form onSubmit={handleEditPost} className="space-y-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPost(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                </div>
              </>
            )}

            {/* Author Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {post.author_name} {post.author_last_name}
                    </span>
                    {post.author_role === 'admin' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Admin
                      </span>
                    )}
                  </div>
                  {post.author_institution && (
                    <p className="text-sm text-gray-600">{post.author_institution}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reply Form */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm mb-8"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Post a Reply</h3>
              <form onSubmit={handleReply} className="space-y-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={submittingReply || !replyContent.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {submittingReply ? 'Posting...' : 'Post Reply'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Replies */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h3>
          
          {replies.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg">
              <p className="text-gray-600">No replies yet. Be the first to respond!</p>
            </div>
          ) : (
            replies.map((reply, index) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                className="bg-white rounded-lg shadow-sm"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {reply.author_name} {reply.author_last_name}
                      </span>
                      {reply.author_role === 'admin' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Admin
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(reply.created_at)}
                    </span>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                  </div>
                  {reply.author_institution && (
                    <p className="text-sm text-gray-600 mt-3">{reply.author_institution}</p>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}