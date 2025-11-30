#!/bin/bash

echo "🤖 Testing Nemotron Vision Integration"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "app.py" ]; then
    echo "❌ Error: app.py not found. Please run this script from the flask_api directory."
    exit 1
fi

echo "✅ Found Flask app"

# Check if vision_api.py exists
if [ ! -f "vision_api.py" ]; then
    echo "❌ Error: vision_api.py not found."
    exit 1
fi

echo "✅ Found Vision API module"

# Check if API key is set
if [ -z "$OPENROUTER_API_KEY" ] && [ -z "$NEMOTRON_API_KEY" ]; then
    echo "⚠️  Warning: No API key found in environment variables."
    echo "   Set your API key with:"
    echo "   export OPENROUTER_API_KEY='your-api-key-here'"
    echo "   export NEMOTRON_API_KEY='your-api-key-here'"
    echo ""
    echo "   Or add it to your .env file"
else
    echo "✅ API key found in environment variables"
fi

# Check Python dependencies
echo ""
echo "📦 Checking Python dependencies..."
python3 -c "
import flask
import flask_cors
import ee
import requests
print('✅ All required Python packages are installed')
" 2>/dev/null || {
    echo "❌ Missing Python dependencies. Installing..."
    pip install -r requirements.txt
}

echo ""
echo "🚀 To start the Flask API server, run:"
echo "   python3 app.py"
echo ""
echo "🌐 The API will be available at: http://localhost:5000"
echo ""
echo "🔍 Available endpoints:"
echo "   POST /api/vision/chat - Chat with AI"
echo "   POST /api/vision/analyze_map - Analyze map screenshot"
echo "   GET  /api/health - Health check"
echo "   POST /api/time_series - Time series analysis"
echo "   GET  /api/indices - Available indices"
echo ""
echo "📱 Test the integration:"
echo "   1. Start the Flask server: python3 app.py"
echo "   2. Start the Next.js app: npm run dev (from parent directory)"
echo "   3. Go to the map page and draw an area"
echo "   4. Click the '🤖 AI Analyze' button in the Satellite Data tab"