'use client'

import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import { Trees, Droplets, ThermometerSun, Mountain, Wind, Activity, Eye, ArrowRight, Flower } from 'lucide-react'

export default function CapeSouthAfricaPage() {
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
      title: 'Botanical Treasure',
      content: 'The Cape Floristic Region is the smallest yet richest of Earth\'s six floral kingdoms, containing over 9,000 plant species in just 90,000 square kilometers. This UNESCO World Heritage Site hosts an incredible concentration of biodiversity found nowhere else on Earth, making it a global priority for conservation and botanical research.',
      image: 'https://gemellebeauty.com/cdn/shop/files/Gemelle_Cape-Fynbos.jpg?v=1712156488&width=1080',
      position: 'left',
      accent: 'from-pink-500 to-purple-600',
      borderColor: 'border-pink-500/40',
      glowColor: 'shadow-pink-500/50'
    },
    {
      id: 'biodiversity',
      title: 'Kingdom of Plants',
      subtitle: 'Biodiversity Hotspot Analysis',
      icon: Trees,
      accent: 'from-green-500 to-emerald-600',
      borderColor: 'border-green-500/40',
      textColor: 'text-green-400',
      bgColor: 'bg-green-500/20',
      dotColor: 'bg-green-500',
      iconBg: 'from-green-500 to-emerald-600',
      glowColor: 'shadow-green-500/50',
      content: 'This region boasts the highest plant diversity on Earth per unit area, with 69% of species found nowhere else. Satellite NDVI analysis reveals the intricate mosaic of fynbos vegetation types, from protea-rich shrublands to restio-dominated wetlands, each supporting unique assemblages of endemic species.',
      image: 'https://www.percytours.com/uploads/4/1/9/3/4193894/protea-flowers-fynbos-hermanus_orig.jpg',
      position: 'right',
      stats: ['9,000+ plant species', '69% endemism rate', '3x Northern Hemisphere diversity']
    },
    {
      id: 'table-mountain',
      title: 'Mountain Islands',
      subtitle: 'Table Mountain Ecosystems',
      icon: Mountain,
      accent: 'from-stone-500 to-gray-600',
      borderColor: 'border-stone-500/40',
      textColor: 'text-stone-400',
      bgColor: 'bg-stone-500/20',
      dotColor: 'bg-stone-500',
      iconBg: 'from-stone-500 to-gray-600',
      glowColor: 'shadow-stone-500/50',
      content: 'Table Mountain alone hosts over 2,200 plant species, more than entire countries. The sandstone plateau acts as a sky island, creating unique microclimates through cloud interception and moisture trapping. Elevation mapping reveals distinct vegetation belts from sea level to 1,085 meters.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Stolov%C3%A1_hora_a_12_apo%C5%A1tol%C5%AF%2C_Kapsk%C3%A9_m%C4%9Bsto_-_Table_Mountains%2C_Cape_Town_-_panoramio.jpg',
      position: 'right',
      stats: ['2,200+ species on Table Mountain', 'Multiple vegetation belts', 'Cloud forest ecosystems']
    },
    {
      id: 'coastal',
      title: 'Coastal Cradle',
      subtitle: 'Marine-Terrestrial Interface',
      icon: Droplets,
      accent: 'from-blue-500 to-cyan-600',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      dotColor: 'bg-blue-500',
      iconBg: 'from-blue-500 to-cyan-600',
      glowColor: 'shadow-blue-500/50',
      content: 'The Mediterranean climate with winter rainfall creates unique coastal fynbos and strandveld vegetation. Satellite analysis shows how ocean fog and marine upwelling influence plant distribution, creating specialized ecosystems where rare coastal endemics thrive in the interface between land and sea.',
      image: 'https://thefynbosguy.com/wp-content/uploads/2020/06/1-9.jpg',
      position: 'left',
      stats: ['Mediterranean climate', 'Coastal endemics', 'Marine fog influence']
    },
    {
      id: 'conservation',
      title: 'Living Museum',
      subtitle: 'Conservation & Threat Monitoring',
      icon: Activity,
      accent: 'from-purple-500 to-pink-600',
      borderColor: 'border-purple-500/40',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      dotColor: 'bg-purple-500',
      iconBg: 'from-purple-500 to-pink-600',
      glowColor: 'shadow-purple-500/50',
      content: 'With 20% of species threatened with extinction, the Cape Floristic Region is a conservation priority. Satellite monitoring tracks invasive species spread, habitat fragmentation, and climate change impacts. This data guides protected area management and biodiversity corridor creation to safeguard this irreplaceable botanical heritage.',
      image: 'https://thenewspaper.co.za/wp-content/uploads/2021/08/TNP0821_web27.jpg',
      position: 'right',
      stats: ['20% species threatened', 'Invasive species monitoring', 'Biodiversity corridors']
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transition: 'left 0.3s, top 0.3s'
          }}
        />
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage: 'url(/flora.jpg)',
            transform: `translateY(${scrollY * 0.5}px) scale(1.1)`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-pink-400/30 rounded-full animate-pulse"
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
            className="inline-flex items-center text-pink-400 hover:text-pink-300 transition-all mb-12 text-lg group backdrop-blur-sm bg-black/30 px-6 py-3 rounded-full border border-pink-500/30 hover:border-pink-500/60"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            Back to Journey
          </Link>
          
          <div className="mb-8 inline-block">
            <div className="flex items-center gap-3 text-pink-400/80 text-sm tracking-widest uppercase backdrop-blur-sm bg-black/30 px-6 py-2 rounded-full border border-pink-500/20">
              <Flower className="w-4 h-4" />
              <span>Floral Kingdom</span>
            </div>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-pink-200 via-purple-300 to-pink-200 bg-clip-text text-transparent animate-pulse" style={{ animationDuration: '3s' }}>
            Cape Floristic Region
          </h1>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-pink-500"></div>
            <p className="text-2xl md:text-3xl text-pink-300 font-light tracking-wide">South Africa</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-pink-500"></div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed backdrop-blur-sm bg-black/20 px-8 py-4 rounded-2xl border border-white/10">
            Earth's smallest yet richest floral kingdom
          </p>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-12 border-2 border-pink-400/60 rounded-full flex justify-center pt-2 backdrop-blur-sm bg-black/20">
            <div className="w-1 h-3 bg-pink-400 rounded-full animate-pulse" />
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
                         style={{ background: `linear-gradient(to bottom right, ${section.accent.includes('green') ? 'rgb(34 197 94)' : section.accent.includes('blue') ? 'rgb(59 130 246)' : section.accent.includes('orange') ? 'rgb(249 115 22)' : section.accent.includes('purple') ? 'rgb(168 85 247)' : section.accent.includes('stone') ? 'rgb(120 113 108)' : 'rgb(236 72 153)'} / 0.3, transparent)` }} />
                    
                    <div className={`relative overflow-hidden rounded-2xl shadow-2xl border ${section.borderColor || 'border-pink-500/20'} backdrop-blur-sm`}>
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
        <div className="absolute inset-0 bg-gradient-to-t from-pink-900/30 via-purple-900/10 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-500/5 via-transparent to-transparent" />
        
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="mb-12 inline-block">
            <div className="flex items-center gap-3 text-pink-400/80 text-sm tracking-widest uppercase backdrop-blur-sm bg-black/30 px-6 py-2 rounded-full border border-pink-500/20">
              <Eye className="w-4 h-4" />
              <span>Conclusion</span>
            </div>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-bold mb-10 bg-gradient-to-r from-pink-200 via-purple-300 to-pink-200 bg-clip-text text-transparent">
            Irreplaceable Heritage
          </h2>
          
          <p className="text-2xl text-gray-300 leading-relaxed backdrop-blur-sm bg-white/5 px-10 py-8 rounded-2xl border border-white/10 max-w-4xl mx-auto">
            The Cape Floristic Region represents Earth\'s botanical masterpiece, a living laboratory where evolution has created unprecedented diversity in the smallest space. Through satellite analysis, we gain the tools to protect this irreplaceable heritage for future generations while understanding the intricate ecological processes that make this region unique on our planet.
          </p>
          
          <div className="mt-16 flex flex-wrap justify-center gap-6">
            {[
              { icon: Trees, label: 'Biodiversity' },
              { icon: ThermometerSun, label: 'Fire Ecology' },
              { icon: Mountain, label: 'Mountain Islands' },
              { icon: Droplets, label: 'Coastal Systems' },
              { icon: Activity, label: 'Conservation' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 group cursor-default">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:border-pink-500/60 transition-all">
                  <item.icon className="w-8 h-8 text-pink-400" />
                </div>
                <span className="text-sm text-gray-400 group-hover:text-pink-400 transition-colors">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}