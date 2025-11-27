'use client'

import { useState, useEffect } from 'react'

interface ComparisonTabProps {
  onLoadComparison: (params: {
    layer: string
    date1: Date
    date2: Date
    cloudPercentage: number
  }) => void
  isLoading?: boolean
  hasDrawnArea?: boolean
}

export default function ComparisonTab({ onLoadComparison, isLoading = false, hasDrawnArea = false }: ComparisonTabProps) {
  const [layer, setLayer] = useState<string>('NDVI-L2A')
  const [date1, setDate1] = useState<string>('')
  const [date2, setDate2] = useState<string>('')
  const [cloudPercentage, setCloudPercentage] = useState<number>(20)

  const layers = [
    { value: 'NDVI-L2A', label: 'NDVI (Vegetation Health)' },
    { value: 'NDWI-L2A', label: 'NDWI (Water Bodies)' },
    { value: 'GEOLOGY', label: 'Geology' },
    { value: 'LAI_SAVI', label: 'LAI/SAVI' },
    { value: 'MOISTURE_INDEX', label: 'Moisture Index' }
  ]

  // Set default dates (30 days apart)
  useEffect(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)
    
    setDate2(thirtyDaysAgo.toISOString().split('T')[0])
    setDate1(sixtyDaysAgo.toISOString().split('T')[0])
  }, [])

  const handleLoadComparison = () => {
    if (!date1 || !date2) {
      alert('Please select both dates for comparison')
      return
    }

    if (!hasDrawnArea) {
      alert('Please draw an area on the map first')
      return
    }

    const d1 = new Date(date1)
    const d2 = new Date(date2)

    if (d1 >= d2) {
      alert('Date 1 must be earlier than Date 2')
      return
    }

    onLoadComparison({
      layer,
      date1: d1,
      date2: d2,
      cloudPercentage
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 m-4 max-w-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        📊 Temporal Comparison
      </h3>
      
      <div className="space-y-4">
        {/* Layer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Layer
          </label>
          <select
            id="comparison-layer-select"
            value={layer}
            onChange={(e) => setLayer(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {layers.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date 1 Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📅 Date 1 (Earlier)
          </label>
          <input
            type="date"
            id="comparison-date-1"
            value={date1}
            onChange={(e) => setDate1(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date 2 Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📅 Date 2 (Later)
          </label>
          <input
            type="date"
            id="comparison-date-2"
            value={date2}
            onChange={(e) => setDate2(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Cloud Coverage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ☁️ Cloud Coverage: {cloudPercentage}%
          </label>
          <input
            type="range"
            id="comparison-cloud-percentage"
            min="0"
            max="100"
            value={cloudPercentage}
            onChange={(e) => setCloudPercentage(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Load Button */}
        <button
          onClick={handleLoadComparison}
          disabled={isLoading || !hasDrawnArea}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isLoading || !hasDrawnArea
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Loading Comparison...
            </span>
          ) : (
            '🔄 Load Comparison Images'
          )}
        </button>

        {!hasDrawnArea && (
          <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
            ⚠️ Please draw an area on the map first to enable comparison
          </p>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
          <strong>💡 Tip:</strong> Select two different dates to see how the area has changed over time. 
          The images will be displayed side by side for easy comparison.
        </div>
      </div>
    </div>
  )
}