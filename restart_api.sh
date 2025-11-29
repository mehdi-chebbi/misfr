#!/bin/bash
# Quick setup script to restart Flask API with new system prompt

echo "🚀 Restarting Flask API with New System Prompt"
echo "=============================================="

cd /home/z/my-project/flask_api

# Check if we need to install dependencies
if ! python3 -c "import flask" 2>/dev/null; then
    echo "📦 Installing Flask dependencies..."
    pip3 install --user flask flask-cors requests
fi

# Kill any existing Flask processes
echo "🔄 Stopping existing Flask processes..."
pkill -f "python.*app.py" 2>/dev/null || true

# Start Flask API
echo "🌟 Starting Flask API with new system prompt..."
python3 app.py &

# Wait a moment and check if it's running
sleep 2
if pgrep -f "python.*app.py" > /dev/null; then
    echo "✅ Flask API started successfully!"
    echo "🌐 API is running on: http://localhost:5000"
    echo "🧪 Test endpoint: http://localhost:5000/api/health"
else
    echo "❌ Failed to start Flask API"
    echo "🔧 Check the logs above for errors"
fi

echo ""
echo "🎯 New System Prompt Features:"
echo "✅ Strict domain enforcement (satellite imagery only)"
echo "✅ Exact refusal message for off-topic requests"
echo "✅ Clear forbidden topics list"
echo "✅ Enhanced UI with scope reminders"
echo ""
echo "🧪 To test: Try asking for YAML files, bills help, or programming"
echo "   AI should respond with the exact refusal message!"