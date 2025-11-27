'use client'

import { useState } from 'react'

interface SatelliteDataTabProps {
  onLoadWmsLayer: (params: {
    layer: string
    startDate: Date
    endDate: Date
    cloudPercentage: number
  }) => void
  onDownloadImage: () => void
  onDownloadTiff: () => void
  onClearLayers: () => void
  hasDrawnArea: boolean
  hasLoadedData: boolean
  onAnalyzeWithAI?: () => void
}

export default function SatelliteDataTab({
  onLoadWmsLayer,
  onDownloadImage,
  onDownloadTiff,
  onClearLayers,
  hasDrawnArea,
  hasLoadedData,
  onAnalyzeWithAI
}: SatelliteDataTabProps) {
  const [cloudPercentage, setCloudPercentage] = useState(25)

  const handleLoadWmsLayer = () => {
    const layerSelect = document.getElementById('layer-select') as HTMLSelectElement
    const startDateInput = document.getElementById('start-date') as HTMLInputElement
    const endDateInput = document.getElementById('end-date') as HTMLInputElement

    const layer = layerSelect.value
    const startDate = new Date(startDateInput.value)
    const endDate = new Date(endDateInput.value)

    if (!startDate || !endDate) {
      alert('Please select both start and end dates')
      return
    }

    if (!hasDrawnArea) {
      alert('Please draw a polygon, rectangle, or circle on the map first')
      return
    }

    onLoadWmsLayer({ layer, startDate, endDate, cloudPercentage })
  }

  const dataLayers = [
    { value: 'NDVI-L2A', label: '🌿 NDVI - Vegetation Index', description: 'Monitor plant health and growth' },
    { value: 'GEOLOGY', label: '⛰️ Geology - Geological Data', description: 'Analyze rock and soil formations' },
    { value: 'LAI_SAVI', label: '🍃 LAI/SAVI - Leaf Area Index', description: 'Measure vegetation density' },
    { value: 'MOISTURE_INDEX', label: '💧 Moisture Index - Soil Moisture', description: 'Track water content in soil' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <span className="text-2xl">🛰️</span>
          <span>Load Satellite Data</span>
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <span>📊</span>
              <span>Data Layer</span>
            </label>
            <select id="layer-select" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm">
              {dataLayers.map((layer) => (
                <option key={layer.value} value={layer.value}>
                  {layer.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2 ml-2">
              {dataLayers.find(l => l.value === document.getElementById('layer-select')?.value)?.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <span>📅</span>
                <span>Start Date</span>
              </label>
              <input 
                type="date" 
                id="start-date"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <span>📅</span>
                <span>End Date</span>
              </label>
              <input 
                type="date" 
                id="end-date"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <span>☁️</span>
              <span>Cloud Coverage: <span id="cloud-value" className="text-green-600 font-bold">{cloudPercentage}</span>%</span>
            </label>
            <div className="relative">
              <input 
                type="range" 
                id="cloud-percentage"
                min="0" 
                max="100" 
                value={cloudPercentage}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                onInput={(e) => {
                  setCloudPercentage(parseInt(e.currentTarget.value))
                  document.getElementById('cloud-value')!.textContent = e.currentTarget.value
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span className="flex items-center space-x-1">
                  <span>☀️</span>
                  <span>Clear</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>☁️</span>
                  <span>Cloudy</span>
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleLoadWmsLayer}
              disabled={!hasDrawnArea}
              className={`w-full py-4 px-6 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-3 ${
                hasDrawnArea
                  ? 'nature-button text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span>{hasDrawnArea ? '🌍 Load Satellite Data' : '📍 Draw Area First'}</span>
            </button>

            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={onDownloadImage}
                disabled={!hasLoadedData}
                className={`py-4 px-4 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2 ${
                  hasLoadedData
                    ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white hover:from-emerald-700 hover:to-green-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-xs">{hasLoadedData ? '📸 PNG' : '📊 Load'}</span>
              </button>

              <button
                onClick={onDownloadTiff}
                disabled={!hasLoadedData}
                className={`py-4 px-4 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2 ${
                  hasLoadedData
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">{hasLoadedData ? '🗂️ TIFF' : '📊 Load'}</span>
              </button>

              <button
                onClick={onClearLayers}
                disabled={!hasLoadedData}
                className={`py-4 px-4 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2 ${
                  hasLoadedData
                    ? 'bg-gradient-to-r from-orange-600 to-red-700 text-white hover:from-orange-700 hover:to-red-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-xs">{hasLoadedData ? '🧹 Clear All' : '📊 Load'}</span>
              </button>

              <button
                onClick={onAnalyzeWithAI}
                className={`py-4 px-4 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2 ${
                  hasDrawnArea || hasLoadedData
                    ? 'bg-gradient-to-r from-purple-600 to-pink-700 text-white hover:from-purple-700 hover:to-pink-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={hasLoadedData ? "🤖 AI will analyze the actual satellite image" : hasDrawnArea ? "📍 Load satellite data first" : "📍 Draw an area first"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">{hasDrawnArea || hasLoadedData ? '🤖 AI Vision' : '📍 Draw Area'}</span>
              </button>
            </div>
          </div>

          {hasDrawnArea && !hasLoadedData && (
            <div className="nature-card rounded-2xl p-5 border-l-4 border-blue-500">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Ready for Analysis</p>
                  <p className="text-sm text-gray-600 mt-1">Great! Now select a data layer, date range, and click "Load Satellite Data" to visualize environmental information.</p>
                </div>
              </div>
            </div>
          )}

          {hasLoadedData && (
            <div className="nature-card rounded-2xl p-5 border-l-4 border-green-500">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center animate-pulse">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Data Loaded Successfully!</p>
                  <p className="text-sm text-gray-600 mt-1">Satellite data is displayed. AI can now analyze the actual imagery with 🤖 AI Vision button.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}