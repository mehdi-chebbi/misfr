'use client'

import { useState } from 'react'

interface CompareTabProps {
  onLoadComparison: (params: {
    date1: Date
    date2: Date
    layer: string
    cloudPercentage: number
  }) => void
  hasDrawnArea: boolean
  isLoading?: boolean
}

export default function CompareTab({ onLoadComparison, hasDrawnArea, isLoading = false }: CompareTabProps) {
  const [date1, setDate1] = useState<string>('')
  const [date2, setDate2] = useState<string>('')
  const [layer, setLayer] = useState<string>('NDVI-L2A')
  const [cloudPercentage, setCloudPercentage] = useState<number>(20)

  const handleLoadComparison = () => {
    if (!date1 || !date2) {
      alert('Please select both dates for comparison')
      return
    }

    if (!hasDrawnArea) {
      alert('Please draw an area on the map first')
      return
    }

    const comparisonDate1 = new Date(date1)
    const comparisonDate2 = new Date(date2)

    // Validate that date2 is after date1
    if (comparisonDate2 <= comparisonDate1) {
      alert('Second date must be after the first date')
      return
    }

    onLoadComparison({
      date1: comparisonDate1,
      date2: comparisonDate2,
      layer,
      cloudPercentage
    })
  }

  const layers = [
    { value: 'NDVI-L2A', label: 'NDVI (Vegetation Health)' },
    { value: 'NDWI-L2A', label: 'NDWI (Water Bodies)' },
    { value: 'TRUE-COLOR-S2L2A', label: 'True Color (Natural View)' },
    { value: 'FALSE-COLOR-S2L2A', label: 'False Color (Vegetation)' },
    { value: 'MOISTURE-INDEX', label: 'Moisture Index' },
    { value: 'GEOLOGY', label: 'Geological Features' }
  ]

  // Set default dates (30 days apart)
  useState(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)
    
    setDate2(thirtyDaysAgo.toISOString().split('T')[0])
    setDate1(sixtyDaysAgo.toISOString().split('T')[0])
  })

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">🔄 Temporal Comparison</h3>
        <p className="text-gray-600">Compare satellite imagery from two different dates to analyze changes over time</p>
      </div>

      {/* Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📅 First Date (Earlier)
          </label>
          <input
            type="date"
            id="compare-date-1"
            value={date1}
            onChange={(e) => setDate1(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📅 Second Date (Later)
          </label>
          <input
            type="date"
            id="compare-date-2"
            value={date2}
            onChange={(e) => setDate2(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Layer Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🛰️ Data Layer
        </label>
        <select
          id="compare-layer-select"
          value={layer}
          onChange={(e) => setLayer(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          {layers.map((layerOption) => (
            <option key={layerOption.value} value={layerOption.value}>
              {layerOption.label}
            </option>
          ))}
        </select>
      </div>

      {/* Cloud Coverage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ☁️ Maximum Cloud Coverage: {cloudPercentage}%
        </label>
        <input
          type="range"
          id="compare-cloud-percentage"
          min="0"
          max="100"
          value={cloudPercentage}
          onChange={(e) => setCloudPercentage(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0% (Clear)</span>
          <span>50% (Moderate)</span>
          <span>100% (All)</span>
        </div>
      </div>

      {/* Status Indicator */}
      {!hasDrawnArea && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Please draw an area on the map first before loading comparison data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Load Button */}
      <button
        onClick={handleLoadComparison}
        disabled={isLoading || !hasDrawnArea || !date1 || !date2}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Loading Comparison...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Load Comparison Images
          </div>
        )}
      </button>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">📋 How to Use:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Draw an area on the map to define your region of interest</li>
          <li>Select two different dates (second date must be later than first)</li>
          <li>Choose the data layer you want to compare</li>
          <li>Set maximum cloud coverage percentage</li>
          <li>Click "Load Comparison Images" to see side-by-side analysis</li>
        </ol>
      </div>
    </div>
  )
}