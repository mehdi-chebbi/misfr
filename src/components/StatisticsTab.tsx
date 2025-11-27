'use client'

import { useState } from 'react'

interface StatisticsTabProps {
  onLoadStatistics: (params: {
    geometry: number[][]
    start_date: string
    end_date: string
    indices: string[]
  }) => void
  hasDrawnArea: boolean
  isLoading: boolean
  statisticsData: any
}

export default function StatisticsTab({
  onLoadStatistics,
  hasDrawnArea,
  isLoading,
  statisticsData
}: StatisticsTabProps) {
  const [selectedIndices, setSelectedIndices] = useState<string[]>(['NDVI'])
  const [selectedIndex, setSelectedIndex] = useState<string>('NDVI')
  const [startDate, setStartDate] = useState('2023-06-01')
  const [endDate, setEndDate] = useState('2023-08-31')

  // Available indices with descriptions
  const indices = [
    { 
      id: 'NDVI', 
      name: 'Normalized Difference Vegetation Index', 
      description: 'Measures vegetation health and density',
      color: '#22c55e' // green-500
    },
    { 
      id: 'NDWI', 
      name: 'Normalized Difference Water Index', 
      description: 'Detects water bodies and vegetation moisture',
      color: '#3b82f6' // blue-500
    },
    { 
      id: 'EVI', 
      name: 'Enhanced Vegetation Index', 
      description: 'Improved vegetation index with atmospheric correction',
      color: '#10b981' // emerald-500
    },
    { 
      id: 'NDSI', 
      name: 'Normalized Difference Snow Index', 
      description: 'Detects snow cover and snow melt',
      color: '#06b6d4' // cyan-500
    },
    { 
      id: 'NBR', 
      name: 'Normalized Burn Ratio', 
      description: 'Detects burn scars and vegetation stress',
      color: '#f97316' // orange-500
    },
    { 
      id: 'SAVI', 
      name: 'Soil Adjusted Vegetation Index', 
      description: 'Vegetation index adjusted for soil brightness',
      color: '#84cc16' // lime-500
    },
    { 
      id: 'LAI', 
      name: 'Leaf Area Index', 
      description: 'One-sided green leaf area per unit ground surface area',
      color: '#8b5cf6' // violet-500
    }
  ]

  const handleIndexChange = (indexId: string) => {
    setSelectedIndex(indexId)
  }

  const getIndexColor = (indexKey: string): string => {
    const colors: { [key: string]: string } = {
      'NDVI': '#22c55e',      // green-500
      'NDWI': '#3b82f6',     // blue-500
      'EVI': '#10b981',      // emerald-500
      'NDSI': '#06b6d4',      // cyan-500
      'NBR': '#f97316',      // orange-500
      'SAVI': '#84cc16',     // lime-500
      'LAI': '#8b5cf6'       // violet-500
    }
    return colors[indexKey] || '#6b7280' // gray-500 default
  }

  const handleLoadStatistics = () => {
    if (!hasDrawnArea) {
      alert('Please draw a polygon, rectangle, or circle on the map first')
      return
    }

    if (!startDate || !endDate) {
      alert('Please select both start and end dates')
      console.log('Date validation failed:', { startDate, endDate })
      return
    }

    if (!selectedIndex) {
      alert('Please select an index')
      return
    }

    // Get the drawn geometry from the map
    const mapCore = (window as any).mapCore
    if (!mapCore || !mapCore.getDrawnBounds) {
      alert('Unable to get map geometry. Please try drawing again.')
      return
    }

    const bounds = mapCore.getDrawnBounds()
    if (!bounds) {
      alert('No area drawn. Please draw an area on the map first.')
      return
    }

    // Convert bounds to polygon coordinates
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    const geometry = [
      [sw.lng, sw.lat],
      [ne.lng, sw.lat],
      [ne.lng, ne.lat],
      [sw.lng, ne.lat],
      [sw.lng, sw.lat]
    ]

    const requestData = {
      geometry,
      start_date: startDate,
      end_date: endDate,
      indices: [selectedIndex]  // Send single index as array
    }

    console.log('Sending request data:', requestData)
    console.log('Start date type:', typeof startDate, 'End date type:', typeof endDate)

    onLoadStatistics(requestData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <span className="text-2xl">📊</span>
          <span>Statistical Analysis</span>
        </h3>
        
        <div className="space-y-6">
          {/* Indices Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <span>🔬</span>
              <span>Select Index</span>
            </label>
            <select 
              value={selectedIndex}
              onChange={(e) => handleIndexChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            >
              {indices.map((index) => (
                <option key={index.id} value={index.id}>
                  {index.id} - {index.name}
                </option>
              ))}
            </select>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getIndexColor(selectedIndex) }}
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {indices.find(idx => idx.id === selectedIndex)?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {indices.find(idx => idx.id === selectedIndex)?.description}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <span>📅</span>
                <span>Start Date</span>
              </label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
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
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleLoadStatistics}
            disabled={!hasDrawnArea || !startDate || !endDate || !selectedIndex || isLoading}
            className={`w-full py-4 px-6 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-3 ${
              hasDrawnArea && startDate && endDate && selectedIndex && !isLoading
                ? 'nature-button text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>📈 Generate Time Series</span>
              </>
            )}
          </button>

          {/* Status Messages */}
          {!hasDrawnArea && (
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
                  <p className="font-semibold text-gray-800">Draw Area First</p>
                  <p className="text-sm text-gray-600 mt-1">Please draw a polygon, rectangle, or circle on the map to define your area of interest.</p>
                </div>
              </div>
            </div>
          )}

          {hasDrawnArea && !startDate && !endDate && (
            <div className="nature-card rounded-2xl p-5 border-l-4 border-yellow-500">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Select Date Range</p>
                  <p className="text-sm text-gray-600 mt-1">Choose start and end dates to define the time period for analysis.</p>
                </div>
              </div>
            </div>
          )}

          {hasDrawnArea && startDate && endDate && !selectedIndex && (
            <div className="nature-card rounded-2xl p-5 border-l-4 border-purple-500">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Select Indices</p>
                  <p className="text-sm text-gray-600 mt-1">Choose one or more spectral indices to analyze for your selected area and time period.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}