# Compare Feature - Temporal Satellite Image Analysis

## 🆕 New Feature: Compare Tab

The Misfr Africa platform now includes a powerful **Compare** feature that allows users to analyze changes over time by comparing satellite imagery from two different dates side-by-side.

## 🚀 How to Use

### 1. Draw Your Area of Interest
- Use the drawing tools (polygon, rectangle, or circle) to define your analysis area
- This is required before loading comparison data

### 2. Navigate to Compare Tab
- Click the **Compare** tab in the left sidebar (next to Base Map, Satellite Data, and Statistics)
- The tab icon shows: 🔄

### 3. Select Comparison Parameters
- **First Date (Earlier)**: Choose the earlier date for comparison
- **Second Date (Later)**: Choose the later date (must be after first date)
- **Data Layer**: Select from available satellite layers:
  - NDVI (Vegetation Health)
  - NDWI (Water Bodies)
  - True Color (Natural View)
  - False Color (Vegetation)
  - Moisture Index
  - Geological Features
- **Cloud Coverage**: Set maximum cloud percentage (0-100%)

### 4. Load Comparison Images
- Click **"Load Comparison Images"** button
- The system will download two high-resolution (2500x2500px) satellite images
- Images are saved to `/comparison-images/` folder
- A modal will open showing both images side-by-side

## 📊 Analysis Features

### Side-by-Side Display
- **Image 1 (Earlier)**: Shown with blue header
- **Image 2 (Later)**: Shown with green header
- Both images display the same geographic extent and data layer

### Comparison Information
- Data layer type and cloud coverage settings
- Download timestamp
- File information and metadata

### Analysis Tips
The modal provides helpful guidance for analyzing changes:
- Vegetation pattern changes (green/brown variations)
- Water body detection and level changes
- Urban expansion identification
- Deforestation monitoring
- Seasonal variation analysis

## 🔧 Technical Details

### Backend API Endpoints

#### Download Comparison Images
```
POST /api/compare
{
  "geometry": [[lon1, lat1], [lon2, lat2], ...],
  "date1": "2024-01-15",
  "date2": "2024-02-15",
  "layer": "NDVI-L2A",
  "cloud_percentage": 20
}
```

#### Serve Images
```
GET /api/comparison-images/<filename>
```

#### List All Images
```
GET /api/comparison-images/list
```

#### Cleanup Old Images
```
POST /api/comparison-images/cleanup
{
  "max_age_days": 7,
  "keep_count": 10
}
```

### Image Storage
- **Location**: `/comparison-images/` folder (same level as Flask app)
- **Format**: PNG files, 2500x2500 pixels
- **Naming**: `image1_date_layer_hash_timestamp.png` and `image2_date_layer_hash_timestamp.png`
- **Security**: Files served via Flask with path validation

### Frontend Components
- **CompareTab**: Date selection and parameter controls
- **ComparisonModal**: Side-by-side image display with analysis tips
- **Integration**: Seamlessly integrated into MapComponent tab system

## 🛰️ Data Sources

- **Provider**: Copernicus Data Space Ecosystem
- **Satellite**: Sentinel-2
- **Resolution**: 10m per pixel (enhanced to 2500x2500px images)
- **Spectral Indices**: All standard indices supported (NDVI, NDWI, EVI, etc.)

## 🎯 Use Cases

### Environmental Monitoring
- **Deforestation**: Track forest cover loss over time
- **Urban Growth**: Monitor city expansion and infrastructure development
- **Agricultural Changes**: Observe crop health and field patterns
- **Water Level Changes**: Monitor reservoirs, lakes, and rivers

### Research Applications
- **Climate Studies**: Analyze seasonal and long-term environmental changes
- **Disaster Assessment**: Compare before/after natural disasters
- **Land Use Planning**: Track changes in land use patterns
- **Ecological Research**: Monitor habitat changes and ecosystem health

## 🔒 Security & Performance

### Security Features
- Path validation for image serving
- Directory traversal protection
- File type restrictions (PNG only)

### Performance Features
- High-resolution image caching
- Efficient WMS URL generation
- Automatic cleanup of old images
- Optimized file naming with timestamps

### Error Handling
- Comprehensive validation for dates and parameters
- Graceful fallbacks for missing images
- User-friendly error messages
- Automatic cleanup of partial downloads

## 🚀 Future Enhancements

### Planned Features
- **Swipe Comparison**: Interactive slider to compare images
- **Difference Detection**: Automatic change detection algorithms
- **Time Series**: Support for more than two dates
- **Export Options**: Download comparison as PDF or video
- **AI Analysis**: Automated change detection insights

### Performance Improvements
- **Image Compression**: Optimize file sizes without quality loss
- **Lazy Loading**: Load images on demand
- **Caching**: Browser and server-side caching
- **Background Processing**: Queue system for large comparisons

---

This comparison feature enhances the Misfr Africa platform's analytical capabilities, enabling users to monitor and understand environmental changes over time with professional-grade satellite imagery analysis tools.