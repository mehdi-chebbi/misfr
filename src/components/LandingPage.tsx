'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// Define the Leaf type
interface Leaf {
  id: string;
  emoji: string;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
}

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [leaves, setLeaves] = useState<Leaf[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentTheme, setCurrentTheme] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const themes = [
    {
      emoji: '🌿',
      title: 'NATURE',
      subtitle: 'Vegetation Health & Forest Ecosystems',
      videoSrc: 'https://assets.mixkit.co/videos/2788/2788-720.mp4',
      speed: 1,
            bgColor: 'from-green-900/90 to-emerald-900/90',

      textColor: 'from-green-400 to-emerald-300',
      optionBg: '#fff5a0'
    },
    {
      emoji: '🌊',
      title: 'OCEAN',
      subtitle: 'Water Bodies & Marine Environments',
      videoSrc: 'https://assets.mixkit.co/videos/48525/48525-720.mp4',
      speed: 1,
      bgColor: 'from-blue-900/90 to-cyan-900/90',
      textColor: 'from-blue-400 to-cyan-300',
      optionBg: '#ffc8a2'
    },
{
  emoji: '🌾',
  title: 'CROPS',
  subtitle: 'Agriculture & Farming Landscapes',
  videoSrc: 'https://assets.mixkit.co/videos/33422/33422-720.mp4',
  speed: 1,
  bgColor: 'from-green-900/90 to-lime-900/90',
  textColor: 'from-green-400 to-lime-300',
  optionBg: '#d9ffb3'
}
,
    {
      emoji: '⛰️',
      title: 'EARTH',
      subtitle: 'Geological Features & Land Formation',
      videoSrc: 'https://assets.mixkit.co/videos/43129/43129-720.mp4',
      speed: 1,
      bgColor: 'from-amber-900/90 to-orange-900/90',
      textColor: 'from-amber-400 to-orange-300',
      optionBg: '#ffb3b3'
    },
   {
  emoji: '🏙️',
  title: 'URBAN',
  subtitle: 'Cityscapes & Human Infrastructure',
  videoSrc: 'https://assets.mixkit.co/videos/26920/26920-720.mp4',
  speed: 1,
  bgColor: 'from-blue-900/90 to-indigo-900/90',
  textColor: 'from-blue-400 to-indigo-300',
  optionBg: '#b3d9ff'
}
  ]

  // Generate leaves only on client side
  useEffect(() => {
    setLeaves(generateLeaves())
  }, [])

  // Video theme cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentTheme((prev) => (prev + 1) % themes.length)
        setIsTransitioning(false)
      }, 800)
    }, 8000) // Change theme every 8 seconds (slower)

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

  const features = [
    {
      icon: '🛰️',
      title: 'Satellite Data Integration',
      description: 'Access real-time Copernicus satellite imagery and geospatial data for comprehensive analysis.',
      color: 'from-green-600 to-emerald-700'
    },
    {
      icon: '🗺️',
      title: 'Interactive Mapping',
      description: 'Draw polygons, rectangles, and circles to define your areas of interest with precision.',
      color: 'from-emerald-600 to-teal-700'
    },
    {
      icon: '📊',
      title: 'Multi-Layer Analysis',
      description: 'Analyze NDVI, geology, moisture index, and vegetation data layers simultaneously.',
      color: 'from-teal-600 to-cyan-700'
    },
    {
      icon: '📅',
      title: 'Time-Series Data',
      description: 'Compare historical satellite data with customizable date ranges and temporal filtering.',
      color: 'from-green-700 to-emerald-800'
    },
    {
      icon: '☁️',
      title: 'Cloud Filtering',
      description: 'Adjust cloud coverage thresholds to ensure the clearest possible satellite imagery.',
      color: 'from-emerald-700 to-green-800'
    },
    {
      icon: '💾',
      title: 'Export Capabilities',
      description: 'Download high-quality map images with your analysis results for reports and presentations.',
      color: 'from-teal-700 to-cyan-800'
    }
  ]

  const useCases = [
    {
      title: 'Agricultural Monitoring',
      description: 'Track crop health, vegetation indices, and soil moisture for precision farming.',
      icon: '🌾',
      gradient: 'from-yellow-600 to-orange-600'
    },
    {
      title: 'Environmental Research',
      description: 'Monitor deforestation, land use changes, and ecosystem health over time.',
      icon: '🌳',
      gradient: 'from-green-600 to-emerald-700'
    },
    {
      title: 'Urban Planning',
      description: 'Analyze urban growth patterns and plan infrastructure development effectively.',
      icon: '🏙️',
      gradient: 'from-blue-600 to-indigo-700'
    },
    {
      title: 'Disaster Management',
      description: 'Assess damage and monitor recovery efforts after natural disasters.',
      icon: '🚨',
      gradient: 'from-red-600 to-orange-700'
    }
  ]

  // Enhanced leaf generation with better distribution
  const generateLeaves = (): Leaf[] => {
    const emojis = ['🍃', '🌿', '🍂', '🌱', '🍀'];
    const leaves: Leaf[] = [];
    
    // Create exactly 15 leaves for this section
    for (let i = 0; i < 15; i++) {
      leaves.push({
        id: `leaf-${i}`,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        left: Math.random() * 90 + 5, // 5% to 95% to avoid edges
        top: Math.random() * 90 + 5,  // 5% to 95% to avoid edges
        size: Math.random() * 1.2 + 0.8, // Size between 0.8 and 2rem
        duration: Math.random() * 8 + 12, // Duration between 12-20s
        delay: Math.random() * 5,
        rotation: Math.random() * 360,
      });
    }
    
    return leaves;
  };

  return (
    <div className="min-h-screen mist-gradient relative overflow-hidden">
      <div className="relative w-full h-[92vh] overflow-hidden">
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

  


        {/* Main Title */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-30 w-full h-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: isTransitioning ? 1.2 : 1,
            opacity: isTransitioning ? 0 : 1
          }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center w-full max-w-7xl mx-auto px-4">
            <motion.h1
              className={`text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-4 bg-gradient-to-br ${currentThemeData.textColor} bg-clip-text text-transparent text-center`}
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
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 w-full mx-auto font-light text-center"
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

        

    

        {/* Scroll Down Indicator */}
        <motion.div 
className="absolute bottom-8 left-1/2 transform -translate-x-1/2 -ml-14 flex flex-col items-center text-white z-30"          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className="text-sm mb-2 text-white/80 font-medium">Explore Now</span>
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors cursor-pointer"
               onClick={() => {
                 const element = document.getElementById('features');
                 if (element) {
                   element.scrollIntoView({ 
                     behavior: 'smooth',
                     block: 'start'
                   });
                 }
               }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Features Section - Evenly Distributed Leaves */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {leaves.map((leaf) => (
            <motion.div
              key={leaf.id}
              className="absolute opacity-40"
              style={{
                left: `${leaf.left}%`,
                top: `${leaf.top}%`,
                fontSize: `${leaf.size}rem`,
              }}
              initial={{ rotate: leaf.rotation }}
              animate={{
                y: [0, -15, 0],        // Reduced movement
                rotate: [leaf.rotation, leaf.rotation + 5, leaf.rotation - 5, leaf.rotation], // Simplified rotation
              }}
              transition={{
                duration: leaf.duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: leaf.delay,
              }}
            >
              {leaf.emoji}
            </motion.div>
          ))}
        </div>

        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234a7c28' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
         <motion.div 
  className="text-center mb-20"
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
  <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
    Powerful Features for <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">Environmental Analysis</span>
  </h2>
  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
    Everything you need to analyze satellite data and create insightful environmental maps
  </p>
</motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="nature-card rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 }
                }}
              >
                <div className={`text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 float-animation`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {feature.description}
                </p>
                <div className={`h-1 bg-gradient-to-r ${feature.color} rounded-full mt-6`}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Use Cases Section - Evenly Distributed Leaves */}
      <section className="py-24 forest-gradient relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {leaves.map((leaf) => (
            <motion.div
              key={`usecase-${leaf.id}`}
              className="absolute text-white opacity-30"
              style={{
                left: `${leaf.left}%`,
                top: `${leaf.top}%`,
                fontSize: `${leaf.size}rem`,
              }}
              initial={{ rotate: leaf.rotation }}
              animate={{
                y: [0, -12, 0],        // Reduced movement
                rotate: [leaf.rotation, leaf.rotation + 3, leaf.rotation - 3, leaf.rotation], // Simplified rotation
              }}
              transition={{
                duration: leaf.duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: leaf.delay + 1,
              }}
            >
              {leaf.emoji}
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Real-World Environmental Applications
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              Discover how Misbar Africa transforms environmental monitoring and conservation efforts
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -8,
                  rotate: [-1, 1, -1],
                  transition: { duration: 0.3 }
                }}
              >
                <div className={`text-4xl mb-6 bg-gradient-to-r ${useCase.gradient} bg-clip-text text-transparent`}>
                  {useCase.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {useCase.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section - Evenly Distributed Leaves */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 nature-gradient opacity-90"></div>
        <div className="absolute inset-0">
          {leaves.map((leaf) => (
            <motion.div
              key={`cta-${leaf.id}`}
              className="absolute text-white opacity-25"
              style={{
                left: `${leaf.left}%`,
                top: `${leaf.top}%`,
                fontSize: `${leaf.size * 1.3}rem`,
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: leaf.duration * 1.5,
                repeat: Infinity,
                ease: "linear",
                delay: leaf.delay,
              }}
            >
              {leaf.emoji}
            </motion.div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8">
              Ready to Transform Your Environmental Analysis?
            </h2>
            <p className="text-xl text-green-100 mb-12 leading-relaxed max-w-3xl mx-auto">
              Join researchers, conservationists, and environmental scientists who use Misbar Africa for cutting-edge geospatial intelligence and nature monitoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/map"
                className="bg-white text-green-700 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-green-500/25 group flex items-center justify-center space-x-3"
              >
                <span>Start Analyzing Now</span>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/forum"
                className="bg-transparent border-3 border-white text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm flex items-center justify-center space-x-3"
              >
                <span>💬 Join Community</span>
              </Link>
              <button className="bg-white/10 border-3 border-white/30 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">
                Schedule Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16 relative">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234a7c28' fill-opacity='0.4'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 nature-gradient rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold">Misbar Africa</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Advanced geospatial intelligence platform powered by Copernicus satellite data for environmental monitoring and conservation.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6 text-green-400">Features</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-green-400 transition-colors cursor-pointer">Interactive Mapping</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Satellite Data Analysis</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Time-Series Comparison</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Environmental Monitoring</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6 text-green-400">Resources</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-green-400 transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">API Reference</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Environmental Tutorials</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Conservation Support</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6 text-green-400">Connect With Nature</h3>
              <div className="space-y-4">
                <p className="text-gray-400 leading-relaxed">
                  Stay updated with the latest environmental monitoring features and conservation insights.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:scale-110">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:scale-110">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:scale-110">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p className="flex items-center justify-center space-x-2">
              <span>© 2024 Misbar Africa. All rights reserved.</span>
              <span className="text-green-400">🌿</span>
              <span>Powered by Copernicus Data Space Ecosystem.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}