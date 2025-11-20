#!/bin/bash

echo "🚀 Starting Backend Server..."
echo "=============================="
echo ""

cd "$(dirname "$0")/backend"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please run: ./setup-env.sh"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Prisma client is generated
if [ ! -d node_modules/.prisma ]; then
    echo "🔧 Generating Prisma client..."
    npx prisma generate
fi

echo "✅ Starting backend server on port 5001..."
echo ""
echo "Backend will be available at: http://localhost:5001"
echo "Health check: http://localhost:5001/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev

