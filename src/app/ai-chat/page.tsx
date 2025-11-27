'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Send, X, Bot, User, Sparkles, Loader2, Trash2, Image, Leaf } from 'lucide-react'
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

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date(),
      image: uploadedImages.length > 0 ? uploadedImages[0].base64 : undefined,
      fullSizeImage: uploadedImages.length > 0 ? uploadedImages[0].fullSizeBase64 : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsLoading(true)
    clearAllImages()

    try {
      const messagePayload = {
        message: currentMessage.trim() || 'Please analyze the uploaded image(s)',
        images: uploadedImages.map(img => img.fullSizeBase64.split(',')[1]),
        context: messages.slice(-6)
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
                  setMessages(prev => [...prev, {
                    id: assistantMessageId,
                    role: 'assistant',
                    content: accumulatedResponse,
                    timestamp: new Date()
                  }])
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
                  setMessages(prev => [...prev, {
                    id: assistantMessageId,
                    role: 'assistant',
                    content: accumulatedResponse,
                    timestamp: new Date()
                  }])
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
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }

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
    <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>
      {/* Chat Area - Fixed height with scroll */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={chatContainerRef}
          className="h-full max-w-5xl mx-auto px-6 py-8 overflow-y-auto custom-scrollbar"
        >
          {messages.length === 0 ? (
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
                            <div className="whitespace-pre-wrap break-words leading-relaxed">
                              {message.content}
                            </div>
                          )}
                        </div>
                        
                        <div className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-emerald-100' : 'text-gray-500'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl px-5 py-4 border border-white/10 shadow-xl">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
<span className="text-gray-300">
  AI is thinking
  <span className="inline-flex ml-1">
    <span className="inline-block w-1 h-1 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
    <span className="inline-block w-1 h-1 bg-gray-300 rounded-full animate-pulse ml-1" style={{ animationDelay: '200ms' }}></span>
    <span className="inline-block w-1 h-1 bg-gray-300 rounded-full animate-pulse ml-1" style={{ animationDelay: '400ms' }}></span>
  </span>
</span>                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Area - Fixed position */}
      <AnimatePresence>
        {uploadedImages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="backdrop-blur-xl bg-black/20 border-t border-white/10 px-6 py-4 flex-shrink-0"
          >
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-emerald-200 flex items-center gap-2">
                  <Image className="w-4 h-4 text-emerald-400" />
                  Attached Images ({uploadedImages.length})
                </h3>
                <button
                  onClick={clearAllImages}
                  className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {uploadedImages.map((image) => (
                  <motion.div 
                    key={image.id} 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative group"
                  >
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-20 h-20 object-cover rounded-xl border-2 border-emerald-500/30 shadow-lg"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area - Fixed at bottom */}
      <div className="backdrop-blur-xl bg-black/20 border-t border-white/10 px-6 py-5 shadow-2xl flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all border border-emerald-500/20 shadow-lg"
              title="Upload images"
            >
              <Upload className="w-5 h-5 text-emerald-300" />
            </motion.button>
            
            <div className="flex-1 relative">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about vegetation health, water detection, land changes..."
                className="w-full px-5 py-3 bg-white/10 backdrop-blur-sm border border-emerald-500/20 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-white placeholder-emerald-200/40 transition-all shadow-lg"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={isLoading || (!currentMessage.trim() && uploadedImages.length === 0)}
              className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all disabled:cursor-not-allowed shadow-xl shadow-emerald-500/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
          
          <div className="flex items-center justify-center mt-3">
            <div className="text-xs text-emerald-200/50">
              Press <kbd className="px-2 py-0.5 bg-white/10 rounded border border-emerald-500/20 text-emerald-200">Enter</kbd> to send • <kbd className="px-2 py-0.5 bg-white/10 rounded border border-emerald-500/20 text-emerald-200">Shift + Enter</kbd> for new line
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(16, 185, 129, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </div>
  )
}