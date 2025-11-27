# MISFR Flask API for Time Series Analysis

This Flask API provides time series analysis for various spectral indices using Google Earth Engine and Sentinel-2 data.

## Features

- **7 Spectral Indices**: NDVI, NDWI, EVI, NDSI, NBR, SAVI, LAI
- **Time Series Data**: Get temporal data for any selected indices
- **Flexible Geometry**: Support for polygon-defined areas of interest
- **Date Range Filtering**: Analyze specific time periods
- **RESTful API**: Clean JSON responses with proper error handling

## Setup Instructions

### 1. Install Dependencies

```bash
cd flask_api
pip install -r requirements.txt
```

### 2. Google Earth Engine Authentication

Make sure you have Google Earth Engine set up with your project `test-479119`:

```bash
earthengine authenticate
```

### 3. Run the Flask Server

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### 1. Health Check
```
GET /api/health
```

### 2. Get Available Indices
```
GET /api/indices
```

Returns a list of available spectral indices with descriptions.

### 3. Calculate Time Series
```
POST /api/time_series
```

**Request Body:**
```json
{
  "geometry": [[lon1, lat1], [lon2, lat2], [lon3, lat3], [lon1, lat1]],
  "start_date": "2023-06-01",
  "end_date": "2023-08-31",
  "indices": ["NDVI", "EVI", "LAI"]
}
```

**Response:**
```json
{
  "success": true,
  "geometry": [[lon1, lat1], [lon2, lat2], [lon3, lat3], [lon1, lat1]],
  "date_range": {
    "start": "2023-06-01",
    "end": "2023-08-31"
  },
  "indices": {
    "NDVI": {
      "name": "Normalized Difference Vegetation Index",
      "description": "Measures vegetation health and density",
      "data": [
        {"date": "2023-06-01", "value": 0.6543},
        {"date": "2023-06-08", "value": 0.6721},
        ...
      ]
    },
    "EVI": {
      "name": "Enhanced Vegetation Index",
      "description": "Improved vegetation index with atmospheric correction",
      "data": [...]
    },
    "LAI": {
      "name": "Leaf Area Index",
      "description": "One-sided green leaf area per unit ground surface area",
      "data": [...]
    }
  },
  "total_images": 15
}
```

## Available Indices

| Index | Full Name | Description |
|-------|-----------|-------------|
| NDVI | Normalized Difference Vegetation Index | Measures vegetation health and density |
| NDWI | Normalized Difference Water Index | Detects water bodies and vegetation moisture |
| EVI | Enhanced Vegetation Index | Improved vegetation index with atmospheric correction |
| NDSI | Normalized Difference Snow Index | Detects snow cover and snow melt |
| NBR | Normalized Burn Ratio | Detects burn scars and vegetation stress |
| SAVI | Soil Adjusted Vegetation Index | Vegetation index adjusted for soil brightness |
| LAI | Leaf Area Index | One-sided green leaf area per unit ground surface area |

## Testing

Run the test script to verify the API is working correctly:

```bash
python test_api.py
```

This will test all endpoints with sample data and show you the expected response format.

## Integration with Frontend

To integrate this API with your Next.js frontend:

1. **CORS**: The API already has CORS enabled for cross-origin requests
2. **Error Handling**: All responses include a `success` field and proper error messages
3. **Data Format**: The time series data is structured for easy charting

Example frontend integration:

```javascript
async function getTimeSeriesData(geometry, startDate, endDate, selectedIndices) {
  const response = await fetch('http://localhost:5000/api/time_series', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      geometry: geometry,
      start_date: startDate,
      end_date: endDate,
      indices: selectedIndices
    })
  });
  
  const data = await response.json();
  return data;
}
```

## Notes

- **Cloud Filtering**: Images with >20% cloud coverage are automatically filtered out
- **Spatial Resolution**: All calculations are done at 10m resolution
- **Temporal Resolution**: Depends on Sentinel-2 revisit frequency (typically 5 days)
- **Data Source**: Copernicus Sentinel-2 Surface Reflectance (Level-2A)

## Troubleshooting

1. **Earth Engine Authentication**: Make sure your GEE account is properly authenticated
2. **Project ID**: Ensure `test-479119` is your correct GEE project ID
3. **Memory Limits**: For very large areas or long time ranges, consider breaking into smaller requests
4. **Network Issues**: The API may take time to process large requests - implement proper timeout handling in frontend