'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js/auto'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface TimeSeriesChartProps {
  data: any
  isLoading: boolean
}

export default function TimeSeriesChart({ data, isLoading }: TimeSeriesChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<any>(null)

  useEffect(() => {
    if (!canvasRef.current || !data || !data.success) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    // Prepare datasets for each statistical measure of each index
    const datasets: any[] = []
    
    Object.entries(data.indices).forEach(([indexKey, indexData]: [string, any]) => {
      // Create dataset for each statistical measure with completely different colors
      const stats = [
        { key: 'mean', label: `${indexKey} - Mean`, borderDash: [], pointRadius: 4 },
        { key: 'min', label: `${indexKey} - Min`, borderDash: [5, 5], pointRadius: 3 },
        { key: 'max', label: `${indexKey} - Max`, borderDash: [10, 5], pointRadius: 3 },
        { key: 'stdDev', label: `${indexKey} - Std Dev`, borderDash: [2, 2], pointRadius: 3 }
      ]
      
      stats.forEach((stat) => {
        datasets.push({
          label: stat.label,
          data: indexData.data.map((point: any) => ({
            x: point.date,
            y: point[stat.key]
          })).filter((point: any) => point.y !== null),
          borderColor: getStatColor(stat.key, indexKey),
          backgroundColor: getStatColor(stat.key, indexKey, 0.1),
          borderWidth: 2,
          pointRadius: stat.pointRadius,
          pointHoverRadius: stat.pointRadius + 2,
          tension: 0.1,
          fill: false,
          borderDash: stat.borderDash,
        })
      })
    })

    // Get all unique dates from all indices
    const allDates = new Set<string>()
    Object.values(data.indices).forEach((indexData: any) => {
      indexData.data.forEach((point: any) => {
        allDates.add(point.date)
      })
    })

    const sortedDates = Array.from(allDates).sort()

    chartRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: sortedDates,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text: `Time Series Analysis - ${Object.keys(data.indices).length} index × 4 statistical measures`,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#ddd',
            borderWidth: 1,
            displayColors: true,
            callbacks: {
              title: function(context) {
                return `Date: ${context[0].label}`
              },
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(4)}`
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date'
            },
            ticks: {
              maxTicksLimit: 10,
              autoSkip: true,
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Index Value'
            },
            ticks: {
              callback: function(value) {
                return typeof value === 'number' ? value.toFixed(2) : value
              }
            }
          }
        }
      }
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [data])

  const getStatColor = (statKey: string, indexKey: string, alpha: number = 1): string => {
    // Use completely different colors for each statistical measure
    const statColors: { [key: string]: { [index: string]: string } } = {
      'mean': {
        'NDVI': `rgba(34, 197, 94, ${alpha})`,      // green-500
        'NDWI': `rgba(59, 130, 246, ${alpha})`,     // blue-500
        'EVI': `rgba(16, 185, 129, ${alpha})`,      // emerald-500
        'NDSI': `rgba(6, 182, 212, ${alpha})`,      // cyan-500
        'NBR': `rgba(249, 115, 22, ${alpha})`,      // orange-500
        'SAVI': `rgba(132, 204, 22, ${alpha})`,     // lime-500
        'LAI': `rgba(139, 92, 246, ${alpha})`       // violet-500
      },
      'min': {
        'NDVI': `rgba(239, 68, 68, ${alpha})`,      // red-500
        'NDWI': `rgba(236, 72, 153, ${alpha})`,     // pink-500
        'EVI': `rgba(220, 38, 38, ${alpha})`,       // red-600
        'NDSI': `rgba(219, 39, 119, ${alpha})`,     // pink-600
        'NBR': `rgba(185, 28, 28, ${alpha})`,       // red-700
        'SAVI': `rgba(202, 138, 4, ${alpha})`,      // amber-600
        'LAI': `rgba(147, 51, 234, ${alpha})`       // purple-600
      },
      'max': {
        'NDVI': `rgba(59, 130, 246, ${alpha})`,     // blue-500
        'NDWI': `rgba(99, 102, 241, ${alpha})`,     // indigo-500
        'EVI': `rgba(37, 99, 235, ${alpha})`,       // blue-600
        'NDSI': `rgba(79, 70, 229, ${alpha})`,      // indigo-600
        'NBR': `rgba(29, 78, 216, ${alpha})`,       // blue-700
        'SAVI': `rgba(14, 165, 233, ${alpha})`,     // sky-500
        'LAI': `rgba(6, 182, 212, ${alpha})`       // cyan-500
      },
      'stdDev': {
        'NDVI': `rgba(168, 85, 247, ${alpha})`,     // purple-500
        'NDWI': `rgba(217, 70, 239, ${alpha})`,     // fuchsia-500
        'EVI': `rgba(147, 51, 234, ${alpha})`,      // purple-600
        'NDSI': `rgba(192, 38, 211, ${alpha})`,     // fuchsia-600
        'NBR': `rgba(126, 34, 206, ${alpha})`,      // purple-700
        'SAVI': `rgba(245, 158, 11, ${alpha})`,     // amber-500
        'LAI': `rgba(251, 146, 60, ${alpha})`       // orange-400
      }
    }
    
    return statColors[statKey]?.[indexKey] || `rgba(107, 114, 128, ${alpha})` // gray-500 default
  }

  if (isLoading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing time series data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data || !data.success) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-600">No data to display</p>
            <p className="text-sm text-gray-500 mt-2">Select indices and date range, then click "Generate Time Series"</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Time Series Results</h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span>📊 {Object.keys(data.indices).length} indices analyzed</span>
          <span>📈 4 statistical measures each (Mean, Min, Max, Std Dev)</span>
          <span>📅 {data.date_range.start} to {data.date_range.end}</span>
          <span>🛰️ {data.total_images} unique dates</span>
          {data.aggregation_info && (
            <span className="text-green-600 font-medium">✅ {data.aggregation_info}</span>
          )}
        </div>
      </div>
      
      <div className="relative h-96">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}