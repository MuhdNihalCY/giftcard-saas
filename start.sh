#!/bin/bash

echo "🎁 Starting Gift Card SaaS Platform"
echo "===================================="
echo ""

# Pick free host ports to avoid conflicts with other projects (common on dev machines)
find_free_port() {
    for p in "$@"; do
        if ! lsof -nP -iTCP:"$p" -sTCP:LISTEN >/dev/null 2>&1; then
            echo "$p"
            return 0
        fi
    done
    # fallback to first candidate
    echo "$1"
}

# Default ports (will stay the same on a clean machine; will shift if ports are taken)
export POSTGRES_PORT="$(find_free_port 5432 5433 5434 15432)"
export REDIS_PORT="$(find_free_port 6379 6380 6381 16379)"

# Ensure app points at the same host ports we publish from docker-compose.yml
export DATABASE_URL="postgresql://postgres:postgres@localhost:${POSTGRES_PORT}/giftcard_db?schema=public"
export REDIS_URL="redis://localhost:${REDIS_PORT}"

# Helpful log line so you can see what was chosen
echo "Using Postgres on localhost:${POSTGRES_PORT} and Redis on localhost:${REDIS_PORT}"
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

if docker ps --format '{{.Names}}' | grep -q '^giftcard-postgres$'; then
    echo "Checking database migration status..."
    # Check migration status - if already up to date, skip migration
    MIGRATION_STATUS=$(npx prisma migrate status 2>&1)
    if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
        echo "✅ Database schema is up to date"
    else
        echo "Applying database migrations..."
        # Use migrate deploy (like CI/CD) which doesn't require shadow database
        # This applies pending migrations without validation
        npx prisma migrate deploy || {
            echo "⚠️  No pending migrations or deploy failed, syncing schema..."
            # Fallback to db push for development if migrations don't exist
            npx prisma db push --skip-generate --accept-data-loss
        }
    fi
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
