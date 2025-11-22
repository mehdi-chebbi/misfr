#!/bin/bash

echo "🗺️  Testing New App - Geospatial Analysis"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the new-app directory."
    exit 1
fi

echo "✅ Found package.json"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Try to build the app
echo "🔨 Building the application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"

# Check if key files exist
echo "📁 Checking project structure..."
files=(
    "src/app/page.tsx"
    "src/app/layout.tsx"
    "src/components/MapComponent.tsx"
    "src/app/globals.css"
    "next.config.js"
    "tailwind.config.js"
    "tsconfig.json"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing $file"
    fi
done

echo ""
echo "🚀 To start the development server, run:"
echo "   npm run dev"
echo ""
echo "🌐 Then open http://localhost:3000 in your browser"
echo ""
echo "🎨 Drawing Tools:"
echo "   - Leaflet-Draw toolbar should appear in top-right corner"
echo "   - Manual drawing buttons are available in top-left corner"
echo "   - Both support polygon, rectangle, and circle drawing"
echo ""
echo "📊 WMS Features:"
echo "   - Base map selector (top-left)"
echo "   - WMS controls panel (top-right)"
echo "   - Real-time coordinate display (bottom-left)"
echo ""
echo "🔍 Debugging:"
echo "   - Open browser console (F12) to see debug messages"
echo "   - Check for 'Draw control added successfully' message"
echo "   - Look for drawing event logs when creating shapes"