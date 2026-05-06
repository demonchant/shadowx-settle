#!/bin/bash

echo "🚀 Starting ShadowX Trading App..."
echo ""
echo "This will:"
echo "1. Install dependencies (if needed)"
echo "2. Start the development server"
echo "3. Open at http://localhost:5173"
echo ""

cd app

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "✅ Starting dev server..."
echo "🌐 Open http://localhost:5173 in your browser"
echo ""

npm run dev
