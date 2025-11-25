from flask import Flask, request, jsonify
from flask_cors import CORS
import ee
import json
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging
import os

# Import vision API
from vision_api import initialize_vision_api, get_vision_api

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Google Earth Engine
try:
    ee.Initialize(project='test-479119')
    logger.info("Google Earth Engine initialized successfully.")
except Exception as e:
    logger.error(f"Error initializing Earth Engine: {e}")
    sys.exit(1)

# Initialize Vision API - HARDCODED API KEY
# Replace 'your-api-key-here' with your actual NVIDIA Nemotron API key
VISION_API_KEY = "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"  # <-- CHANGE THIS TO YOUR ACTUAL API KEY

if VISION_API_KEY and VISION_API_KEY != "your-api-key-here":
    try:
        initialize_vision_api(VISION_API_KEY)
        logger.info("Vision API initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing Vision API: {e}")
else:
    logger.warning("Please update the hardcoded API key in app.py (line 32)")

# Index configurations
INDICES_CONFIG = {
    'NDVI': {
        'name': 'Normalized Difference Vegetation Index',
        'description': 'Measures vegetation health and density',
        'formula': '(NIR - RED) / (NIR + RED)',
        'bands': ['B8', 'B4']
    },
    'NDWI': {
        'name': 'Normalized Difference Water Index',
        'description': 'Detects water bodies and vegetation moisture',
        'formula': '(GREEN - NIR) / (GREEN + NIR)',
        'bands': ['B3', 'B8']
    },
    'EVI': {
        'name': 'Enhanced Vegetation Index',
        'description': 'Improved vegetation index with atmospheric correction',
        'formula': '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))',
        'bands': ['B8', 'B4', 'B2']
    },
    'NDSI': {
        'name': 'Normalized Difference Snow Index',
        'description': 'Detects snow cover and snow melt',
        'formula': '(GREEN - SWIR) / (GREEN + SWIR)',
        'bands': ['B11', 'B12']
    },
    'NBR': {
        'name': 'Normalized Burn Ratio',
        'description': 'Detects burn scars and vegetation stress',
        'formula': '(NIR - SWIR) / (NIR + SWIR)',
        'bands': ['B8', 'B12']
    },
    'SAVI': {
        'name': 'Soil Adjusted Vegetation Index',
        'description': 'Vegetation index adjusted for soil brightness',
        'formula': '((NIR - RED) / (NIR + RED + L)) * (1 + L)',
        'bands': ['B8', 'B4']
    },
    'LAI': {
        'name': 'Leaf Area Index',
        'description': 'One-sided green leaf area per unit ground surface area',
        'formula': '3.618 * EVI - 0.118',  # Empirical relationship
        'bands': ['B8', 'B4', 'B2']
    }
}

def calculate_indices(image: ee.Image, selected_indices: List[str]) -> ee.Image:
    """
    Calculate selected spectral indices for a single image.
    
    Args:
        image: Sentinel-2 image
        selected_indices: List of index names to calculate
        
    Returns:
        Image with calculated index bands
    """
    bands = {
        'BLUE': image.select('B2'),
        'GREEN': image.select('B3'),
        'RED': image.select('B4'),
        'NIR': image.select('B8'),
        'SWIR': image.select('B12')
    }
    
    calculated_indices = []
    
    for index_name in selected_indices:
        if index_name == 'NDVI':
            ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
            calculated_indices.append(ndvi)
            
        elif index_name == 'NDWI':
            ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI')
            calculated_indices.append(ndwi)
            
        elif index_name == 'EVI':
            evi = image.expression(
                '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
                    'NIR': bands['NIR'], 
                    'RED': bands['RED'], 
                    'BLUE': bands['BLUE']
                }
            ).rename('EVI')
            calculated_indices.append(evi)
            
        elif index_name == 'NDSI':
            ndsi = image.normalizedDifference(['B11', 'B12']).rename('NDSI')
            calculated_indices.append(ndsi)
            
        elif index_name == 'NBR':
            nbr = image.normalizedDifference(['B8', 'B12']).rename('NBR')
            calculated_indices.append(nbr)
            
        elif index_name == 'SAVI':
            savi = image.expression(
                '((NIR - RED) / (NIR + RED + L)) * (1 + L)', {
                    'NIR': bands['NIR'], 
                    'RED': bands['RED'], 
                    'L': 0.5
                }
            ).rename('SAVI')
            calculated_indices.append(savi)
            
        elif index_name == 'LAI':
            # First calculate EVI, then convert to LAI using empirical relationship
            evi = image.expression(
                '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
                    'NIR': bands['NIR'], 
                    'RED': bands['RED'], 
                    'BLUE': bands['BLUE']
                }
            )
            lai = evi.expression('3.618 * EVI - 0.118', {'EVI': evi}).rename('LAI')
            calculated_indices.append(lai)
    
    # Add all calculated indices to the image
    if calculated_indices:
        return image.addBands(calculated_indices)
    else:
        return image

def get_time_series_data(geometry: List[List[float]], start_date: str, end_date: str, 
                         selected_indices: List[str]) -> Dict[str, Any]:
    """
    Get time series data for selected indices over the specified geometry and date range.
    
    Args:
        geometry: List of coordinate pairs defining the polygon
        start_date: Start date in 'YYYY-MM-DD' format
        end_date: End date in 'YYYY-MM-DD' format
        selected_indices: List of index names to calculate
        
    Returns:
        Dictionary containing time series data for each index
    """
    try:
        # Create AOI geometry
        aoi = ee.Geometry.Polygon(geometry)
        
        # Load Sentinel-2 collection
        s2_collection = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                          .filterDate(start_date, end_date)
                          .filterBounds(aoi)
                          .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)))
        
        # Calculate indices for all images
        def add_indices_to_image(image):
            return calculate_indices(image, selected_indices)
        
        indexed_collection = s2_collection.map(add_indices_to_image)
        
        # Get time series data for each index with all statistical measures
        time_series_data = {}
        total_data_points = 0
        
        for index_name in selected_indices:
            # Calculate all statistics for each image
            def calculate_all_stats(image):
                # Calculate all statistics in one go for efficiency
                stats = image.select(index_name).reduceRegion(
                    reducer=ee.Reducer.mean().combine(
                        ee.Reducer.min(), None, True
                    ).combine(
                        ee.Reducer.max(), None, True
                    ).combine(
                        ee.Reducer.stdDev(), None, True
                    ),
                    geometry=aoi,
                    scale=10,
                    maxPixels=1e9
                )
                
                # Get date in YYYY-MM-DD format
                date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd')
                
                return image.set({
                    'date': date,
                    'mean': stats.get(index_name + '_mean'),
                    'min': stats.get(index_name + '_min'),
                    'max': stats.get(index_name + '_max'),
                    'stdDev': stats.get(index_name + '_stdDev')
                })
            
            # Apply calculations to all images
            stats_collection = indexed_collection.select(index_name).map(calculate_all_stats)
            
            # Get all data with dates and statistics
            all_data = stats_collection.getInfo()
            
            # Group by date and aggregate multiple images from same date
            date_groups = {}
            total_images_processed = 0
            
            for feature in all_data.get('features', []):
                props = feature.get('properties', {})
                date = props.get('date')
                mean_val = props.get('mean')
                
                total_images_processed += 1
                
                if date and mean_val is not None:
                    if date not in date_groups:
                        date_groups[date] = {
                            'means': [],
                            'mins': [],
                            'maxs': [],
                            'stdDevs': []
                        }
                    
                    # Collect all values for this date
                    date_groups[date]['means'].append(mean_val)
                    if props.get('min') is not None:
                        date_groups[date]['mins'].append(props.get('min'))
                    if props.get('max') is not None:
                        date_groups[date]['maxs'].append(props.get('max'))
                    if props.get('stdDev') is not None:
                        date_groups[date]['stdDevs'].append(props.get('stdDev'))
            
              # Log aggregation details
            logger.info(f"Date aggregation details for {index_name}:")
            dates_with_multiple_images = 0
            for date, values in date_groups.items():
                if len(values['means']) > 1:
                    dates_with_multiple_images += 1
                    logger.info(f"  Date {date}: {len(values['means'])} images aggregated")
            
            if dates_with_multiple_images > 0:
                logger.info(f"Found {dates_with_multiple_images} dates with multiple images - these have been aggregated")
            else:
                logger.info("No duplicate dates found - all images were from unique dates")
            
            # Calculate aggregated statistics for each date
            valid_data = []
            for date, values in sorted(date_groups.items()):
                # Calculate aggregated statistics across all images for this date
                aggregated_mean = sum(values['means']) / len(values['means'])
                aggregated_min = min(values['mins']) if values['mins'] else aggregated_mean
                aggregated_max = max(values['maxs']) if values['maxs'] else aggregated_mean
                aggregated_std = sum(values['stdDevs']) / len(values['stdDevs']) if values['stdDevs'] else 0
                
                valid_data.append({
                    'date': date,
                    'mean': round(float(aggregated_mean), 4),
                    'min': round(float(aggregated_min), 4),
                    'max': round(float(aggregated_max), 4),
                    'stdDev': round(float(aggregated_std), 4)
                })
            
            logger.info(f"Processed {len(date_groups)} unique dates for {index_name}")
            logger.info(f"Total images processed: {total_images_processed}")
            logger.info(f"Valid data points: {len(valid_data)}")
            
            if valid_data:
                logger.info(f"First valid data point: {valid_data[0]}")
                total_data_points = len(valid_data)
            
            time_series_data[index_name] = {
                'name': INDICES_CONFIG[index_name]['name'],
                'description': INDICES_CONFIG[index_name]['description'],
                'data': valid_data
            }
        
        return {
            'success': True,
            'geometry': geometry,
            'date_range': {'start': start_date, 'end': end_date},
            'indices': time_series_data,
            'total_images': total_data_points,
            'aggregation_info': f'Images aggregated by date to remove duplicates'
        }
        
    except Exception as e:
        logger.error(f"Error processing time series data: {e}")
        return {
            'success': False,
            'error': str(e)
        }

@app.route('/api/indices', methods=['GET'])
def get_available_indices():
    """Get list of available spectral indices with their descriptions."""
    return jsonify({
        'success': True,
        'indices': INDICES_CONFIG
    })

@app.route('/api/time_series', methods=['POST'])
def calculate_time_series():
    """
    Calculate time series data for selected indices.
    
    Expected JSON payload:
    {
        "geometry": [[lon1, lat1], [lon2, lat2], ...],
        "start_date": "YYYY-MM-DD",
        "end_date": "YYYY-MM-DD",
        "indices": ["NDVI", "EVI", "LAI"]
    }
    """
    try:
        data = request.get_json()
        logger.info(f"Received data: {data}")
        
        # Validate input
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        logger.info(f"Data keys: {list(data.keys())}")
        
        required_fields = ['geometry', 'start_date', 'end_date', 'indices']
        for field in required_fields:
            if field not in data:
                logger.error(f"Missing field: {field}")
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        geometry = data['geometry']
        start_date = data['start_date']
        end_date = data['end_date']
        selected_indices = data['indices']
        
        # Validate indices
        invalid_indices = [idx for idx in selected_indices if idx not in INDICES_CONFIG]
        if invalid_indices:
            return jsonify({
                'success': False,
                'error': f'Invalid indices: {invalid_indices}'
            }), 400
        
        # Validate date format
        try:
            datetime.strptime(start_date, '%Y-%m-%d')
            datetime.strptime(end_date, '%Y-%m-%d')
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }), 400
        
        # Process the request
        logger.info(f"Processing time series request for indices: {selected_indices}")
        logger.info(f"Date range: {start_date} to {end_date}")
        logger.info(f"Geometry: {geometry}")
        
        result = get_time_series_data(geometry, start_date, end_date, selected_indices)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in time series endpoint: {e}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/vision/chat', methods=['POST'])
def vision_chat():
    """
    Chat with Nemotron Vision model.
    
    Expected JSON payload:
    {
        "message": "Your message here",
        "images": ["base64_encoded_image_1", "base64_encoded_image_2"]  // optional
    }
    """
    try:
        vision_api_instance = get_vision_api()
        if not vision_api_instance:
            return jsonify({
                'success': False,
                'error': 'Vision API not initialized. Please check API key configuration.'
            }), 503
        
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        message = data.get('message', '')
        images = data.get('images', [])
        
        if not message and not images:
            return jsonify({
                'success': False,
                'error': 'Please provide a message or images'
            }), 400
        
        # Call vision API
        result = vision_api_instance.simple_chat(message)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in vision chat endpoint: {e}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/vision/analyze_map', methods=['POST'])
def analyze_map_screenshot():
    """
    Analyze current map view using vision model.
    
    Expected JSON payload:
    {
        "image_data": "base64_encoded_screenshot",
        "context": "Additional context about the map view"  // optional
    }
    """
    try:
        vision_api_instance = get_vision_api()
        if not vision_api_instance:
            return jsonify({
                'success': False,
                'error': 'Vision API not initialized. Please check API key configuration.'
            }), 503
        
        data = request.get_json()
        if not data or 'image_data' not in data:
            return jsonify({
                'success': False,
                'error': 'No image data provided'
            }), 400
        
        image_data = data['image_data']
        context = data.get('context', 'Analyze this satellite imagery or map view.')
        
        # Create a temporary file for the image
        import tempfile
        import base64
        
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
            # Decode base64 and save to temp file
            image_bytes = base64.b64decode(image_data)
            temp_file.write(image_bytes)
            temp_file_path = temp_file.name
        
        try:
            # Analyze the image
            result = vision_api_instance.analyze_image(temp_file_path, context)
            return jsonify(result)
        finally:
            # Clean up temp file
            os.unlink(temp_file_path)
        
    except Exception as e:
        logger.error(f"Error in analyze map endpoint: {e}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)