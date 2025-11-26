# Nemotron Vision API Integration

This integration adds AI-powered vision analysis capabilities to the MISFR Africa application using the NVIDIA Nemotron Nano 12B Vision model via OpenRouter.

## Features

- **AI Chat**: Simple text-based chat with the AI model
- **Image Analysis**: Analyze satellite imagery and map screenshots
- **Remote Sensing Expertise**: Pre-configured with specialized knowledge for geospatial analysis
- **Seamless Integration**: Directly accessible from the Satellite Data tab

## Setup

### 1. API Key Configuration

Set your OpenRouter API key as an environment variable:

```bash
export OPENROUTER_API_KEY='your-api-key-here'
# or
export NEMOTRON_API_KEY='your-api-key-here'
```

### 2. Install Dependencies

```bash
cd flask_api
pip install -r requirements.txt
```

### 3. Start the Flask API Server

```bash
cd flask_api
python3 app.py
```

The API server will run on `http://localhost:5000`

### 4. Start the Next.js Application

```bash
cd ..  # Back to project root
npm run dev
```

## Usage

### Basic AI Chat Test

1. Draw an area on the map or load satellite data
2. Go to the **Satellite Data** tab
3. Click the **🤖 AI Analyze** button
4. The app will send "hi" to the AI and display the response

### Available API Endpoints

#### `POST /api/vision/chat`
Chat with the AI model.

**Request:**
```json
{
  "message": "Your message here",
  "images": ["base64_encoded_image_1", "base64_encoded_image_2"]  // optional
}
```

**Response:**
```json
{
  "success": true,
  "response": "AI response here",
  "model": "nvidia/nemotron-nano-12b-v2-vl:free",
  "usage": {...}
}
```

#### `POST /api/vision/analyze_map`
Analyze a map screenshot with AI.

**Request:**
```json
{
  "image_data": "base64_encoded_screenshot",
  "context": "Additional context about the map view"  // optional
}
```

#### `GET /api/health`
Check if the API is running and vision model is initialized.

## AI Capabilities

The Nemotron model is configured with expertise in:

### Vegetation Indices
- **NDVI**: Plant health monitoring (0.6-0.9 = healthy vegetation)
- **EVI**: Enhanced vegetation analysis for high biomass areas
- **SAVI**: Soil-adjusted vegetation index
- **LAI**: Leaf area index calculations

### Water Indices
- **NDWI**: Water body detection
- **MNDWI**: Built-up area separation
- **NDMI**: Vegetation moisture content

### Geological Analysis
- **NBR**: Burn scar detection
- **NDSI**: Snow cover monitoring
- Mineral and soil composition analysis

### Analysis Approach
1. Identifies imagery types (multispectral, false-color, true-color)
2. Interprets color schemes and patterns
3. Analyzes spatial features and textures
4. Provides technical insights for remote sensing professionals

## Frontend Integration

The AI functionality is integrated into the Satellite Data tab:

- **🤖 AI Analyze Button**: Purple/pink gradient button
- **Conditional Enable**: Only active when area is drawn or data is loaded
- **Simple Alert Response**: Shows AI response in browser alert
- **Error Handling**: Clear error messages for connection issues

## Future Enhancements

Potential improvements for production use:

1. **Better UI**: Replace alerts with modal dialogs
2. **Image Integration**: Send map screenshots for visual analysis
3. **Context Awareness**: Include layer information and coordinates
4. **Conversation History**: Maintain chat context
5. **Batch Analysis**: Process multiple areas
6. **Export Results**: Save AI analysis reports

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Ensure environment variable is set
   - Check Flask server logs for initialization messages

2. **Connection Refused**
   - Make sure Flask server is running on port 5000
   - Check for firewall blocking the connection

3. **Invalid Response**
   - Verify API key is valid and has credits
   - Check OpenRouter service status

4. **CORS Issues**
   - Flask-CORS should handle this automatically
   - Ensure both servers are running on allowed origins

### Debug Mode

Enable Flask debug mode for detailed error messages:

```bash
python3 app.py
# Debug mode is enabled by default
```

Check browser console for frontend errors and Flask terminal for backend issues.

## Model Information

- **Model**: NVIDIA Nemotron Nano 12B Vision
- **Provider**: OpenRouter
- **Type**: Multimodal (text + vision)
- **Size**: 12 billion parameters
- **Cost**: Free tier available
- **Specialization**: Remote sensing and geospatial analysis