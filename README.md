# New App - Geospatial Analysis

A Next.js-based interactive mapping application with Copernicus Data Space Ecosystem integration.

## Features

- **Interactive Mapping**: Full-featured map with zoom, pan, and navigation controls
- **Base Maps**: Multiple base layer options including:
  - OpenStreetMap
  - Satellite (Esri)
  - Dark & Light themes (CartoDB)
  - Topographic maps
  - NDVI layer from Copernicus
- **Drawing Tools**: Multiple drawing capabilities:
  - Polygon drawing (via toolbar and manual buttons)
  - Rectangle drawing (via toolbar and manual buttons)
  - Circle drawing (via toolbar and manual buttons)
  - Edit and delete existing drawings
  - Clear all drawings
- **WMS Integration**: Full integration with Copernicus Data Space Ecosystem API
- **Real-time Status**: Live coordinate and zoom level display
- **Layer Controls**: Easy-to-use interface for WMS parameter selection

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the new-app directory:
```bash
cd new-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Base Map Selection
- Use the dropdown in the top-left corner to switch between different base maps
- Available options: OpenStreetMap, Satellite, Dark, Light, Topographic, NDVI

### Drawing Tools

#### Method 1: Leaflet-Draw Toolbar (Top-right)
- **Polygon Tool**: Click the polygon icon and draw on the map
- **Rectangle Tool**: Click the rectangle icon and draw rectangles
- **Circle Tool**: Click the circle icon and draw circles
- **Edit Tool**: Click the edit icon to modify existing shapes
- **Delete Tool**: Click the delete icon to remove shapes

#### Method 2: Manual Buttons (Top-left, fallback)
- **Draw Polygon**: Click to enable polygon drawing mode
- **Draw Rectangle**: Click to enable rectangle drawing mode
- **Clear All**: Remove all drawn shapes from the map

#### Drawing Instructions:
1. Select a drawing tool (either from toolbar or manual buttons)
2. Click on the map to start drawing
3. For polygons: Click multiple points to create vertices, double-click to finish
4. For rectangles: Click and drag to create rectangle
5. For circles: Click and drag to set center and radius
6. The map will automatically zoom to fit your drawn area

### Loading WMS Layers
1. Draw a polygon, rectangle, or circle on the map first (required for spatial filtering)
2. Use the WMS Layer Controls panel in the top-right corner:
   - Select a layer (NDVI, Geology, LAI/SAVI, or Moisture Index)
   - Choose start and end dates for temporal filtering
   - Adjust cloud percentage threshold (0-100%)
   - Click "Load WMS Layer" to load the data

### Available WMS Layers
- **NDVI-L2A**: Normalized Difference Vegetation Index
- **GEOLOGY**: Geological data
- **LAI_SAVI**: Leaf Area Index / Soil Adjusted Vegetation Index
- **MOISTURE_INDEX**: Soil moisture content

## Troubleshooting Drawing Tools

If the drawing toolbar doesn't appear in the top-right corner:

1. **Check Browser Console**: Open Developer Tools (F12) and look for error messages
2. **Use Manual Buttons**: The manual drawing buttons in the top-left should work as fallback
3. **Clear Browser Cache**: Sometimes cached CSS can cause issues
4. **Check CSS Loading**: Ensure the Leaflet-Draw CSS is properly loaded

### Console Debugging
The app includes console logging to help debug drawing issues:
- "Initializing map..." - Map initialization started
- "Map created:" - Map object created successfully
- "Draw control created, adding to map..." - Drawing control being added
- "Draw control added successfully" - Drawing control added successfully
- "Draw event created:" - When a shape is drawn
- "Polygon/Rectangle/Circle drawn, bounds:" - When shape drawing is complete

## Technical Details

### Stack
- **Framework**: Next.js 15 with App Router
- **Mapping**: Leaflet.js with Leaflet-Draw
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### API Integration
The application integrates with the Copernicus Data Space Ecosystem WMS API:
```
https://sh.dataspace.copernicus.eu/ogc/wms/2e44e6fc-1f1c-4258-bd09-8a15c317f604
```

### Key WMS Parameters
- **SERVICE**: WMS
- **VERSION**: 1.3.0
- **REQUEST**: GetMap
- **LAYERS**: Selected data layer
- **BBOX**: Bounding box from drawn polygon
- **CRS**: EPSG:4326 (WGS84)
- **TIME**: Date range for temporal filtering
- **MAXCC**: Maximum cloud coverage percentage

## Project Structure

```
new-app/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles + Leaflet CSS
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main page
│   └── components/
│       └── MapComponent.tsx    # Main map component with all functionality
├── public/
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Building for Production
```bash
npm run build
npm run start
```

## Notes

- The map is centered on Africa by default
- Drawing a shape is required before loading WMS layers
- The application uses the same Copernicus Data Space Ecosystem endpoint as the original Angular app
- All mapping functionality is client-side only
- Leaflet markers are fixed to work properly with Next.js
- Drawing tools are available via both toolbar and manual buttons for redundancy

## Future Enhancements

This basic implementation can be extended with:
- Additional drawing tools (markers, polylines)
- File import/export functionality (Shapefile, GeoJSON, KML)
- Statistical analysis features
- More sophisticated time-series analysis
- Export capabilities (PNG, TIFF)
- Additional base maps and data layers
- Drawing persistence and save/load functionality