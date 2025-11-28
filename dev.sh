#!/bin/bash

# Start both backend and frontend simultaneously
# Usage: ./dev.sh

set -e  # Exit if any command fails

BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend"

echo "🚀 Starting Heidi Backend & Frontend..."
echo ""

# Check if directories exist
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found: $BACKEND_DIR"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

# Check if venv exists
if [ ! -d "$BACKEND_DIR/.venv" ]; then
    echo "❌ Backend virtual environment not found"
    exit 1
fi

# Check if .env exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "❌ Backend .env file not found"
    exit 1
fi

echo "✅ All checks passed!"
echo ""
echo "───────────────────────────────────────────"
echo "🔹 Starting Backend on http://localhost:8000"
echo "🔹 Starting Frontend on http://localhost:5173"
echo "───────────────────────────────────────────"
echo ""

# Start backend in background
echo "Starting backend..."
(
    cd "$BACKEND_DIR"
    source .venv/bin/activate
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
) &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Give backend a moment to start
sleep 2

# Start frontend in background
echo "Starting frontend..."
(
    cd "$FRONTEND_DIR"
    npm run dev
) &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Both services started!"
echo ""
echo "Logs:"
echo "  - Backend: See above (may need scroll up)"
echo "  - Frontend: Showing below"
echo ""
echo "To stop both services, press Ctrl+C"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
