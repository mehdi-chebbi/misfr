'use client'

import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import { Mountain, Trees, Droplets, ThermometerSun, Wind, Activity, Eye, ArrowRight, MapPin } from 'lucide-react'

export default function RiftKenyaPage() {
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  // Generate stable particle positions that won't change between server and client
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${(i * 37 + 23) % 100}%`,
      top: `${(i * 53 + 17) % 100}%`,
      delay: `${(i * 0.3) % 3}s`,
      duration: `${2 + (i * 0.2) % 3}s`
    }))
  }, [])

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const sections = [
    {
      id: 'intro',
      title: 'The Great Divide',
      content: 'The Great Rift Valley stretches over 6,000 kilometers from Lebanon to Mozambique, with Kenya hosting some of its most dramatic sections. This geological wonder is actively tearing Africa apart, creating deep valleys, towering escarpments, and unique ecosystems that have shaped human evolution for millions of years.',
      image: 'https://media.sciencephoto.com/e5/25/01/34/e5250134-800px-wm.jpg',
      position: 'left',
      accent: 'from-orange-500 to-red-600',
      borderColor: 'border-orange-500/40',
      glowColor: 'shadow-orange-500/50'
    },
    {
      id: 'geological',
      title: 'Earth in Motion',
      subtitle: 'Tectonic Activity & Elevation',
      icon: Mountain,
      accent: 'from-red-500 to-orange-600',
      borderColor: 'border-red-500/40',
      textColor: 'text-red-400',
      bgColor: 'bg-red-500/20',
      dotColor: 'bg-red-500',
      iconBg: 'from-red-500 to-orange-600',
      glowColor: 'shadow-red-500/50',
      content: 'The Rift Valley is actively widening at a rate of 6-7mm per year, gradually splitting the African Plate into two. Satellite radar interferometry reveals ground deformation patterns, while elevation mapping shows the dramatic contrast between valley floors at 600m and surrounding highlands rising to 3,000m.',
      image: 'https://domestictourismsafaris.co.tz/wp-content/uploads/2016/10/The-Rift1.jpg',
      position: 'right',
      stats: ['6-7mm annual widening', '2,400m elevation range', 'Active volcanism']
    },
    {
      id: 'lakes',
      title: 'Mirror Lakes',
      subtitle: 'Lake Systems & Water Resources',
      icon: Droplets,
      accent: 'from-blue-500 to-cyan-600',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      dotColor: 'bg-blue-500',
      iconBg: 'from-blue-500 to-cyan-600',
      glowColor: 'shadow-blue-500/50',
      content: 'The Rift Valley contains some of the world\'s most remarkable lakes, from the deep, alkaline waters of Lake Nakuru to the freshwater expanse of Lake Victoria. These lakes support incredible biodiversity, including millions of flamingos and unique fish species found nowhere else on Earth.',
      image: 'https://www.andbeyond.com/wp-content/uploads/sites/5/flamingos-lakes-great-rift-valley.jpg',
      position: 'left',
      stats: ['8 major Rift lakes', 'Flamingo habitats', 'Endemic fish species']
    },
    {
      id: 'biodiversity',
      title: 'Cradle of Life',
      subtitle: 'Biodiversity Hotspots',
      icon: Trees,
      accent: 'from-green-500 to-emerald-600',
      borderColor: 'border-green-500/40',
      textColor: 'text-green-400',
      bgColor: 'bg-green-500/20',
      dotColor: 'bg-green-500',
      iconBg: 'from-green-500 to-emerald-600',
      glowColor: 'shadow-green-500/50',
      content: 'The Rift Valley\'s varied elevations create multiple ecosystems, from acacia savannas to montane forests. This biodiversity hotspot supports over 1,000 bird species, including millions of migratory birds that use the lakes as crucial stopover points between Europe and Southern Africa.',
      image: 'https://t3.ftcdn.net/jpg/12/65/02/62/360_F_1265026284_tdPn5vWz4vv4GL87QBv2MuILFXrjjxD4.jpg',
      position: 'left',
      stats: ['1,000+ bird species', 'Multiple ecosystems', 'Migration corridor']
    },

  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transition: 'left 0.3s, top 0.3s'
          }}
        />
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage: 'url(https://justnature.travel/wp-content/uploads/2024/05/Free-Use-22.jpg)',
            transform: `translateY(${scrollY * 0.5}px) scale(1.1)`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-orange-400/30 rounded-full animate-pulse"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.delay,
                animationDuration: particle.duration
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <Link 
            href="/journey" 
            className="inline-flex items-center text-orange-400 hover:text-orange-300 transition-all mb-12 text-lg group backdrop-blur-sm bg-black/30 px-6 py-3 rounded-full border border-orange-500/30 hover:border-orange-500/60"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            Back to Journey
          </Link>
          
          <div className="mb-8 inline-block">
            <div className="flex items-center gap-3 text-orange-400/80 text-sm tracking-widest uppercase backdrop-blur-sm bg-black/30 px-6 py-2 rounded-full border border-orange-500/20">
              <Mountain className="w-4 h-4" />
              <span>Rift Analysis</span>
            </div>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-orange-200 via-red-300 to-orange-200 bg-clip-text text-transparent animate-pulse" style={{ animationDuration: '3s' }}>
            Great Rift Valley
          </h1>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-orange-500"></div>
            <p className="text-2xl md:text-3xl text-orange-300 font-light tracking-wide">Kenya</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-orange-500"></div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed backdrop-blur-sm bg-black/20 px-8 py-4 rounded-2xl border border-white/10">
            Where Africa tears apart and creates new worlds
          </p>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-12 border-2 border-orange-400/60 rounded-full flex justify-center pt-2 backdrop-blur-sm bg-black/20">
            <div className="w-1 h-3 bg-orange-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Article Sections */}
      <div className="relative">
        {sections.map((section, index) => {
          const Icon = section.icon
          const isLeft = section.position === 'left'
          
          return (
            <section 
              key={section.id}
              className="relative min-h-screen flex items-center py-32"
            >
              {/* Section number watermark */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 text-9xl font-bold text-white/5 select-none">
                {String(index + 1).padStart(2, '0')}
              </div>
              
              <div className="relative max-w-7xl mx-auto px-6 w-full">
                <div className={`grid md:grid-cols-2 gap-16 items-center ${isLeft ? '' : 'md:grid-flow-dense'}`}>
                  {/* Image */}
                  <div 
                    className={`relative group ${isLeft ? '' : 'md:col-start-2'}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl -z-10"
                         style={{ background: `linear-gradient(to bottom right, ${section.accent.includes('green') ? 'rgb(34 197 94)' : section.accent.includes('blue') ? 'rgb(59 130 246)' : section.accent.includes('orange') ? 'rgb(249 115 22)' : section.accent.includes('red') ? 'rgb(239 68 68)' : 'rgb(251 146 60)'} / 0.3, transparent)` }} />
                    
                    <div className={`relative overflow-hidden rounded-2xl shadow-2xl border ${section.borderColor || 'border-orange-500/20'} backdrop-blur-sm`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent mix-blend-overlay z-10 group-hover:from-white/20 transition-all duration-500" />
                      <img 
                        src={section.image} 
                        alt={section.title}
                        className="w-full h-[550px] object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      {/* Scan line effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent translate-y-full group-hover:translate-y-[-100%] transition-transform duration-1000 pointer-events-none" />
                    </div>
                    
                    {section.icon && (
                      <div className={`absolute -bottom-8 ${isLeft ? '-right-8' : '-left-8'} w-24 h-24 bg-gradient-to-br ${section.iconBg} rounded-2xl flex items-center justify-center shadow-2xl ${section.glowColor} rotate-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 border border-white/20`}>
                        <Icon className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={isLeft ? '' : 'md:col-start-1 md:row-start-1'}>
                    {section.subtitle && (
                      <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full ${section.bgColor} border ${section.borderColor} ${section.textColor} text-sm font-medium mb-6 backdrop-blur-sm hover:scale-105 transition-transform`}>
                        <Activity className="w-4 h-4" />
                        {section.subtitle}
                      </div>
                    )}
                    
                    <h2 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
                      {section.title}
                    </h2>
                    
                    <p className="text-xl text-gray-300 leading-relaxed mb-10 backdrop-blur-sm bg-white/5 p-6 rounded-xl border border-white/10">
                      {section.content}
                    </p>

                    {section.stats && (
                      <div className="space-y-4">
                        {section.stats.map((stat, i) => (
                          <div 
                            key={i}
                            className="group/stat flex items-center gap-4 text-gray-300 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-gray-700/50 hover:border-gray-600 transition-all hover:translate-x-2 cursor-default"
                          >
                            <div className={`w-3 h-3 ${section.dotColor} rounded-full group-hover/stat:scale-125 transition-transform ${section.glowColor} shadow-lg`} />
                            <span className="flex-1">{stat}</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </div>

      {/* Closing Section */}
      <section className="relative py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/30 via-red-900/10 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent" />
        
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="mb-12 inline-block">
            <div className="flex items-center gap-3 text-orange-400/80 text-sm tracking-widest uppercase backdrop-blur-sm bg-black/30 px-6 py-2 rounded-full border border-orange-500/20">
              <Eye className="w-4 h-4" />
              <span>Conclusion</span>
            </div>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-bold mb-10 bg-gradient-to-r from-orange-200 via-red-300 to-orange-200 bg-clip-text text-transparent">
            Earth in Transformation
          </h2>
          
          <p className="text-2xl text-gray-300 leading-relaxed backdrop-blur-sm bg-white/5 px-10 py-8 rounded-2xl border border-white/10 max-w-4xl mx-auto">
            The Great Rift Valley represents our planet in constant motion, a living laboratory where we can witness geological forces shaping landscapes and ecosystems in real-time. Through satellite analysis, we gain insights into Earth\'s dynamic processes and the incredible biodiversity that thrives in this ever-changing environment.
          </p>
          
          <div className="mt-16 flex flex-wrap justify-center gap-6">
            {[
              { icon: Mountain, label: 'Tectonics' },
              { icon: Droplets, label: 'Lakes' },
              { icon: ThermometerSun, label: 'Volcanism' },
              { icon: Trees, label: 'Biodiversity' },
              { icon: Activity, label: 'Agriculture' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 group cursor-default">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:border-orange-500/60 transition-all">
                  <item.icon className="w-8 h-8 text-orange-400" />
                </div>
                <span className="text-sm text-gray-400 group-hover:text-orange-400 transition-colors">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}