'use client'

interface BaseMapTabProps {
  currentBaseMap: string
  onBaseMapChange: (mapName: string) => void
}

export default function BaseMapTab({
  currentBaseMap,
  onBaseMapChange
}: BaseMapTabProps) {
  const baseMaps = [
    { id: 'OpenStreetMap', name: 'Street Map', icon: '🗺️', color: 'from-gray-600 to-gray-700' },
    { id: 'Satellite', name: 'Satellite', icon: '🛰️', color: 'from-blue-600 to-indigo-700' },
    { id: 'Dark', name: 'Dark Mode', icon: '🌙', color: 'from-gray-800 to-black' },
    { id: 'Light', name: 'Light Mode', icon: '☀️', color: 'from-yellow-400 to-orange-400' },
    { id: 'Topographic', name: 'Topographic', icon: '⛰️', color: 'from-green-700 to-emerald-800' },
    { id: 'NDVI', name: 'NDVI View', icon: '🌿', color: 'from-green-600 to-emerald-700' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <span className="text-2xl">🗺️</span>
          <span>Choose Base Map</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {baseMaps.map((map) => (
            <button
              key={map.id}
              onClick={() => onBaseMapChange(map.id)}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-105 ${
                currentBaseMap === map.id
                  ? 'border-green-500 shadow-lg nature-card'
                  : 'border-gray-200 hover:border-green-300 hover:shadow-md bg-white/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`text-3xl group-hover:scale-110 transition-transform duration-300 ${
                  currentBaseMap === map.id ? 'animate-pulse' : ''
                }`}>
                  {map.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{map.name}</div>
                  <div className="text-xs text-gray-500">{map.id}</div>
                </div>
                {currentBaseMap === map.id && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}