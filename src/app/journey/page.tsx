'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function JourneyPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentTheme, setCurrentTheme] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const themes = [
    {
      emoji: '🌿',
      title: 'NATURE',
      subtitle: 'Vegetation Health & Forest Ecosystems',
      videoSrc: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Black_bear_-_trail_camera.webm',
      speed: 1,
      bgColor: 'from-green-900/90 to-emerald-900/90',
      textColor: 'from-green-400 to-emerald-300',
      optionBg: '#fff5a0'
    },
    {
      emoji: '🌊',
      title: 'OCEAN',
      subtitle: 'Water Bodies & Marine Environments',
      videoSrc: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Aerial_view_of_a_humpback_whale_near_Gordon%27s_Bay%2C_Sydney%2C_Australia_at_24_August_2020.webm',
      speed: 1,
      bgColor: 'from-blue-900/90 to-cyan-900/90',
      textColor: 'from-blue-400 to-cyan-300',
      optionBg: '#ffc8a2'
    },
    {
      emoji: '⛰️',
      title: 'EARTH',
      subtitle: 'Geological Features & Land Formation',
      videoSrc: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Mt_Hood_Aerial_View.webm',
      speed: 0.6,
      bgColor: 'from-amber-900/90 to-orange-900/90',
      textColor: 'from-amber-400 to-orange-300',
      optionBg: '#ffb3b3'
    },
    {
      emoji: '🦅',
      title: 'SKY',
      subtitle: 'Atmospheric Conditions & Climate Patterns',
      videoSrc: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Bald_Eagles_%2818731656064%29.webm',
      speed: 1,
      bgColor: 'from-purple-900/90 to-indigo-900/90',
      textColor: 'from-purple-400 to-indigo-300',
      optionBg: '#bf000f'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentTheme((prev) => (prev + 1) % themes.length)
        setIsTransitioning(false)
      }, 800)
    }, 8000) // Change theme every 8 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      const currentThemeData = themes[currentTheme]
      videoRef.current.src = currentThemeData.videoSrc
      videoRef.current.playbackRate = currentThemeData.speed
      videoRef.current.muted = true
      videoRef.current.play().catch(() => {})
      
      const handleLoadedMetadata = () => {
        videoRef.current!.playbackRate = currentThemeData.speed
        videoRef.current!.play().catch(() => {})
      }
      
      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)
      
      return () => {
        videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
    }
  }, [currentTheme])

  const currentThemeData = themes[currentTheme]

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Animated Overlay */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${currentThemeData.bgColor} z-10`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isTransitioning ? 0.3 : 0.7 }}
        transition={{ duration: 1.5 }}
      />

      {/* Floating Emoji Indicator */}
      <motion.div
        className="absolute top-8 left-8 text-6xl z-20"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: isTransitioning ? 0 : 1,
          rotate: isTransitioning ? 180 : 0
        }}
        transition={{ 
          duration: 0.8,
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
      >
        {currentThemeData.emoji}
      </motion.div>

      {/* Theme Selector (Hidden but functional) */}
      <select
        className="absolute top-8 right-8 opacity-0 w-0 h-0 z-20"
        value={currentTheme}
        onChange={(e) => setCurrentTheme(Number(e.target.value))}
      >
        {themes.map((theme, index) => (
          <option 
            key={index} 
            value={index}
            data-src={theme.videoSrc}
            data-speed={theme.speed}
            style={{ backgroundColor: theme.optionBg }}
          >
            {theme.emoji}
          </option>
        ))}
      </select>

      {/* Main Title */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-30"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: isTransitioning ? 1.2 : 1,
          opacity: isTransitioning ? 0 : 1
        }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center">
          <motion.h1
            className={`text-6xl md:text-8xl lg:text-9xl font-black mb-4 bg-gradient-to-br ${currentThemeData.textColor} bg-clip-text text-transparent`}
            initial={{ y: -50, opacity: 0 }}
            animate={{ 
              y: isTransitioning ? -100 : 0,
              opacity: isTransitioning ? 0 : 1
            }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              letterSpacing: '0.05em',
              textShadow: `
                1px 1px 2px rgba(0, 0, 0, 0.3),
                2px 2px 4px rgba(0, 0, 0, 0.2),
                3px 3px 6px rgba(0, 0, 0, 0.1),
                4px 4px 8px rgba(0, 0, 0, 0.05)
              `,
              WebkitTextStroke: '1px rgba(0, 0, 0, 0.3)'
            }}
          >
            {currentThemeData.title}
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl lg:text-3xl text-white/90 max-w-2xl mx-auto px-8 font-light"
            initial={{ y: 50, opacity: 0 }}
            animate={{ 
              y: isTransitioning ? 100 : 0,
              opacity: isTransitioning ? 0 : 1
            }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {currentThemeData.subtitle}
          </motion.p>
        </div>
      </motion.div>

      {/* Progress Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
        {themes.map((_, index) => (
          <motion.div
            key={index}
            className={`h-2 rounded-full transition-all duration-500 ${
              index === currentTheme 
                ? 'w-16 bg-white' 
                : 'w-8 bg-white/40'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          />
        ))}
      </div>

      {/* Satellite Data Context */}
      <motion.div
        className="absolute bottom-24 left-8 right-8 text-center z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: isTransitioning ? 0 : 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="inline-block bg-black/50 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
          <p className="text-white/80 text-sm font-mono">
            {currentTheme === 0 && 'NDVI • LAI • SAVI • Vegetation Analysis'}
            {currentTheme === 1 && 'NDWI • Water Bodies • Moisture Mapping'}
            {currentTheme === 2 && 'Geology • Soil Types • Mineral Detection'}
            {currentTheme === 3 && 'Atmospheric Data • Climate Patterns • Weather Analysis'}
          </p>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        className="absolute top-24 right-8 z-30"
        initial={{ opacity: 0, x: 50 }}
        animate={{ 
          opacity: isTransitioning ? 0 : 1,
          x: isTransitioning ? 100 : 0
        }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <motion.a
          href="/map"
          className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Explore Geoportal</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </motion.a>
      </motion.div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  )
}