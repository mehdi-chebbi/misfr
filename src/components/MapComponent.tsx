'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import BaseMapTab from './BaseMapTab'
import SatelliteDataTab from './SatelliteDataTab'
import StatisticsTab from './StatisticsTab'
import TimeSeriesChart from './TimeSeriesChart'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
  const [showAIModal, setShowAIModal] = useState<boolean>(false)
  const [aiResponse, setAiResponse] = useState<string>('')
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false)
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [currentMessage, setCurrentMessage] = useState<string>('')
  const [isTyping, setIsTyping] = useState<boolean>(false)

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

  // Handle clear WMS layers
  const handleClearLayers = () => {
    const mapCore = (window as any).mapCore
    if (mapCore && mapCore.clearWmsLayers) {
      mapCore.clearWmsLayers()
      setImageMetadata(null)
      setHasDrawnArea(false)
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

  // Handle AI analysis with streaming
  const handleAnalyzeWithAI = async () => {
    const mapCore = (window as any).mapCore
    if (!mapCore) {
      alert('Map not initialized')
      return
    }

    setIsLoadingAI(true)
    setShowAIModal(true)
    setAiResponse('')

    try {
      // Collect real data from the UI
      const layerSelect = document.getElementById('layer-select') as HTMLSelectElement
      const startDateInput = document.getElementById('start-date') as HTMLInputElement
      const endDateInput = document.getElementById('end-date') as HTMLInputElement
      const cloudPercentageInput = document.getElementById('cloud-percentage') as HTMLInputElement
      
      let analysisContext = "Analyze the current satellite data and map view."
      
      // Build focused context if satellite data is loaded
      if (imageMetadata) {
        const cloudValue = cloudPercentageInput?.value || 'unknown'
        
        // Get the WMS URL that was used to load the satellite data
        const bounds = mapCore.getDrawnBounds ? mapCore.getDrawnBounds() : null
        if (!bounds) {
          setAiResponse('Please draw an area on the map first.')
          return
        }
        
        const sw = bounds.getSouthWest()
        const ne = bounds.getNorthEast()
        const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`
        
        const layer = layerSelect?.value || imageMetadata.layer
        const startDate = new Date(startDateInput?.value || imageMetadata.startDate)
        const endDate = new Date(endDateInput?.value || imageMetadata.endDate)
        
        const formattedStartTime = startDate.toISOString().split('.')[0] + 'Z'
        const formattedEndTime = endDate.toISOString().split('.')[0] + 'Z'
        
        // Recreate the WMS URL
        const wmsUrl = `https://sh.dataspace.copernicus.eu/ogc/wms/2e44e6fc-1f1c-4258-bd09-8a15c317f604?` +
          `SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=${layer}` +
          `&BBOX=${bbox}&CRS=EPSG:4326&WIDTH=2500&HEIGHT=2500&FORMAT=image/png` +
          `&TIME=${formattedStartTime}/${formattedEndTime}&MAXCC=${cloudValue}`

        console.log('Sending satellite image to AI for streaming analysis:', wmsUrl)

        // Call the streaming endpoint
        const response = await fetch('http://localhost:5000/api/vision/analyze_satellite_stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wms_url: wmsUrl,
            layer: imageMetadata.layer,
            date_range: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
            cloud_coverage: `${cloudValue}%`
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error('Response body is not readable')
        }

        let accumulatedResponse = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.type === 'chunk') {
                  setAiResponse(prev => prev + data.content)
                } else if (data.type === 'complete') {
                  // Don't add completion message, just stop loading
                  setIsLoadingAI(false)
                } else if (data.type === 'error') {
                  setAiResponse(prev => prev + `\n\n❌ Error: ${data.message}`)
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e)
              }
            }
          }
        }
        
      } else if (hasDrawnArea) {
        setAiResponse("Area drawn but no satellite data loaded yet. Please load satellite data first for analysis.")
      } else {
        setAiResponse("Please draw an area and load satellite data for analysis.")
      }
      
    } catch (error) {
      console.error('Error calling AI streaming API:', error)
      setAiResponse(prev => prev + '\n\n❌ Failed to connect to AI service. Please make sure Flask API is running on localhost:5000 and API key is configured.')
    } finally {
      setIsLoadingAI(false)
    }
  }

  // Handle sending follow-up messages
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isTyping) return

    const userMessage = currentMessage.trim()
    setCurrentMessage('')
    setIsTyping(true)

    // Add user message to history
    setConversationHistory(prev => [...prev, {
      role: 'user',
      content: userMessage
    }])

    try {
      // Call chat endpoint for follow-up
      const response = await fetch('http://localhost:5000/api/vision/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          // Include conversation history for context
          context: conversationHistory.slice(-3) // Last 3 messages for context
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setConversationHistory(prev => [...prev, {
          role: 'assistant',
          content: data.response
        }])
      } else {
        setConversationHistory(prev => [...prev, {
          role: 'assistant',
          content: `❌ Error: ${data.error}`
        }])
      }
    } catch (error) {
      console.error('Error sending follow-up message:', error)
      setConversationHistory(prev => [...prev, {
        role: 'assistant',
        content: '❌ Failed to send message. Please try again.'
      }])
    } finally {
      setIsTyping(false)
    }
  }

  // Handle Enter key in chat input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
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
              onClearLayers={handleClearLayers}
              hasDrawnArea={hasDrawnArea}
              hasLoadedData={!!imageMetadata}
              onAnalyzeWithAI={handleAnalyzeWithAI}
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

      {/* AI Analysis Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">AI Vision Analysis</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                  <span>🤖 Remote Sensing Analysis</span>
                  <span>🛰️ Environmental Intelligence</span>
                </div>
              </div>
              <button 
                onClick={() => setShowAIModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingAI && !aiResponse ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">🤖 AI is initializing...</p>
                    <p className="text-sm text-gray-500 mt-2">Starting satellite analysis</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                          {isLoadingAI ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b border-white"></div>
                          ) : (
                            <span className="text-white text-sm font-bold">AI</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                          <span>AI Response</span>
                          {isLoadingAI && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              🔄 Live Analysis
                            </span>
                          )}
                        </h4>
                        <div className="prose prose-sm max-w-none">
                          <div className="text-gray-700 leading-relaxed bg-white/60 rounded-lg p-4 border border-gray-200 relative">
                            {aiResponse ? (
                              <div className="markdown-content">
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                                    ul: ({children}) => <ul className="list-disc list-inside space-y-1 ml-4">{children}</ul>,
                                    ol: ({children}) => <ol className="list-decimal list-inside space-y-1 ml-4">{children}</ol>,
                                    li: ({children}) => <li className="text-gray-700">{children}</li>,
                                    p: ({children}) => <p className="mb-3 last:mb-0">{children}</p>,
                                    h1: ({children}) => <h1 className="text-xl font-bold text-gray-900 mb-3">{children}</h1>,
                                    h2: ({children}) => <h2 className="text-lg font-bold text-gray-900 mb-2">{children}</h2>,
                                    h3: ({children}) => <h3 className="text-base font-bold text-gray-900 mb-2">{children}</h3>,
                                    blockquote: ({children}) => (
                                      <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-600 my-3">
                                        {children}
                                      </blockquote>
                                    ),
                                    code: ({inline, children}) => 
                                      inline ? 
                                        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">{children}</code> :
                                        <code className="block bg-gray-100 p-3 rounded text-sm font-mono text-gray-800 overflow-x-auto my-3">{children}</code>,
                                    pre: ({children}) => <pre className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-800 overflow-x-auto my-3">{children}</pre>
                                  }}
                                >
                                  {aiResponse}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 text-gray-400">
                                <div className="animate-pulse">⏳</div>
                                <span>Waiting for AI response...</span>
                              </div>
                            )}
                            {isLoadingAI && aiResponse && (
                              <div className="absolute bottom-2 right-2">
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span>Streaming...</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h5 className="font-semibold text-blue-800 mb-2 flex items-center space-x-2">
                      <span>💡</span>
                      <span>AI Analysis Capabilities</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-gray-700">Vegetation Health Analysis</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-gray-700">Water Body Detection</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span className="text-gray-700">Geological Feature Mapping</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        <span className="text-gray-700">Spectral Index Interpretation</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Chat Interface */}
              {aiResponse && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                      <span>💬</span>
                      <span>Ask Follow-up Questions</span>
                    </h4>
                    
                    {/* Conversation History */}
                    <div className="space-y-3 max-h-60 overflow-y-auto mb-4 p-3 bg-gray-50 rounded-lg">
                      {conversationHistory.map((message, index) => (
                        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                            message.role === 'user' 
                              ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white' 
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {message.role === 'user' ? (
                              <p className="text-sm font-medium">{message.content}</p>
                            ) : (
                              <div className="text-sm">
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                                    ul: ({children}) => <ul className="list-disc list-inside space-y-1 ml-4">{children}</ul>,
                                    ol: ({children}) => <ol className="list-decimal list-inside space-y-1 ml-4">{children}</ol>,
                                    li: ({children}) => <li className="text-gray-700">{children}</li>,
                                    p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Chat Input */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a follow-up question..."
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-400"
                        disabled={isTyping}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!currentMessage.trim() || isTyping}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                      >
                        {isTyping ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9 18-9-18 9-2 0 0 9 2 9 20z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m12 19-9-2-9-18 9-18-9-2 0 0 9 2 9 20z" />
                            </svg>
                            <span>Send</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}