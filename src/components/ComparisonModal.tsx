'use client'

import { useState } from 'react'

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
  const [activeImage, setActiveImage] = useState<'left' | 'right' | 'both'>('both')
  const [zoomLevel, setZoomLevel] = useState(1)

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
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
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
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
        <div className="p-6 overflow-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image 1 - Earlier Date */}
            {(activeImage === 'left' || activeImage === 'both') && (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    📅 Earlier Image
                    <span className="text-sm font-normal text-blue-700">{date1}</span>
                  </h3>
                </div>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                  <div 
                    className="overflow-auto"
                    style={{ 
                      maxHeight: '500px',
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'top left'
                    }}
                  >
                    <img
                      src={image1Url}
                      alt={`Satellite image from ${date1}`}
                      className="w-full h-auto"
                      style={{ maxWidth: 'none' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Image 2 - Later Date */}
            {(activeImage === 'right' || activeImage === 'both') && (
              <div className="space-y-3">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                    📅 Later Image
                    <span className="text-sm font-normal text-purple-700">{date2}</span>
                  </h3>
                </div>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                  <div 
                    className="overflow-auto"
                    style={{ 
                      maxHeight: '500px',
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'top left'
                    }}
                  >
                    <img
                      src={image2Url}
                      alt={`Satellite image from ${date2}`}
                      className="w-full h-auto"
                      style={{ maxWidth: 'none' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Tips */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">💡 Comparison Analysis Tips:</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Look for changes in vegetation patterns (green/brown variations)</li>
              <li>• Identify water body expansion or reduction</li>
              <li>• Notice urban development or infrastructure changes</li>
              <li>• Check for seasonal variations or drought effects</li>
              <li>• Use zoom to examine specific areas of interest</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}