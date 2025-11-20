#!/bin/bash

echo "🎁 Starting Gift Card SaaS Platform"
echo "===================================="
echo ""

# Check if Docker is running
if docker ps &>/dev/null; then
    echo "✅ Docker is running"
    echo "Starting Docker services..."
    docker-compose up -d
    echo "Waiting for services to start..."
    sleep 5
else
    echo "⚠️  Docker is not running"
    echo "Please start Docker Desktop first, or set up PostgreSQL manually"
    echo ""
    read -p "Do you want to continue without Docker? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please start Docker Desktop and run this script again"
        exit 1
    fi
fi

# Setup database
echo ""
echo "Setting up database..."
cd backend
npx prisma generate

if docker ps | grep -q postgres; then
    echo "Running database migrations..."
    npx prisma migrate dev --name init
else
    echo "⚠️  PostgreSQL not available. Please:"
    echo "1. Start Docker Desktop and run: docker-compose up -d"
    echo "2. Or set up PostgreSQL manually"
    echo ""
    echo "Skipping database migration..."
fi

# Start backend
echo ""
echo "Starting backend server..."
npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a bit for backend to start
sleep 3

# Start frontend
echo ""
echo "Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Services starting..."
echo ""
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
