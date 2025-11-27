'use client'

import { useState } from 'react'

interface ComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  comparisonData: {
    image1: {
      filename: string
      filepath: string
      date: string
      layer: string
      url: string
    }
    image2: {
      filename: string
      date: string
      layer: string
      url: string
    }
    geometry: number[][]
    bbox: string
    cloud_percentage: number
    download_time: string
  } | null
  isLoading?: boolean
}

export default function ComparisonModal({ 
  isOpen, 
  onClose, 
  comparisonData, 
  isLoading = false 
}: ComparisonModalProps) {
  const [imageLoadErrors, setImageLoadErrors] = useState<{ [key: string]: boolean }>({})

  if (!isOpen) return null

  const handleImageError = (imageKey: string) => {
    setImageLoadErrors(prev => ({ ...prev, [imageKey]: true }))
  }

  const getImageUrl = (filename: string) => {
    // The images are served from the Flask API's static files or we need to create a route
    return `http://localhost:5000/api/comparison-images/${filename}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDownloadTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLayerDisplayName = (layer: string) => {
    const layerNames: { [key: string]: string } = {
      'NDVI-L2A': 'NDVI (Vegetation Health)',
      'NDWI-L2A': 'NDWI (Water Bodies)',
      'TRUE-COLOR-S2L2A': 'True Color (Natural View)',
      'FALSE-COLOR-S2L2A': 'False Color (Vegetation)',
      'MOISTURE-INDEX': 'Moisture Index',
      'GEOLOGY': 'Geological Features'
    }
    return layerNames[layer] || layer
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal Panel */}
        <div className="relative w-full max-w-7xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">🔄 Temporal Comparison</h2>
                <p className="text-green-100 text-sm">Side-by-side satellite imagery analysis</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-green-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                <p className="text-gray-600 text-lg">Downloading comparison images...</p>
                <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
              </div>
            ) : comparisonData ? (
              <div className="space-y-6">
                {/* Comparison Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">📊 Layer:</span>
                      <p className="text-gray-600">{getLayerDisplayName(comparisonData.image1.layer)}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">☁️ Cloud Coverage:</span>
                      <p className="text-gray-600">{comparisonData.cloud_percentage}% max</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">⏰ Downloaded:</span>
                      <p className="text-gray-600">{formatDownloadTime(comparisonData.download_time)}</p>
                    </div>
                  </div>
                </div>

                {/* Images Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image 1 - Earlier Date */}
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                      <h3 className="font-semibold text-blue-900">📅 Image 1 (Earlier)</h3>
                      <p className="text-blue-700 text-sm">{formatDate(comparisonData.image1.date)}</p>
                    </div>
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '1/1' }}>
                      {imageLoadErrors.image1 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p className="text-gray-500 text-center text-sm">Failed to load image</p>
                          <p className="text-gray-400 text-xs mt-1">{comparisonData.image1.filename}</p>
                        </div>
                      ) : (
                        <img
                          src={getImageUrl(comparisonData.image1.filename)}
                          alt={`Satellite image from ${comparisonData.image1.date}`}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError('image1')}
                          onLoad={() => setImageLoadErrors(prev => ({ ...prev, image1: false }))}
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      {comparisonData.image1.filename}
                    </div>
                  </div>

                  {/* Image 2 - Later Date */}
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                      <h3 className="font-semibold text-green-900">📅 Image 2 (Later)</h3>
                      <p className="text-green-700 text-sm">{formatDate(comparisonData.image2.date)}</p>
                    </div>
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '1/1' }}>
                      {imageLoadErrors.image2 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p className="text-gray-500 text-center text-sm">Failed to load image</p>
                          <p className="text-gray-400 text-xs mt-1">{comparisonData.image2.filename}</p>
                        </div>
                      ) : (
                        <img
                          src={getImageUrl(comparisonData.image2.filename)}
                          alt={`Satellite image from ${comparisonData.image2.date}`}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError('image2')}
                          onLoad={() => setImageLoadErrors(prev => ({ ...prev, image2: false }))}
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      {comparisonData.image2.filename}
                    </div>
                  </div>
                </div>

                {/* Analysis Tips */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">💡 Analysis Tips:</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Look for changes in vegetation patterns (green/brown variations)</li>
                    <li>• Identify new water bodies or changes in water levels</li>
                    <li>• Spot urban expansion or infrastructure changes</li>
                    <li>• Notice any deforestation or land use changes</li>
                    <li>• Compare seasonal variations between the two dates</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      // Download both images functionality could be added here
                      console.log('Download comparison images')
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    📥 Download Images
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-lg">No comparison data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}