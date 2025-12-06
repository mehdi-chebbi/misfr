'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Send, X, Bot, User, Sparkles, Loader2, Trash2, Image, Leaf, MessageSquare, Plus, Edit3, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  image?: string
  fullSizeImage?: string
}

interface UploadedImage {
  id: string
  name: string
  base64: string
  preview: string
  fullSizeBase64: string
}

interface ChatSession {
  id: number
  title: string
  created_at: string
  updated_at: string
}

export default function AIChatPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [editingSession, setEditingSession] = useState<number | null>(null)
  const [sessionTitle, setSessionTitle] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (user) {
      fetchSessions()
    }
  }, [user])

  const fetchSessions = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/chat/sessions', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Server unavailable')
      }
      
      const data = await response.json()
      console.log('Sessions response:', data)
      if (data.success) {
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    }
  }

  const createNewSession = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: 'New Chat' })
      })
      
      if (!response.ok) {
        throw new Error('Server unavailable')
      }
      
      const data = await response.json()
      if (data.success) {
        setSessions(prev => [data.session, ...prev])
        setCurrentSession(data.session)
        setMessages([])
      }
    } catch (error) {
      console.error('Failed to create session:', error)
      alert('Failed to create new chat session. Please ensure the authentication server is running on port 5001.')
    }
  }

  const loadSession = async (session: ChatSession) => {
    console.log('Loading session:', session)
    setIsLoadingSession(true)
    try {
      const response = await fetch(`http://localhost:5001/api/chat/sessions/${session.id}/messages`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Server unavailable')
      }
      
      const data = await response.json()
      console.log('Session messages response:', data)
      
      if (data.success && data.messages) {
        setCurrentSession(session)
        const mappedMessages = data.messages.map((msg: any, index: number) => ({
          id: msg.id ? msg.id.toString() : `temp-${index}`,
          role: msg.role || 'assistant',
          content: msg.content || '',
          timestamp: msg.created_at ? new Date(msg.created_at) : new Date(),
          image: msg.image_data || undefined,
          fullSizeImage: msg.image_data || undefined
        }))
        console.log('Mapped messages:', mappedMessages)
        setMessages(mappedMessages)
      } else {
        console.warn('No messages found or invalid response:', data)
        setMessages([])
        setCurrentSession(session)
      }
    } catch (error) {
      console.error('Failed to load session:', error)
      setMessages([])
      setCurrentSession(session)
    } finally {
      setIsLoadingSession(false)
    }
  }

  const deleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this chat?')) return

    try {
      const response = await fetch(`http://localhost:5001/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Server unavailable')
      }
      
      const data = await response.json()
      if (data.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId))
        if (currentSession?.id === sessionId) {
          setCurrentSession(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
      alert('Failed to delete chat session. Please ensure the authentication server is running on port 5001.')
    }
  }

  const updateSessionTitle = async (sessionId: number, newTitle: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/chat/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newTitle })
      })
      
      if (!response.ok) {
        throw new Error('Server unavailable')
      }
      
      const data = await response.json()
      if (data.success) {
        setSessions(prev => prev.map(s => 
          s.id === sessionId ? data.session : s
        ))
        if (currentSession?.id === sessionId) {
          setCurrentSession(data.session)
        }
      }
    } catch (error) {
      console.error('Failed to update session title:', error)
      alert('Failed to update chat title. Please ensure the authentication server is running on port 5001.')
    }
    setEditingSession(null)
    setSessionTitle('')
  }

  const saveMessage = async (message: Message) => {
    if (!currentSession) return

    try {
      const response = await fetch(`http://localhost:5001/api/chat/sessions/${currentSession.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          role: message.role,
          content: message.content,
          image_data: message.fullSizeImage || null
        })
      })
      
      if (!response.ok) {
        throw new Error('Server unavailable')
      }
    } catch (error) {
      console.error('Failed to save message:', error)
      // Silently fail for message saving to avoid disrupting user experience
    }
  }

  const createThumbnail = (base64: string, maxSize: number = 100): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        let { width, height } = img
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = base64
    })
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64 = e.target?.result as string
          const thumbnail = await createThumbnail(base64, 100)
          
          const newImage: UploadedImage = {
            id: Date.now().toString() + Math.random().toString(),
            name: file.name,
            base64: thumbnail,
            preview: thumbnail,
            fullSizeBase64: base64
          }
          setUploadedImages(prev => [...prev, newImage])
        }
        reader.readAsDataURL(file)
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId))
  }

  const clearAllImages = () => {
    setUploadedImages([])
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() && uploadedImages.length === 0) return

    if (!currentSession) {
      await createNewSession()
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date(),
      image: uploadedImages.length > 0 ? uploadedImages[0].base64 : undefined,
      fullSizeImage: uploadedImages.length > 0 ? uploadedImages[0].fullSizeBase64 : undefined
    }

    setMessages(prev => [...prev, userMessage])
    saveMessage(userMessage)
    setCurrentMessage('')
    setIsLoading(true)
    clearAllImages()

    try {
      const messagePayload = {
        message: currentMessage.trim() || 'Please analyze the uploaded image(s)',
        images: uploadedImages.map(img => img.fullSizeBase64.split(',')[1]),
        context: messages.slice(-10)
      }

      const response = await fetch('http://localhost:5000/api/vision/chat_stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Response body is not readable')
      }

      let accumulatedResponse = ''
      const assistantMessageId = (Date.now() + 1).toString()
      let messageAdded = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'chunk') {
                accumulatedResponse += data.content
                
                if (!messageAdded && accumulatedResponse.trim()) {
                  setIsLoading(false)
                  const assistantMessage: Message = {
                    id: assistantMessageId,
                    role: 'assistant',
                    content: accumulatedResponse,
                    timestamp: new Date()
                  }
                  setMessages(prev => [...prev, assistantMessage])
                  saveMessage(assistantMessage)
                  messageAdded = true
                } else if (messageAdded) {
                  setMessages(prev => {
                    const updated = [...prev]
                    const lastMessage = updated.find(msg => msg.id === assistantMessageId)
                    if (lastMessage) {
                      lastMessage.content = accumulatedResponse
                    }
                    return updated
                  })
                }
              } else if (data.type === 'error') {
                accumulatedResponse += `\n\n❌ Error: ${data.message}`
                if (!messageAdded && accumulatedResponse.trim()) {
                  setIsLoading(false)
                  const assistantMessage: Message = {
                    id: assistantMessageId,
                    role: 'assistant',
                    content: accumulatedResponse,
                    timestamp: new Date()
                  }
                  setMessages(prev => [...prev, assistantMessage])
                  saveMessage(assistantMessage)
                  messageAdded = true
                }
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Failed to connect to AI service. Please make sure Flask API is running on localhost:5000.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      saveMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 flex items-center justify-center">
        <div className="text-center text-white">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-emerald-100/80 mb-4">Please log in to access the AI chat feature.</p>
          <a 
            href="/auth" 
            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 flex h-screen overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Chat History
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white/60 hover:text-white p-1"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoadingSession ? (
            <div className="text-center text-white/60 py-8">
              <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
              <p>Loading messages...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-white/60 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No chat history yet</p>
              <p className="text-sm">Start a new conversation to begin</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => loadSession(session)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  currentSession?.id === session.id
                    ? 'bg-emerald-600/30 border border-emerald-500/50'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingSession === session.id ? (
                      <input
                        type="text"
                        value={sessionTitle}
                        onChange={(e) => setSessionTitle(e.target.value)}
                        onBlur={() => updateSessionTitle(session.id, sessionTitle)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateSessionTitle(session.id, sessionTitle)
                          } else if (e.key === 'Escape') {
                            setEditingSession(null)
                            setSessionTitle('')
                          }
                        }}
                        className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                        autoFocus
                      />
                    ) : (
                      <h3 
                        className="text-white font-medium text-sm truncate"
                        onDoubleClick={() => {
                          setEditingSession(session.id)
                          setSessionTitle(session.title)
                        }}
                      >
                        {session.title}
                      </h3>
                    )}
                    <p className="text-white/60 text-xs mt-1">
                      {formatDate(session.updated_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteSession(session.id, e)}
                    className="text-white/40 hover:text-red-400 p-1 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-black/10 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-white/60 hover:text-white p-2 mr-3"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-xl font-semibold text-white">
                {currentSession ? currentSession.title : 'Environmental Vision AI'}
              </h1>
            </div>
            <div className="text-white/60 text-sm">
              {user.name} {user.last_name}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <div 
            ref={chatContainerRef}
            className="h-full max-w-5xl mx-auto px-6 py-8 overflow-y-auto custom-scrollbar"
          >
            {messages.length === 0 && !currentSession ? (
              <div className="flex flex-col items-center justify-center h-full">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-2xl text-center"
                >
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-3xl opacity-30"></div>
                    <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl">
                      <Leaf className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent mb-4">
                    Environmental Vision AI
                  </h2>
                  <p className="text-emerald-100/80 text-lg mb-12">
                    Analyze satellite imagery, monitor ecosystems, and track environmental changes with AI-powered insights.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-sm rounded-2xl border border-emerald-500/20 shadow-xl"
                    >
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                        <Leaf className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="font-semibold text-emerald-100 mb-2">Vegetation Health</h3>
                      <p className="text-sm text-emerald-200/70">Monitor NDVI, forest cover, and crop health patterns</p>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="p-6 bg-gradient-to-br from-teal-500/10 to-teal-600/5 backdrop-blur-sm rounded-2xl border border-teal-500/20 shadow-xl"
                    >
                      <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                        <Sparkles className="w-6 h-6 text-teal-400" />
                      </div>
                      <h3 className="font-semibold text-teal-100 mb-2">Water Detection</h3>
                      <p className="text-sm text-teal-200/70">Identify water bodies, flooding, and moisture levels</p>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm rounded-2xl border border-green-500/20 shadow-xl"
                    >
                      <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                        <Bot className="w-6 h-6 text-green-400" />
                      </div>
                      <h3 className="font-semibold text-green-100 mb-2">Land Analysis</h3>
                      <p className="text-sm text-green-200/70">Detect deforestation, urban sprawl, and land use changes</p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-4xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/50' 
                            : 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="w-5 h-5 text-white" />
                          ) : (
                            <Bot className="w-5 h-5 text-white" />
                          )}
                        </div>
                        
                        <div className={`rounded-2xl px-5 py-4 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20'
                            : 'bg-white/5 backdrop-blur-xl text-gray-100 border border-white/10 shadow-xl'
                        }`}>
                          {message.image && (
                            <div className="mb-3">
                              <img 
                                src={message.image} 
                                alt="Uploaded" 
                                className="w-32 h-32 object-cover rounded-xl shadow-lg border-2 border-white/20"
                              />
                            </div>
                          )}
                          
                          <div className="prose prose-invert prose-sm max-w-none">
                            {message.role === 'assistant' ? (
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  h1: ({children}) => <h1 className="text-lg font-bold text-emerald-100 mb-3">{children}</h1>,
                                  h2: ({children}) => <h2 className="text-base font-semibold text-emerald-100 mb-2">{children}</h2>,
                                  h3: ({children}) => <h3 className="text-sm font-semibold text-emerald-200 mb-2">{children}</h3>,
                                  p: ({children}) => <p className="text-gray-200 mb-3 leading-relaxed">{children}</p>,
                                  strong: ({children}) => <strong className="font-semibold text-emerald-100">{children}</strong>,
                                  em: ({children}) => <em className="italic text-gray-300">{children}</em>,
                                  ul: ({children}) => <ul className="list-disc list-inside mb-3 text-gray-200 space-y-1">{children}</ul>,
                                  ol: ({children}) => <ol className="list-decimal list-inside mb-3 text-gray-200 space-y-1">{children}</ol>,
                                  li: ({children}) => <li className="mb-1">{children}</li>,
                                  code: ({inline, children}) => 
                                    inline ? 
                                      <code className="bg-black/30 px-2 py-0.5 rounded text-sm font-mono text-emerald-300">{children}</code> :
                                      <code className="block bg-black/30 p-3 rounded-lg text-sm font-mono text-gray-200 overflow-x-auto">{children}</code>,
                                  pre: ({children}) => <pre className="bg-black/30 p-4 rounded-xl overflow-x-auto mb-3 border border-white/10">{children}</pre>,
                                  blockquote: ({children}) => <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-gray-300 mb-3">{children}</blockquote>,
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            ) : (
                              <p className="text-white leading-relaxed">{message.content}</p>
                            )}
                          </div>
                          
                          <div className="text-xs opacity-70 mt-2">
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-black/10 backdrop-blur-sm border-t border-white/10 p-4">
          <div className="max-w-5xl mx-auto">
            {/* Image Upload Area */}
            {uploadedImages.length > 0 && (
              <div className="mb-4 flex items-center gap-2">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative">
                    <img 
                      src={image.preview} 
                      alt={image.name}
                      className="w-16 h-16 object-cover rounded-lg border-2 border-white/20"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={clearAllImages}
                  className="text-white/60 hover:text-white text-sm"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Message Input */}
            <div className="flex items-end gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <Upload className="w-5 h-5" />
              </button>
              
              <div className="flex-1 relative">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={currentSession ? "Ask about environmental analysis..." : "Start a new conversation..."}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={isLoading || (!currentMessage.trim() && uploadedImages.length === 0)}
                className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}