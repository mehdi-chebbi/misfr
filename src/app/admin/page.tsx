'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { Users, LogIn, Edit, Trash2, Save, X, Shield, Calendar } from 'lucide-react'

interface User {
  id: number
  name: string
  last_name: string
  email: string
  institution?: string
  phone_number?: string
  role: 'admin' | 'user'
  created_at: string
}

interface LoginLog {
  login_time: string
  name: string
  last_name: string
  email: string
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [logs, setLogs] = useState<LoginLog[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    } else {
      fetchLogs()
    }
  }, [activeTab])

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/users', {
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch users' })
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/login-logs', {
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        setLogs(data.logs)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch login logs' })
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user })
  }

  const handleSaveUser = async () => {
    if (!editingUser) return

    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editingUser)
      })

      const data = await response.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'User updated successfully' })
        setEditingUser(null)
        fetchUsers()
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user' })
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'User deleted successfully' })
        fetchUsers()
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete user' })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 flex items-center justify-center">
        <div className="text-center text-white">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-emerald-100/80">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-emerald-100/80">Manage users and monitor platform activity</p>
        </div>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl ${
              message.type === 'success' 
                ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30' 
                : 'bg-red-500/20 text-red-100 border border-red-500/30'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center px-6 py-4 font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'text-emerald-300 border-b-2 border-emerald-400 bg-white/5'
                  : 'text-emerald-100/60 hover:text-emerald-100'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              Users Management
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center px-6 py-4 font-semibold transition-colors ${
                activeTab === 'logs'
                  ? 'text-emerald-300 border-b-2 border-emerald-400 bg-white/5'
                  : 'text-emerald-100/60 hover:text-emerald-100'
              }`}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Login Logs
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'users' ? (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-emerald-100/60">Loading users...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-white/10">
                          <th className="pb-3 text-emerald-100 font-semibold">Name</th>
                          <th className="pb-3 text-emerald-100 font-semibold">Email</th>
                          <th className="pb-3 text-emerald-100 font-semibold">Institution</th>
                          <th className="pb-3 text-emerald-100 font-semibold">Phone</th>
                          <th className="pb-3 text-emerald-100 font-semibold">Role</th>
                          <th className="pb-3 text-emerald-100 font-semibold">Joined</th>
                          <th className="pb-3 text-emerald-100 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((userItem) => (
                          <tr key={userItem.id} className="border-b border-white/5">
                            {editingUser?.id === userItem.id ? (
                              <>
                                <td className="py-3">
                                  <input
                                    type="text"
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full"
                                  />
                                </td>
                                <td className="py-3">
                                  <input
                                    type="email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full"
                                  />
                                </td>
                                <td className="py-3">
                                  <input
                                    type="text"
                                    value={editingUser.institution || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, institution: e.target.value })}
                                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full"
                                  />
                                </td>
                                <td className="py-3">
                                  <input
                                    type="text"
                                    value={editingUser.phone_number || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, phone_number: e.target.value })}
                                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full"
                                  />
                                </td>
                                <td className="py-3">
                                  <select
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'admin' | 'user' })}
                                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                                  >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                </td>
                                <td className="py-3 text-emerald-100/60">
                                  {formatDate(editingUser.created_at)}
                                </td>
                                <td className="py-3">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={handleSaveUser}
                                      className="text-emerald-400 hover:text-emerald-300"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setEditingUser(null)}
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-3 text-white">
                                  {userItem.name} {userItem.last_name}
                                </td>
                                <td className="py-3 text-emerald-100/80">{userItem.email}</td>
                                <td className="py-3 text-emerald-100/80">{userItem.institution || '-'}</td>
                                <td className="py-3 text-emerald-100/80">{userItem.phone_number || '-'}</td>
                                <td className="py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    userItem.role === 'admin' 
                                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  }`}>
                                    {userItem.role}
                                  </span>
                                </td>
                                <td className="py-3 text-emerald-100/60">
                                  {formatDate(userItem.created_at)}
                                </td>
                                <td className="py-3">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEditUser(userItem)}
                                      className="text-emerald-400 hover:text-emerald-300"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    {userItem.id !== user.id && (
                                      <button
                                        onClick={() => handleDeleteUser(userItem.id)}
                                        className="text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-emerald-100/60">Loading login logs...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-white/10">
                          <th className="pb-3 text-emerald-100 font-semibold">User</th>
                          <th className="pb-3 text-emerald-100 font-semibold">Email</th>
                          <th className="pb-3 text-emerald-100 font-semibold">Login Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log, index) => (
                          <tr key={index} className="border-b border-white/5">
                            <td className="py-3 text-white">
                              {log.name} {log.last_name}
                            </td>
                            <td className="py-3 text-emerald-100/80">{log.email}</td>
                            <td className="py-3 text-emerald-100/60">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {formatDate(log.login_time)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}