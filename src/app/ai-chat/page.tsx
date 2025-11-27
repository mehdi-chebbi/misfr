'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Send, X, Bot, User, Sparkles, Loader2, Trash2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  image?: string
}

interface UploadedImage {
  id: string
  name: string
  base64: string
  preview: string
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64 = e.target?.result as string
          const newImage: UploadedImage = {
            id: Date.now().toString() + Math.random().toString(),
            name: file.name,
            base64: base64,
            preview: base64
          }
          setUploadedImages(prev => [...prev, newImage])
        }
        reader.readAsDataURL(file)
      }
    })

    // Reset file input
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
    if (isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date(),
      image: uploadedImages.length > 0 ? uploadedImages[0].base64 : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsTyping(true)
    setIsLoading(true)

    try {
      // Prepare message for API
      const messagePayload = {
        message: currentMessage.trim() || 'Please analyze the uploaded image(s)',
        images: uploadedImages.map(img => img.base64.split(',')[1]) // Remove data:image/...;base64, prefix
      }

      // Call streaming chat endpoint
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

      // Add initial assistant message
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }])

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
                // Update the assistant message
                setMessages(prev => {
                  const updated = [...prev]
                  const lastMessage = updated.find(msg => msg.id === assistantMessageId)
                  if (lastMessage) {
                    lastMessage.content = accumulatedResponse
                  }
                  return updated
                })
              } else if (data.type === 'error') {
                accumulatedResponse += `\n\n❌ Error: ${data.message}`
                setMessages(prev => {
                  const updated = [...prev]
                  const lastMessage = updated.find(msg => msg.id === assistantMessageId)
                  if (lastMessage) {
                    lastMessage.content = accumulatedResponse
                  }
                  return updated
                })
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }

      // Clear uploaded images after successful send
      clearAllImages()

    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Failed to connect to AI service. Please make sure Flask API is running on localhost:5000.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">AI Vision Chat</h1>
                <p className="text-sm text-gray-500">Upload images and chat with AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Powered by NVIDIA Vision AI</span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden">
          <div 
            ref={chatContainerRef}
            className="h-full max-w-4xl mx-auto px-4 py-6 overflow-y-auto"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-md"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bot className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    Welcome to AI Vision Chat
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Upload satellite images, aerial photos, or any visual data and get intelligent analysis from our AI assistant.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3 text-left">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <h3 className="font-semibold text-blue-900 mb-2">🛰️ Satellite Analysis</h3>
                      <p className="text-sm text-blue-700">Upload satellite imagery for vegetation health, water detection, and geological analysis</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <h3 className="font-semibold text-green-900 mb-2">🌍 Environmental Monitoring</h3>
                      <p className="text-sm text-green-700">Analyze environmental changes, deforestation, and climate patterns</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <h3 className="font-semibold text-purple-900 mb-2">📊 Data Interpretation</h3>
                      <p className="text-sm text-purple-700">Get insights from spectral indices and remote sensing data</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-6">
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
                      <div className={`flex max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-3`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 ml-3' 
                            : 'bg-gradient-to-br from-purple-500 to-purple-600'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="w-5 h-5 text-white" />
                          ) : (
                            <Bot className="w-5 h-5 text-white" />
                          )}
                        </div>
                        
                        <div className={`rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}>
                          {message.image && (
                            <div className="mb-3">
                              <img 
                                src={message.image} 
                                alt="Uploaded" 
                                className="max-w-full rounded-lg shadow-md"
                                style={{ maxHeight: '300px' }}
                              />
                            </div>
                          )}
                          
                          <div className="whitespace-pre-wrap break-words">
                            {message.content}
                          </div>
                          
                          <div className={`text-xs mt-2 ${
                            message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                          }`}>
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          <span className="text-gray-500">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Image Upload Area */}
        {uploadedImages.length > 0 && (
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Uploaded Images ({uploadedImages.length})</h3>
                <button
                  onClick={clearAllImages}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                      {image.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            {/* Scope Reminder */}
            <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                🛰️ <strong>AI Specialization:</strong> This assistant focuses exclusively on satellite imagery analysis, environmental data interpretation, and remote sensing. Please ask about NDVI, water detection, geological features, or vegetation health analysis.
              </p>
            </div>
            
            <div className="flex items-end space-x-3">
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
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                title="Upload images"
              >
                <Upload className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex-1">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about satellite imagery analysis, NDVI interpretation, water detection, or geological features..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={isLoading || (!currentMessage.trim() && uploadedImages.length === 0)}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-full transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-500">
                {uploadedImages.length > 0 && `${uploadedImages.length} image(s) attached`}
              </div>
              <div className="text-xs text-gray-500">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}