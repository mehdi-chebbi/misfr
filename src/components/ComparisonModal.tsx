'use client'

import { useState, useRef, useEffect } from 'react'

interface ComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  image1Url: string
  image2Url: string
  date1: string
  date2: string
  layer: string
  locationName?: string
}

export default function ComparisonModal({
  isOpen,
  onClose,
  image1Url,
  image2Url,
  date1,
  date2,
  layer,
  locationName = "Selected Area"
}: ComparisonModalProps) {
  // Existing states
  const [activeView, setActiveView] = useState<'side-by-side' | 'slider'>('side-by-side')
  const [activeImage, setActiveImage] = useState<'left' | 'right' | 'both'>('both')
  const [zoomLevel, setZoomLevel] = useState(1)
  
  // New states for the slider
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const sliderContainerRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleReset = () => {
    setZoomLevel(1)
    setActiveImage('both')
    setSliderPosition(50) // Also reset slider position
  }

  // --- Slider Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderContainerRef.current) return

    const containerRect = sliderContainerRef.current.getBoundingClientRect()
    const x = e.clientX - containerRect.left
    const percentage = (x / containerRect.width) * 100
    setSliderPosition(Math.min(Math.max(percentage, 0), 100))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">📊 Temporal Comparison</h2>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  📍 {locationName}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  🛰️ {layer.replace('-L2A', '').replace('_', ' ')}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-50 p-4 border-b flex-shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Tab Selection */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Mode:</span>
              <div className="flex bg-white rounded-lg shadow-sm">
                <button
                  onClick={() => setActiveView('side-by-side')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                    activeView === 'side-by-side' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📊 Side-by-Side
                </button>
                <button
                  onClick={() => setActiveView('slider')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                    activeView === 'slider' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🎚️ Slider
                </button>
              </div>
            </div>

            {/* Conditional Controls */}
            {activeView === 'side-by-side' ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">View:</span>
                <div className="flex bg-white rounded-lg shadow-sm">
                  <button
                    onClick={() => setActiveImage('left')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                      activeImage === 'left' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    📅 {date1}
                  </button>
                  <button
                    onClick={() => setActiveImage('both')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeImage === 'both' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    🔄 Both
                  </button>
                  <button
                    onClick={() => setActiveImage('right')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                      activeImage === 'right' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    📅 {date2}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 italic">
                Drag the slider to compare images
              </div>
            )}

            {/* Zoom Controls (Common for both views) */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Zoom:</span>
              <div className="flex bg-white rounded-lg shadow-sm">
                <button
                  onClick={handleZoomOut}
                  className="px-3 py-2 text-sm font-medium rounded-l-lg hover:bg-gray-100 transition-colors"
                >
                  ➖
                </button>
                <span className="px-3 py-2 text-sm font-medium bg-gray-100">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="px-3 py-2 text-sm font-medium rounded-r-lg hover:bg-gray-100 transition-colors"
                >
                  ➕
                </button>
              </div>
              <button
                onClick={handleReset}
                className="px-3 py-2 text-sm font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>

        {/* Image Comparison Area */}
        <div className="flex-1 overflow-hidden p-6">
          {activeView === 'side-by-side' ? (
            // --- ORIGINAL SIDE-BY-SIDE VIEW ---
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Image 1 - Earlier Date */}
              {(activeImage === 'left' || activeImage === 'both') && (
                <div className="flex flex-col h-full">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex-shrink-0">
                    <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                      📅 Period 1
                      <span className="text-sm font-normal text-blue-700">{date1}</span>
                    </h3>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden shadow-lg border border-gray-200">
                    <div className="w-full h-full overflow-auto">
                      <div className="flex items-center justify-center min-h-full p-4">
                        <img
                          src={image1Url}
                          alt={`Satellite image from ${date1}`}
                          className="max-w-full h-auto object-contain"
                          style={{ 
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: 'center'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Image 2 - Later Date */}
              {(activeImage === 'right' || activeImage === 'both') && (
                <div className="flex flex-col h-full">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex-shrink-0">
                    <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                      📅 Period 2
                      <span className="text-sm font-normal text-purple-700">{date2}</span>
                    </h3>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden shadow-lg border border-gray-200">
                    <div className="w-full h-full overflow-auto">
                      <div className="flex items-center justify-center min-h-full p-4">
                        <img
                          src={image2Url}
                          alt={`Satellite image from ${date2}`}
                          className="max-w-full h-auto object-contain"
                          style={{ 
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: 'center'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // --- NEW SLIDER VIEW ---
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1">
                  <span className="font-semibold text-blue-900">📅 Earlier: {date1}</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-1">
                  <span className="font-semibold text-purple-900">📅 Later: {date2}</span>
                </div>
              </div>
              <div 
                ref={sliderContainerRef}
                className="flex-1 relative bg-gray-100 rounded-lg overflow-hidden shadow-lg border border-gray-200"
                style={{ cursor: isDragging ? 'ew-resize' : 'default' }}
              >
                {/* Container for both images to handle zoom */}
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
                >
                  {/* Bottom Image (Older) */}
                  <img
                    src={image1Url}
                    alt={`Older satellite image from ${date1}`}
                    className="max-w-full h-auto object-contain"
                    draggable={false}
                  />
                </div>

                {/* Top Image (Newer) with clipping */}
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ 
                    clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                    transform: `scale(${zoomLevel})`, 
                    transformOrigin: 'center'
                  }}
                >
                  <img
                    src={image2Url}
                    alt={`Newer satellite image from ${date2}`}
                    className="max-w-full h-auto object-contain"
                    draggable={false}
                  />
                </div>

                {/* Slider Line and Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                  style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                  onMouseDown={handleMouseDown}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg p-1">
                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Tips - Fixed at bottom */}
        <div className="bg-amber-50 border border-amber-200 p-4 flex-shrink-0">
          <h4 className="font-semibold text-amber-900 mb-2">💡 Comparison Analysis Tips:</h4>
          <div className="text-sm text-amber-800 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <li>• Look for changes in vegetation patterns (green/brown variations)</li>
              <li>• Identify water body expansion or reduction</li>
              <li>• Notice urban development or infrastructure changes</li>
            </div>
            <div>
              <li>• Check for seasonal variations or drought effects</li>
              <li>• Use zoom to examine specific areas of interest</li>
              <li>• Compare cloud-free areas for accurate analysis</li>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}