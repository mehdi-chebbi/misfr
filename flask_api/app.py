from flask import Flask, request, jsonify, Response, send_file
from flask_cors import CORS
import ee
import json
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging
import os
import requests
import base64
import uuid
import urllib.parse
from urllib.request import urlretrieve
import hashlib

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
        context = data.get('context', [])  # Add context support
        
        if not message and not images:
            return jsonify({
                'success': False,
                'error': 'Please provide a message or images'
            }), 400
        
        # Build context-aware message
        if context:
            context_text = "\n\nPrevious conversation:\n"
            for ctx in context[-3:]:  # Last 3 messages for context
                context_text += f"{ctx['role']}: {ctx['content']}\n"
            context_text += f"\nCurrent question: {message}"
            message = context_text
        
        # Call vision API
        result = vision_api_instance.simple_chat(message)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in vision chat endpoint: {e}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/vision/chat_stream', methods=['POST'])
def vision_chat_stream():
    """
    Chat with Nemotron Vision model with streaming response.
    
    Expected JSON payload:
    {
        "message": "Your message here",
        "context": [{"role": "user/assistant", "content": "..."}]  // optional
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
        context = data.get('context', [])
        images = data.get('images', [])  # Add images support
        
        if not message and not images:
            return jsonify({
                'success': False,
                'error': 'Please provide a message or images'
            }), 400
        
        # Build context-aware message
        if context:
            context_text = "\n\nPrevious conversation:\n"
            for ctx in context[-3:]:  # Last 3 messages for context
                context_text += f"{ctx['role']}: {ctx['content']}\n"
            context_text += f"\nCurrent question: {message}"
            message = context_text
        
        def generate():
            try:
                # Send initial status
                if images:
                    yield f"data: {json.dumps({'type': 'status', 'message': 'Analyzing uploaded images...'})}\n\n"
                else:
                    yield f"data: {json.dumps({'type': 'status', 'message': 'Thinking...'})}\n\n"
                
                # Handle images if provided
                if images:
                    # Save images temporarily for vision API
                    temp_image_paths = []
                    for i, img_data in enumerate(images):
                        try:
                            # Decode base64 image
                            image_data = base64.b64decode(img_data)
                            image_filename = f"upload_{uuid.uuid4().hex[:8]}_{i}.png"
                            image_path = os.path.join('ai-images', image_filename)
                            
                            # Ensure directory exists
                            os.makedirs('ai-images', exist_ok=True)
                            
                            with open(image_path, 'wb') as f:
                                f.write(image_data)
                            
                            temp_image_paths.append(image_path)
                        except Exception as e:
                            logger.error(f"Error saving image {i}: {e}")
                    
                    # Use vision API with images
                    if temp_image_paths:
                        for chunk in vision_api_instance.chat_with_images_stream(message, temp_image_paths):
                            yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
                        
                        # Clean up temporary images
                        for img_path in temp_image_paths:
                            try:
                                os.remove(img_path)
                            except:
                                pass
                    else:
                        # Fallback to text-only if image processing failed
                        for chunk in vision_api_instance.simple_chat_stream(message):
                            yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
                else:
                    # Get streaming response from vision API (text only)
                    for chunk in vision_api_instance.simple_chat_stream(message):
                        yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
                
                # Send completion signal
                yield f"data: {json.dumps({'type': 'complete', 'message': 'Response completed'})}\n\n"
                
            except Exception as e:
                logger.error(f"Error in streaming chat: {e}")
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        
        return Response(generate(), mimetype='text/event-stream')
        
    except Exception as e:
        logger.error(f"Error in vision chat stream endpoint: {e}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/vision/analyze_satellite', methods=['POST'])
def analyze_satellite_image():
    """
    Download satellite image from WMS URL and analyze with AI vision model.
    
    Expected JSON payload:
    {
        "wms_url": "https://sh.dataspace.copernicus.eu/ogc/wms/...",
        "layer": "NDVI",
        "date_range": "Jan 15, 2024 to Feb 15, 2024",
        "cloud_coverage": "25%"
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
        if not data or 'wms_url' not in data:
            return jsonify({
                'success': False,
                'error': 'No WMS URL provided'
            }), 400
        
        wms_url = data['wms_url']
        layer = data.get('layer', 'Unknown')
        date_range = data.get('date_range', 'Unknown')
        cloud_coverage = data.get('cloud_coverage', 'Unknown')
        
        # Generate unique filename with proper path handling
        image_filename = f"satellite_{uuid.uuid4().hex[:8]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        # Use os.path.join for proper path handling across platforms
        image_path = os.path.join('ai-images', image_filename)
        
        # Ensure the directory exists
        os.makedirs('ai-images', exist_ok=True)
        
        logger.info(f"Downloading satellite image from: {wms_url}")
        logger.info(f"Saving to: {image_path}")
        
        # Download the satellite image
        try:
            logger.info(f"Attempting to download from: {wms_url}")
            response = requests.get(wms_url, timeout=30)
            response.raise_for_status()
            
            # Ensure directory exists before writing
            os.makedirs('ai-images', exist_ok=True)
            
            logger.info(f"Writing to file: {image_path}")
            with open(image_path, 'wb') as f:
                f.write(response.content)
            
            logger.info(f"Satellite image downloaded successfully: {image_filename}")
            logger.info(f"File size: {len(response.content)} bytes")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to download satellite image: {e}")
            return jsonify({
                'success': False,
                'error': f'Failed to download satellite image: {str(e)}'
            }), 500
        except OSError as e:
            logger.error(f"File system error: {e}")
            logger.error(f"Attempted path: {image_path}")
            logger.error(f"Current working directory: {os.getcwd()}")
            return jsonify({
                'success': False,
                'error': f'File system error: {str(e)}'
            }), 500
        
        # Create analysis context
        analysis_context = f"""Analyze this satellite imagery data:

Layer: {layer}
Date Range: {date_range}
Cloud Coverage: {cloud_coverage}

Analyze the spectral index patterns and environmental conditions visible in this satellite imagery. Focus on what the imagery shows, not location recommendations."""
        
        try:
            # Analyze the downloaded image
            result = vision_api_instance.analyze_image(image_path, analysis_context)
            
            # Add image info to response
            if result.get('success'):
                result['image_info'] = {
                    'filename': image_filename,
                    'layer': layer,
                    'date_range': date_range,
                    'cloud_coverage': cloud_coverage
                }
            
            return jsonify(result)
            
        except Exception as e:
            logger.error(f"Error analyzing satellite image: {e}")
            return jsonify({
                'success': False,
                'error': f'Error analyzing satellite image: {str(e)}'
            }), 500
        
        finally:
            # Clean up: remove the downloaded image after analysis
            try:
                if os.path.exists(image_path):
                    os.remove(image_path)
                    logger.info(f"Cleaned up temporary image: {image_filename}")
                else:
                    logger.warning(f"Image file not found for cleanup: {image_path}")
            except Exception as cleanup_error:
                logger.warning(f"Failed to cleanup image {image_path}: {cleanup_error}")
        
    except Exception as e:
        logger.error(f"Error in analyze satellite endpoint: {e}")
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

@app.route('/api/vision/analyze_satellite_stream', methods=['POST'])
def analyze_satellite_image_stream():
    """
    Stream satellite image analysis with real-time AI responses.
    
    Expected JSON payload:
    {
        "wms_url": "https://sh.dataspace.copernicus.eu/ogc/wms/...",
        "layer": "NDVI",
        "date_range": "Jan 15, 2024 to Feb 15, 2024",
        "cloud_coverage": "25%"
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
        if not data or 'wms_url' not in data:
            return jsonify({
                'success': False,
                'error': 'No WMS URL provided'
            }), 400
        
        wms_url = data['wms_url']
        layer = data.get('layer', 'Unknown')
        date_range = data.get('date_range', 'Unknown')
        cloud_coverage = data.get('cloud_coverage', 'Unknown')
        
        # Use custom message if provided, otherwise use default context
        custom_message = data.get('message')
        if custom_message:
            analysis_context = custom_message
        else:
            analysis_context = f"""Analyze this satellite imagery data:

Layer: {layer}
Date Range: {date_range}
Cloud Coverage: {cloud_coverage}

Analyze the spectral index patterns and environmental conditions visible in this satellite imagery. Focus on what the imagery shows, not location recommendations."""
        
        def generate():
            try:
                # Send initial status
                # yield f"data: {json.dumps({'type': 'status', 'message': 'Downloading satellite image...'})}\n\n"
                
                # Generate unique filename
                image_filename = f"satellite_{uuid.uuid4().hex[:8]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                image_path = os.path.join('ai-images', image_filename)
                
                # Ensure directory exists
                os.makedirs('ai-images', exist_ok=True)
                
                # Download satellite image
                response = requests.get(wms_url, timeout=30)
                response.raise_for_status()
                
                with open(image_path, 'wb') as f:
                    f.write(response.content)
                
                # yield f"data: {json.dumps({'type': 'status', 'message': 'Image downloaded, starting AI analysis...'})}\n\n"
                
                # Call streaming vision API
                for chunk in vision_api_instance.analyze_image_stream(image_path, analysis_context):
                    yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
                
                # Send completion signal
                yield f"data: {json.dumps({'type': 'complete', 'message': 'Analysis complete'})}\n\n"
                
            except requests.exceptions.RequestException as e:
                yield f"data: {json.dumps({'type': 'error', 'message': f'Failed to download satellite image: {str(e)}'})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'message': f'Error during analysis: {str(e)}'})}\n\n"
            finally:
                # Clean up
                try:
                    if 'image_path' in locals() and os.path.exists(image_path):
                        os.remove(image_path)
                except:
                    pass
        
        return Response(generate(), mimetype='text/plain')
        
    except Exception as e:
        logger.error(f"Error in analyze satellite stream endpoint: {e}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/compare', methods=['POST'])
def download_comparison_images():
    """
    Download and save two satellite images for comparison.
    
    Expected JSON payload:
    {
        "geometry": [[lon1, lat1], [lon2, lat2], ...],
        "date1": "YYYY-MM-DD",
        "date2": "YYYY-MM-DD", 
        "layer": "NDVI-L2A",
        "cloud_percentage": 20
    }
    """
    try:
        data = request.get_json()
        logger.info(f"Received comparison request: {data}")
        
        # Validate input
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        required_fields = ['geometry', 'date1', 'date2', 'endTime1', 'endTime2', 'layer', 'cloud_percentage']
        for field in required_fields:
            if field not in data:
                logger.error(f"Missing field: {field}")
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        geometry = data['geometry']
        date1 = data['date1']
        date2 = data['date2']
        endTime1 = data['endTime1']
        endTime2 = data['endTime2']
        layer = data['layer']
        cloud_percentage = data['cloud_percentage']
        
        # Validate dates
        try:
            datetime.strptime(date1, '%Y-%m-%d')
            datetime.strptime(date2, '%Y-%m-%d')
            datetime.strptime(endTime1.replace('T', ' ').replace('Z', ''), '%Y-%m-%d %H:%M:%S')
            datetime.strptime(endTime2.replace('T', ' ').replace('Z', ''), '%Y-%m-%d %H:%M:%S')
        except ValueError as e:
            return jsonify({
                'success': False,
                'error': f'Invalid date format: {str(e)}'
            }), 400
        
        # Validate date2 is after date1
        if datetime.strptime(date2, '%Y-%m-%d') <= datetime.strptime(date1, '%Y-%m-%d'):
            return jsonify({
                'success': False,
                'error': 'Second date must be after first date'
            }), 400
        
        # Create comparison-images directory if it doesn't exist
        comparison_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'comparison-images')
        os.makedirs(comparison_dir, exist_ok=True)
        
        # Convert geometry to bounding box
        if len(geometry) < 2:
            return jsonify({
                'success': False,
                'error': 'Invalid geometry provided'
            }), 400
        
        # Get bounding box coordinates
        lons = [point[0] for point in geometry]
        lats = [point[1] for point in geometry]
        min_lon, max_lon = min(lons), max(lons)
        min_lat, max_lat = min(lats), max(lats)
        
        bbox = f"{min_lat},{min_lon},{max_lat},{max_lon}"
        
        # Generate unique filenames
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        geometry_hash = hashlib.md5(str(geometry).encode()).hexdigest()[:8]
        
        filename1 = f"image1_{date1}_{layer}_{geometry_hash}_{timestamp}.png"
        filename2 = f"image2_{date2}_{layer}_{geometry_hash}_{timestamp}.png"
        
        filepath1 = os.path.join(comparison_dir, filename1)
        filepath2 = os.path.join(comparison_dir, filename2)
        
          # Build WMS URLs for both dates
        def build_wms_url(start_date, end_date, filename):
            # Use the provided date range
            time_param = f"{start_date}T00:00:00Z/{end_date}"
            
            base_url = "https://sh.dataspace.copernicus.eu/ogc/wms/2e44e6fc-1f1c-4258-bd09-8a15c317f604"
            params = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'LAYERS': layer,
                'BBOX': bbox,
                'CRS': 'EPSG:4326',
                'WIDTH': '2500',
                'HEIGHT': '2500',
                'FORMAT': 'image/png',
                'TIME': time_param,
                'MAXCC': str(cloud_percentage)
            }
            
            encoded_params = urllib.parse.urlencode(params)
            full_url = f"{base_url}?{encoded_params}"
            
            # Enhanced logging
            logger.info("=" * 80)
            logger.info(f"WMS URL GENERATED FOR DATE RANGE: {start_date} TO {end_date}")
            logger.info(f"Full URL: {full_url}")
            logger.info(f"Layer: {layer}")
            logger.info(f"Bounding Box: {bbox}")
            logger.info(f"Time Range: {time_param}")
            logger.info(f"Cloud Coverage: {cloud_percentage}%")
            logger.info(f"Image Size: 2500x2500")
            logger.info("=" * 80)
            
            return full_url
        
        url1 = build_wms_url(date1, endTime1, filename1)
        url2 = build_wms_url(date2, endTime2, filename2)
        
        # Download images
        try:
            logger.info("STARTING IMAGE DOWNLOAD PROCESS")
            logger.info(f"Image 1 will be saved to: {filepath1}")
            logger.info(f"Image 2 will be saved to: {filepath2}")
            
            logger.info(f"DOWNLOADING IMAGE 1 from: {url1}")
            response1 = requests.get(url1, timeout=60)
            logger.info(f"Image 1 response status: {response1.status_code}")
            logger.info(f"Image 1 response headers: {dict(response1.headers)}")
            
            if response1.status_code == 200:
                with open(filepath1, 'wb') as f:
                    f.write(response1.content)
                logger.info(f"Image 1 saved successfully. File size: {len(response1.content)} bytes")
            else:
                logger.error(f"FAILED TO DOWNLOAD IMAGE 1. Status: {response1.status_code}")
                logger.error(f"Response content: {response1.text[:500]}...")
            
            logger.info(f"DOWNLOADING IMAGE 2 from: {url2}")
            response2 = requests.get(url2, timeout=60)
            logger.info(f"Image 2 response status: {response2.status_code}")
            logger.info(f"Image 2 response headers: {dict(response2.headers)}")
            
            if response2.status_code == 200:
                with open(filepath2, 'wb') as f:
                    f.write(response2.content)
                logger.info(f"Image 2 saved successfully. File size: {len(response2.content)} bytes")
            else:
                logger.error(f"FAILED TO DOWNLOAD IMAGE 2. Status: {response2.status_code}")
                logger.error(f"Response content: {response2.text[:500]}...")
            
            # Verify files exist and have content
            if os.path.exists(filepath1) and os.path.exists(filepath2):
                size1 = os.path.getsize(filepath1)
                size2 = os.path.getsize(filepath2)
                logger.info(f"VERIFICATION - Image 1 size: {size1} bytes")
                logger.info(f"VERIFICATION - Image 2 size: {size2} bytes")
                logger.info("BOTH IMAGES DOWNLOADED SUCCESSFULLY")
            else:
                logger.error("VERIFICATION FAILED - One or both images were not saved properly")
            
        except Exception as e:
            logger.error(f"Error downloading images: {e}")
            # Clean up any partially downloaded files
            for filepath in [filepath1, filepath2]:
                if os.path.exists(filepath):
                    os.remove(filepath)
            return jsonify({
                'success': False,
                'error': f'Failed to download images: {str(e)}'
            }), 500
        
        # Return success response with file information
        return jsonify({
            'success': True,
            'message': 'Comparison images downloaded successfully',
            'data': {
                'image1': {
                    'filename': filename1,
                    'filepath': filepath1,
                    'date': date1,
                    'endDate': endTime1,
                    'layer': layer,
                    'url': url1
                },
                'image2': {
                    'filename': filename2,
                    'filepath': filepath2,
                    'date': date2,
                    'endDate': endTime2,
                    'layer': layer,
                    'url': url2
                },
                'geometry': geometry,
                'bbox': bbox,
                'cloud_percentage': cloud_percentage,
                'download_time': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error in comparison endpoint: {e}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/comparison-images/cleanup', methods=['POST'])
def cleanup_comparison_images():
    """
    Clean up old comparison images to manage disk space.
    
    Expected JSON payload (optional):
    {
        "max_age_days": 7,  // Delete images older than this many days
        "keep_count": 10    // Keep only this many most recent images
    }
    """
    try:
        data = request.get_json() or {}
        max_age_days = data.get('max_age_days', 7)
        keep_count = data.get('keep_count', 10)
        
        comparison_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'comparison-images')
        
        if not os.path.exists(comparison_dir):
            return jsonify({
                'success': True,
                'message': 'No comparison directory found',
                'deleted_files': []
            })
        
        # Get all PNG files in the directory
        files = []
        for filename in os.listdir(comparison_dir):
            if filename.endswith('.png'):
                filepath = os.path.join(comparison_dir, filename)
                stat = os.stat(filepath)
                files.append({
                    'filename': filename,
                    'filepath': filepath,
                    'mtime': stat.st_mtime,
                    'size': stat.st_size
                })
        
        # Sort by modification time (newest first)
        files.sort(key=lambda x: x['mtime'], reverse=True)
        
        # Determine which files to delete
        files_to_delete = []
        current_time = datetime.now().timestamp()
        max_age_seconds = max_age_days * 24 * 60 * 60
        
        for i, file_info in enumerate(files):
            should_delete = False
            
            # Delete if older than max_age_days
            if current_time - file_info['mtime'] > max_age_seconds:
                should_delete = True
            
            # Delete if we have more than keep_count files
            if i >= keep_count:
                should_delete = True
            
            if should_delete:
                files_to_delete.append(file_info)
        
        # Delete the files
        deleted_files = []
        total_size_freed = 0
        
        for file_info in files_to_delete:
            try:
                os.remove(file_info['filepath'])
                deleted_files.append(file_info['filename'])
                total_size_freed += file_info['size']
                logger.info(f"Deleted old comparison image: {file_info['filename']}")
            except Exception as e:
                logger.error(f"Failed to delete {file_info['filename']}: {e}")
        
        return jsonify({
            'success': True,
            'message': f'Cleaned up {len(deleted_files)} old comparison images',
            'deleted_files': deleted_files,
            'total_files_before': len(files),
            'total_files_after': len(files) - len(deleted_files),
            'size_freed_mb': round(total_size_freed / (1024 * 1024), 2)
        })
        
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")
        return jsonify({
            'success': False,
            'error': f'Cleanup failed: {str(e)}'
        }), 500

@app.route('/api/comparison-images/list', methods=['GET'])
def list_comparison_images():
    """
    List all comparison images with their metadata.
    """
    try:
        comparison_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'comparison-images')
        
        if not os.path.exists(comparison_dir):
            return jsonify({
                'success': True,
                'images': []
            })
        
        images = []
        for filename in os.listdir(comparison_dir):
            if filename.endswith('.png'):
                filepath = os.path.join(comparison_dir, filename)
                stat = os.stat(filepath)
                
                # Extract metadata from filename
                parts = filename.replace('.png', '').split('_')
                image_info = {
                    'filename': filename,
                    'filepath': filepath,
                    'size_mb': round(stat.st_size / (1024 * 1024), 2),
                    'created': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    'created_formatted': datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S')
                }
                
                # Try to extract additional info from filename
                if len(parts) >= 4:
                    image_info['image_number'] = parts[0] + '_' + parts[1]
                    image_info['date'] = parts[2]
                    image_info['layer'] = parts[3]
                    if len(parts) >= 5:
                        image_info['hash'] = parts[4]
                        if len(parts) >= 6:
                            image_info['timestamp'] = parts[5]
                
                images.append(image_info)
        
        # Sort by creation time (newest first)
        images.sort(key=lambda x: x['created'], reverse=True)
        
        return jsonify({
            'success': True,
            'images': images,
            'total_count': len(images),
            'total_size_mb': round(sum(img['size_mb'] for img in images), 2)
        })
        
    except Exception as e:
        logger.error(f"Error listing comparison images: {e}")
        return jsonify({
            'success': False,
            'error': f'Failed to list images: {str(e)}'
        }), 500

@app.route('/api/comparison-images/<filename>')
def serve_comparison_image(filename):
    """
    Serve downloaded comparison images.
    
    Args:
        filename: Name of the image file to serve
    """
    try:
        comparison_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'comparison-images')
        filepath = os.path.join(comparison_dir, filename)
        
        # Security check: ensure file exists and is within the comparison directory
        if not os.path.exists(filepath):
            logger.error(f"Image file not found: {filepath}")
            return jsonify({
                'success': False,
                'error': 'Image not found'
            }), 404
        
        # Additional security: ensure the file is actually in the comparison directory
        if not os.path.abspath(filepath).startswith(os.path.abspath(comparison_dir)):
            logger.error(f"Attempted directory traversal: {filename}")
            return jsonify({
                'success': False,
                'error': 'Invalid file path'
            }), 403
        
        # Serve the file
        return send_file(filepath, mimetype='image/png')
        
    except Exception as e:
        logger.error(f"Error serving image {filename}: {e}")
        return jsonify({
            'success': False,
            'error': f'Error serving image: {str(e)}'
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