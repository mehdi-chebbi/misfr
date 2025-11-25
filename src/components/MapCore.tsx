'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet-draw'
import html2canvas from 'html2canvas'

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface MapCoreProps {
  className?: string
  currentBaseMap: string
  onBaseMapChange: (mapName: string) => void
  onDrawComplete: (bounds: L.LatLngBounds, layerType: 'polygon' | 'rectangle' | 'circle') => void
  onStatusUpdate: (status: string) => void
  onDrawCreated?: () => void
  onDrawCleared?: () => void
}

export default function MapCore({ 
  className = '', 
  currentBaseMap, 
  onBaseMapChange, 
  onDrawComplete, 
  onStatusUpdate,
  onDrawCreated,
  onDrawCleared
}: MapCoreProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null)
  const baseMaps = useRef<{ [key: string]: L.TileLayer }>({})

  // Initialize base maps
  useEffect(() => {
    baseMaps.current = {
      'NDVI': L.tileLayer.wms('https://sh.dataspace.copernicus.eu/ogc/wms/2e44e6fc-1f1c-4258-bd09-8a15c317f604', {
        layers: 'NDVI-L2A',
        format: 'image/png',
        transparent: true,
        attribution: 'Copernicus Data Space Ecosystem',
        version: '1.3.0',
        crs: L.CRS.EPSG3857,
        crossOrigin: true,
      }),
      'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        crossOrigin: true,
      }),
      'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri',
        crossOrigin: true,
      }),
      'Dark': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        attribution: '© CARTO',
        crossOrigin: true,
      }),
      'Light': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '© CARTO',
        crossOrigin: true,
      }),
      'Topographic': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap contributors',
        crossOrigin: true,
      }),
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    console.log('Initializing map...')
    
    // Initialize map
    const map = L.map(mapRef.current, {
      center: [31.76299759769429, 9.7998046875], // Center on Africa
      zoom: 5,
      zoomControl: false,
    })

    console.log('Map created:', map)

    mapInstanceRef.current = map

    // Add initial base layer
    const initialLayer = baseMaps.current[currentBaseMap]
    if (initialLayer) {
      initialLayer.addTo(map)
      console.log('Base layer added:', currentBaseMap)
    }

    // Add zoom control
    L.control.zoom({ position: 'topright' }).addTo(map)
    console.log('Zoom control added')

    // Initialize drawing layer
    drawnItemsRef.current = new L.FeatureGroup()
    map.addLayer(drawnItemsRef.current)
    console.log('Drawing layer initialized')

    // Add draw control
    try {
      const drawControl = new L.Control.Draw({
        position: 'topright',
        edit: { featureGroup: drawnItemsRef.current },
        draw: {
          polygon: {
            shapeOptions: {
              color: '#3b82f6',
              weight: 2,
              fillOpacity: 0.2
            }
          },
          rectangle: {
            shapeOptions: {
              color: '#3b82f6',
              weight: 2,
              fillOpacity: 0.2
            }
          },
          circle: {
            shapeOptions: {
              color: '#3b82f6',
              weight: 2,
              fillOpacity: 0.2
            }
          },
          marker: false,
          polyline: false,
          circlemarker: false,
        },
      })
      
      console.log('Draw control created, adding to map...')
      map.addControl(drawControl)
      console.log('Draw control added successfully')
    } catch (error) {
      console.error('Error adding draw control:', error)
    }

    // Add scale control
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map)

    // Handle draw events
    map.on(L.Draw.Event.CREATED, (e: any) => {
      console.log('Draw event created:', e)
      const layer = e.layer
      if (drawnItemsRef.current) {
        drawnItemsRef.current.clearLayers()
        drawnItemsRef.current.addLayer(layer)
        
        let layerType: 'polygon' | 'rectangle' | 'circle' = 'polygon'
        if (layer instanceof L.Polygon) {
          layerType = 'polygon'
        } else if (layer instanceof L.Rectangle) {
          layerType = 'rectangle'
        } else if (layer instanceof L.Circle) {
          layerType = 'circle'
        }
        
        const bounds = layer.getBounds()
        map.fitBounds(bounds)
        onDrawComplete(bounds, layerType)
        onDrawCreated?.()
        console.log(`${layerType} drawn, bounds:`, bounds)
      }
    })

    // Handle edit events
    map.on(L.Draw.Event.EDITED, (e: any) => {
      console.log('Draw event edited:', e)
      const layers = e.layers
      layers.eachLayer((layer: any) => {
        if (layer instanceof L.Polygon || layer instanceof L.Rectangle || layer instanceof L.Circle) {
          const bounds = layer.getBounds()
          console.log('Shape edited, new bounds:', bounds)
        }
      })
    })

    // Handle delete events
    map.on(L.Draw.Event.DELETED, (e: any) => {
      console.log('Draw event deleted:', e)
      onDrawCleared?.()
    })

    // Mouse move and zoom events for status
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      onStatusUpdate(`${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)} | z ${map.getZoom()}`)
    })

    map.on('zoomend', () => {
      const center = map.getCenter()
      onStatusUpdate(`${center.lat.toFixed(5)}, ${center.lng.toFixed(5)} | z ${map.getZoom()}`)
    })

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Handle base map change
  useEffect(() => {
    if (!mapInstanceRef.current || !baseMaps.current[currentBaseMap]) return

    // Remove current base layer
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer && Object.values(baseMaps.current).includes(layer)) {
        mapInstanceRef.current?.removeLayer(layer)
      }
    })

    // Add new base layer
    baseMaps.current[currentBaseMap].addTo(mapInstanceRef.current)
  }, [currentBaseMap])

  // Drawing control functions
  const enablePolygonDrawing = () => {
    if (mapInstanceRef.current) {
      const drawControl = new (L.Draw as any).Polygon(mapInstanceRef.current, {
        shapeOptions: {
          color: '#3b82f6',
          weight: 2,
          fillOpacity: 0.2
        }
      })
      drawControl.enable()
    }
  }

  const enableRectangleDrawing = () => {
    if (mapInstanceRef.current) {
      const drawControl = new (L.Draw as any).Rectangle(mapInstanceRef.current, {
        shapeOptions: {
          color: '#3b82f6',
          weight: 2,
          fillOpacity: 0.2
        }
      })
      drawControl.enable()
    }
  }

  const clearAllDrawings = () => {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers()
      onDrawCleared?.()
      console.log('All drawings cleared')
    }
  }

  const addImageOverlay = (imageUrl: string, bounds: L.LatLngBounds) => {
    if (mapInstanceRef.current) {
      const imageOverlay = L.imageOverlay(imageUrl, bounds, {
        opacity: 1,
        crossOrigin: true,
      })
      imageOverlay.addTo(mapInstanceRef.current)
    }
  }

  const getDrawnBounds = (): L.LatLngBounds | null => {
    if (drawnItemsRef.current) {
      const layers = drawnItemsRef.current.getLayers()
      if (layers.length > 0) {
        const layer = layers[0] as any
        if (layer.getBounds) {
          return layer.getBounds()
        }
      }
    }
    return null
  }

  // Download map as image
  const downloadMapImage = async () => {
    if (!mapInstanceRef.current) return

    try {
      // Get the map container
      const mapContainer = mapInstanceRef.current.getContainer()
      
      // Temporarily hide controls we don't want in the screenshot
      const controlsToHide = mapContainer.querySelectorAll('.leaflet-control-container, .download-button')
      controlsToHide.forEach(control => {
        (control as HTMLElement).style.display = 'none'
      })

      // Temporarily hide drawn shapes (polygons, rectangles, circles) but keep WMS layers
      const drawnShapes = mapContainer.querySelectorAll('.leaflet-pane.leaflet-overlay-pane svg path, .leaflet-pane.leaflet-overlay-pane g, .leaflet-draw-layer svg, .leaflet-draw-layer g, .leaflet-marker-icon')
      drawnShapes.forEach(shape => {
        (shape as HTMLElement).style.display = 'none'
      })

      // Wait a bit for any pending renders
      await new Promise(resolve => setTimeout(resolve, 100))

      // Use html2canvas to capture the map
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: mapContainer.offsetWidth,
        height: mapContainer.offsetHeight
      })

      // Restore the hidden controls and shapes
      controlsToHide.forEach(control => {
        (control as HTMLElement).style.display = ''
      })
      drawnShapes.forEach(shape => {
        (shape as HTMLElement).style.display = ''
      })

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          // Create download link
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `misfr-map-${new Date().toISOString().split('T')[0]}.png`
          link.style.display = 'none'
          
          // Trigger download
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // Clean up
          URL.revokeObjectURL(url)
        }
      }, 'image/png')

    } catch (error) {
      console.error('Error downloading map image:', error)
      
      // Fallback to browser screenshot instructions
      alert('Unable to capture map automatically. Please use your browser\'s screenshot function:\n\n' +
            '• Chrome/Edge: Ctrl+Shift+S\n' +
            '• Firefox: Right-click → "Take Screenshot"\n' +
            '• Safari: Cmd+Shift+4\n\n' +
            'Or press Print Screen and paste into an image editor.')
    }
  }

  // Download WMS layer as TIFF
  const downloadTiffImage = async () => {
    if (!mapInstanceRef.current) return

    try {
      // Get current drawn bounds
      const bounds = getDrawnBounds()
      if (!bounds) {
        alert('Please draw a polygon, rectangle, or circle on map first')
        return
      }

      // Get the current WMS layer URL from image overlays
      const mapContainer = mapInstanceRef.current.getContainer()
      const imageOverlays = mapContainer.querySelectorAll('.leaflet-image-layer')
      
      if (imageOverlays.length === 0) {
        alert('Please load satellite data first by selecting a layer and clicking "Load Satellite Data"')
        return
      }

      // Find WMS image URL
      let wmsUrl = ''
      imageOverlays.forEach((overlay) => {
        const img = overlay as HTMLImageElement
        if (img.src && img.src.includes('copernicus.eu')) {
          wmsUrl = img.src
        }
      })

      if (!wmsUrl) {
        alert('No satellite data found. Please load satellite data first.')
        return
      }

      // Convert PNG URL to TIFF URL by changing the format parameter
      const tiffUrl = wmsUrl.replace('FORMAT=image/png', 'FORMAT=image/tiff')

      // Download TIFF image
      const response = await fetch(tiffUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `misfr-satellite-data-${new Date().toISOString().split('T')[0]}.tiff`
      link.style.display = 'none'
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error downloading TIFF image:', error)
      alert('Failed to download TIFF image. Please make sure you have loaded satellite data first.\n\nError: ' + (error as Error).message)
    }
  }

  // Expose drawing functions to parent via ref
  useEffect(() => {
    const mapCore = {
      enablePolygonDrawing,
      enableRectangleDrawing,
      clearAllDrawings,
      addImageOverlay,
      getDrawnBounds,
      downloadMapImage,
      downloadTiffImage
    }
    
    // Store on window for parent access (simple approach for this refactor)
    ;(window as any).mapCore = mapCore
  }, [])

  return (
    <div ref={mapRef} className={`h-full w-full ${className}`} />
  )
}