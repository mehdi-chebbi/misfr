'use client'

import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import { Waves, Droplets, ThermometerSun, Mountain, Wind, Activity, Eye, ArrowRight, TreePine } from 'lucide-react'

export default function NileEgyptPage() {
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
      title: 'The River of Life',
      content: 'The Nile River stretches over 6,650 kilometers, making it the longest river in the world. For millennia, this ancient waterway has sustained civilizations, shaped landscapes, and continues to be the lifeblood of Egypt. Through satellite analysis, we can observe how this mighty river transforms the desert into fertile agricultural land.',
      image: 'https://media.istockphoto.com/id/867742350/photo/nil-river-aerial-view.jpg?s=612x612&w=0&k=20&c=NMNxPVGRnNciwaVMo0v7OFEXB8I-KfrzwQF-DcbZ6fA=',
      position: 'left',
      accent: 'from-blue-500 to-cyan-600',
      borderColor: 'border-blue-500/40',
      glowColor: 'shadow-blue-500/50'
    },
    {
      id: 'agriculture',
      title: 'Fertile Crescent',
      subtitle: 'Normalized Difference Vegetation Index (NDVI)',
      icon: TreePine,
      accent: 'from-green-500 to-emerald-600',
      borderColor: 'border-green-500/40',
      textColor: 'text-green-400',
      bgColor: 'bg-green-500/20',
      dotColor: 'bg-green-500',
      iconBg: 'from-green-500 to-emerald-600',
      glowColor: 'shadow-green-500/50',
      content: 'The Nile Delta and floodplain create one of the most striking NDVI patterns visible from space. The contrast between the vibrant green agricultural zones (NDVI 0.6-0.8) and the surrounding desert reveals how the river transforms Egypt\'s landscape. Satellite imagery shows the intricate network of irrigation channels that sustain year-round agriculture.',
      image: 'https://media.istockphoto.com/id/622960078/photo/irrigated-fields-along-the-nile-river.jpg?s=612x612&w=0&k=20&c=QcslRssQIy1qnhOy9Ym4RGpWZ5nuSekxIc4VQFQUJNs=',
      position: 'right',
      stats: ['NDVI 0.6-0.8 in farmland', '2.8M hectares irrigated', 'Multiple crop cycles']
    },
    {
      id: 'water-quality',
      title: 'Flowing Waters',
      subtitle: 'Water Quality & Turbidity',
      icon: Waves,
      accent: 'from-blue-500 to-teal-600',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      dotColor: 'bg-blue-500',
      iconBg: 'from-blue-500 to-teal-600',
      glowColor: 'shadow-blue-500/50',
      content: 'Advanced satellite sensors monitor the Nile\'s water quality by measuring turbidity, chlorophyll content, and suspended sediments. This data reveals pollution hotspots, irrigation return flows, and the impact of the Aswan High Dam on downstream water quality, crucial for managing this vital resource for 100 million Egyptians.',
      image: 'https://www.whiteclouds.com/wp-content/uploads/elementor/thumbs/Nile-River-Watershed-Map-main-r0ao904hq1lwr0ogkl8n8dv7b1nnwe44cr0q1008pu.jpg',
      position: 'left',
      stats: ['Monitors pollution sources', 'Dam impact assessment', '100M people dependent']
    },
    {
      id: 'evaporation',
      title: 'Desert Heat',
      subtitle: 'Evaporation & Water Loss',
      icon: ThermometerSun,
      accent: 'from-orange-500 to-red-600',
      borderColor: 'border-orange-500/40',
      textColor: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      dotColor: 'bg-orange-500',
      iconBg: 'from-orange-500 to-red-600',
      glowColor: 'shadow-orange-500/50',
      content: 'The Nile faces extreme evaporation rates as it flows through the Sahara Desert, with water losses reaching 8-10mm per day during summer months. Thermal imaging reveals temperature variations that help quantify evaporation patterns, essential for water management in one of the world\'s most water-stressed regions.',
      image: 'https://i.guim.co.uk/img/media/0034850395381253f634ee6127dd3389b45a0ba0/0_148_3000_1800/master/3000.jpg?width=1200&height=900&quality=85&auto=format&fit=crop&s=c4870f4717b276865fd500f6cca5c66b',
      position: 'right',
      stats: ['8-10mm daily evaporation', 'Temperature mapping', 'Water loss tracking']
    },
 
    {
      id: 'urban',
      title: 'River Cities',
      subtitle: 'Urban Growth & Infrastructure',
      icon: Activity,
      accent: 'from-purple-500 to-indigo-600',
      borderColor: 'border-purple-500/40',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      dotColor: 'bg-purple-500',
      iconBg: 'from-purple-500 to-indigo-600',
      glowColor: 'shadow-purple-500/50',
      content: 'From Cairo to Luxor, Egypt\'s major cities have developed along the Nile for thousands of years. Modern satellite imagery tracks rapid urbanization, infrastructure development, and the growing pressure on water resources. This analysis helps planners balance development with sustainable water management.',
      image: 'https://media.istockphoto.com/id/1180786967/photo/panorama-of-cairo.jpg?s=612x612&w=0&k=20&c=Wk3c7snqjGcA56QMA3JUfd_erGcUeDeDTn99T1tjQyQ=',
      position: 'right',
      stats: ['20M in Greater Cairo', 'Urban sprawl tracking', 'Infrastructure planning']
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transition: 'left 0.3s, top 0.3s'
          }}
        />
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage: 'url(/nile.jpg)',
            transform: `translateY(${scrollY * 0.5}px) scale(1.1)`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
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
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-all mb-12 text-lg group backdrop-blur-sm bg-black/30 px-6 py-3 rounded-full border border-blue-500/30 hover:border-blue-500/60"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            Back to Journey
          </Link>
          
          <div className="mb-8 inline-block">
            <div className="flex items-center gap-3 text-blue-400/80 text-sm tracking-widest uppercase backdrop-blur-sm bg-black/30 px-6 py-2 rounded-full border border-blue-500/20">
              <Waves className="w-4 h-4" />
              <span>River Analysis</span>
            </div>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-blue-200 via-cyan-300 to-blue-200 bg-clip-text text-transparent animate-pulse" style={{ animationDuration: '3s' }}>
            Nile River
          </h1>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500"></div>
            <p className="text-2xl md:text-3xl text-blue-300 font-light tracking-wide">Egypt</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-500"></div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed backdrop-blur-sm bg-black/20 px-8 py-4 rounded-2xl border border-white/10">
            The world's longest river and lifeline of ancient and modern Egypt
          </p>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-12 border-2 border-blue-400/60 rounded-full flex justify-center pt-2 backdrop-blur-sm bg-black/20">
            <div className="w-1 h-3 bg-blue-400 rounded-full animate-pulse" />
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
                         style={{ background: `linear-gradient(to bottom right, ${section.accent.includes('green') ? 'rgb(34 197 94)' : section.accent.includes('blue') ? 'rgb(59 130 246)' : section.accent.includes('orange') ? 'rgb(249 115 22)' : section.accent.includes('purple') ? 'rgb(168 85 247)' : 'rgb(6 182 212)'} / 0.3, transparent)` }} />
                    
                    <div className={`relative overflow-hidden rounded-2xl shadow-2xl border ${section.borderColor || 'border-blue-500/20'} backdrop-blur-sm`}>
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
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-cyan-900/10 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
        
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="mb-12 inline-block">
            <div className="flex items-center gap-3 text-blue-400/80 text-sm tracking-widest uppercase backdrop-blur-sm bg-black/30 px-6 py-2 rounded-full border border-blue-500/20">
              <Eye className="w-4 h-4" />
              <span>Conclusion</span>
            </div>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-bold mb-10 bg-gradient-to-r from-blue-200 via-cyan-300 to-blue-200 bg-clip-text text-transparent">
            Ancient River, Modern Challenges
          </h2>
          
          <p className="text-2xl text-gray-300 leading-relaxed backdrop-blur-sm bg-white/5 px-10 py-8 rounded-2xl border border-white/10 max-w-4xl mx-auto">
            The Nile River continues to shape Egypt\'s destiny as it has for millennia. Through satellite technology, we gain unprecedented insights into this vital waterway, helping balance ancient agricultural traditions with modern water management challenges in an era of climate change and growing population pressure.
          </p>
          
          <div className="mt-16 flex flex-wrap justify-center gap-6">
            {[
              { icon: TreePine, label: 'Agriculture' },
              { icon: Waves, label: 'Water Quality' },
              { icon: ThermometerSun, label: 'Evaporation' },
              { icon: Mountain, label: 'Delta Dynamics' },
              { icon: Activity, label: 'Urban Growth' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 group cursor-default">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:border-blue-500/60 transition-all">
                  <item.icon className="w-8 h-8 text-blue-400" />
                </div>
                <span className="text-sm text-gray-400 group-hover:text-blue-400 transition-colors">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}