'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import BaseMapTab from './BaseMapTab'
import SatelliteDataTab from './SatelliteDataTab'
import StatisticsTab from './StatisticsTab'
import TimeSeriesChart from './TimeSeriesChart'

// Dynamically import map core to avoid SSR issues
const MapCore = dynamic(() => import('./MapCore'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

interface MapProps {
  className?: string
}

export default function MapComponent({ className = '' }: MapProps) {
  const [currentBaseMap, setCurrentBaseMap] = useState<string>('OpenStreetMap')
  const [activeTab, setActiveTab] = useState<'basemap' | 'wms' | 'statistics'>('basemap')
  const [statusText, setStatusText] = useState<string>('')
  const [imageMetadata, setImageMetadata] = useState<{
    areaName: string
    startDate: string
    endDate: string
    layer: string
    isVisible: boolean
  } | null>(null)
  const [hasDrawnArea, setHasDrawnArea] = useState<boolean>(false)
  const [isLoadingStatistics, setIsLoadingStatistics] = useState<boolean>(false)
  const [statisticsData, setStatisticsData] = useState<any>(null)
  const [showStatisticsModal, setShowStatisticsModal] = useState<boolean>(false)

  // Handle base map change
  const handleBaseMapChange = (mapName: string) => {
    setCurrentBaseMap(mapName)
  }

  // Handle drawing completion
  const handleDrawComplete = (bounds: any, layerType: 'polygon' | 'rectangle' | 'circle') => {
    setHasDrawnArea(true)
    console.log('Draw completed:', { bounds, layerType })
  }

  // Handle status updates
  const handleStatusUpdate = (status: string) => {
    setStatusText(status)
  }

  // Handle drawing tools
  const handleDrawPolygon = () => {
    const mapCore = (window as any).mapCore
    if (mapCore && mapCore.enablePolygonDrawing) {
      mapCore.enablePolygonDrawing()
    }
  }

  const handleDrawRectangle = () => {
    const mapCore = (window as any).mapCore
    if (mapCore && mapCore.enableRectangleDrawing) {
      mapCore.enableRectangleDrawing()
    }
  }

  const handleClearAll = () => {
    const mapCore = (window as any).mapCore
    if (mapCore && mapCore.clearAllDrawings) {
      mapCore.clearAllDrawings()
      setHasDrawnArea(false)
      setImageMetadata(null)
    }
  }

  // Handle download image
  const handleDownloadImage = () => {
    const mapCore = (window as any).mapCore
    if (mapCore && mapCore.downloadMapImage) {
      mapCore.downloadMapImage()
    }
  }

  // Handle download TIFF image
  const handleDownloadTiff = () => {
    const mapCore = (window as any).mapCore
    if (mapCore && mapCore.downloadTiffImage) {
      mapCore.downloadTiffImage()
    }
  }

  // Handle WMS layer loading
  const handleLoadWmsLayer = async (params: {
    layer: string
    startDate: Date
    endDate: Date
    cloudPercentage: number
  }) => {
    const mapCore = (window as any).mapCore
    if (!mapCore || !mapCore.getDrawnBounds) return

    const bounds = mapCore.getDrawnBounds()
    if (!bounds) {
      alert('Please draw a polygon first')
      return
    }
    
    const formattedStartTime = params.startDate.toISOString().split('.')[0] + 'Z'
    const formattedEndTime = params.endDate.toISOString().split('.')[0] + 'Z'
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`

    const imageUrl = `https://sh.dataspace.copernicus.eu/ogc/wms/2e44e6fc-1f1c-4258-bd09-8a15c317f604?` +
      `SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=${params.layer}` +
      `&BBOX=${bbox}&CRS=EPSG:4326&WIDTH=2500&HEIGHT=2500&FORMAT=image/png` +
      `&TIME=${formattedStartTime}/${formattedEndTime}&MAXCC=${params.cloudPercentage}`

    // Add image overlay to map
    if (mapCore.addImageOverlay) {
      mapCore.addImageOverlay(imageUrl, bounds)
    }

    // Set metadata
    setImageMetadata({
      areaName: 'Selected Area',
      startDate: params.startDate.toLocaleDateString(),
      endDate: params.endDate.toLocaleDateString(),
      layer: params.layer.replace('-L2A', '').replace('_', ' '),
      isVisible: true
    })

    console.log('WMS Image URL:', imageUrl)
  }

  // Handle draw events
  const handleDrawCreated = () => {
    setHasDrawnArea(true)
  }

  const handleDrawCleared = () => {
    setHasDrawnArea(false)
    setImageMetadata(null)
    setStatisticsData(null)
  }

  // Handle statistics loading
  const handleLoadStatistics = async (params: {
    geometry: number[][]
    start_date: string
    end_date: string
    indices: string[]
  }) => {
    console.log('handleLoadStatistics received params:', params)
    console.log('Params type check:', {
      geometry: Array.isArray(params.geometry),
      start_date: typeof params.start_date,
      end_date: typeof params.end_date,
      indices: Array.isArray(params.indices)
    })

    setIsLoadingStatistics(true)
    setStatisticsData(null)

    try {
      const response = await fetch('http://localhost:5000/api/time_series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      })

      const data = await response.json()
      
      if (data.success) {
        setStatisticsData(data)
        setShowStatisticsModal(true)
        console.log('Statistics data loaded:', data)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
      alert('Failed to load statistics data. Please make sure the Flask API is running on localhost:5000')
    } finally {
      setIsLoadingStatistics(false)
    }
  }

  return (
    <div className={`relative h-screen w-full overflow-hidden ${className}`}>
      {/* Map container */}
      <MapCore
        currentBaseMap={currentBaseMap}
        onBaseMapChange={handleBaseMapChange}
        onDrawComplete={handleDrawComplete}
        onStatusUpdate={handleStatusUpdate}
        onDrawCreated={handleDrawCreated}
        onDrawCleared={handleDrawCleared}
      />
      
      {/* Status text */}
      {statusText && (
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
          {statusText}
        </div>
      )}

      {/* Modern Sidebar */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl z-[1000] w-96 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('basemap')}
            className={`flex-1 px-4 py-4 text-sm font-semibold transition-all duration-200 ${
              activeTab === 'basemap' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>Base Map</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('wms')}
            className={`flex-1 px-4 py-4 text-sm font-semibold transition-all duration-200 ${
              activeTab === 'wms' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <span>Satellite Data</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`flex-1 px-4 py-4 text-sm font-semibold transition-all duration-200 ${
              activeTab === 'statistics' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Statistics</span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'basemap' ? (
            <BaseMapTab
              currentBaseMap={currentBaseMap}
              onBaseMapChange={handleBaseMapChange}
            />
          ) : activeTab === 'wms' ? (
            <SatelliteDataTab
              onLoadWmsLayer={handleLoadWmsLayer}
              onDownloadImage={handleDownloadImage}
              onDownloadTiff={handleDownloadTiff}
              hasDrawnArea={hasDrawnArea}
              hasLoadedData={!!imageMetadata}
            />
          ) : (
            <StatisticsTab
              onLoadStatistics={handleLoadStatistics}
              hasDrawnArea={hasDrawnArea}
              isLoading={isLoadingStatistics}
              statisticsData={statisticsData}
            />
          )}
        </div>
      </div>

      {/* Image metadata overlay */}
      {imageMetadata && imageMetadata.isVisible && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl z-[1000] w-80 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{imageMetadata.areaName}</h3>
                  <p className="text-sm text-gray-500">Satellite Data Loaded</p>
                </div>
              </div>
              <button 
                onClick={() => setImageMetadata(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Data Layer</span>
                <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                  {imageMetadata.layer}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Date Range</span>
                <span className="text-sm text-gray-900">
                  {imageMetadata.startDate} - {imageMetadata.endDate}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-600">Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Series Chart Modal */}
      {showStatisticsModal && statisticsData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Statistical Analysis Results</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                  <span>📊 {Object.keys(statisticsData.indices).length} index analyzed</span>
                  <span>📅 {statisticsData.date_range.start} to {statisticsData.date_range.end}</span>
                  <span>🛰️ {statisticsData.total_images} unique dates</span>
                  {statisticsData.aggregation_info && (
                    <span className="text-green-600 font-medium">✅ {statisticsData.aggregation_info}</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setShowStatisticsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="h-[500px]">
                <TimeSeriesChart data={statisticsData} isLoading={false} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}