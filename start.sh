#!/bin/bash

# Job Tracking System - Start Script
# This script starts both the Laravel backend and React frontend

echo "🚀 Starting Job Tracking System..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if backend exists
if [ ! -d "backend" ]; then
    echo "❌ Error: Backend directory not found"
    exit 1
fi

# Function to handle Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Laravel backend
echo "📦 Starting Laravel backend on http://localhost:8000..."
cd backend
php artisan serve > /dev/null 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Check if backend started successfully
if ! curl -s http://localhost:8000 > /dev/null; then
    echo "❌ Failed to start Laravel backend"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend started successfully (PID: $BACKEND_PID)"

# Start Vite frontend
echo "⚛️  Starting React frontend on http://localhost:5173..."
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

echo "✅ Frontend started successfully (PID: $FRONTEND_PID)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Job Tracking System is now running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Frontend:      http://localhost:5173"
echo "🔧 Backend API:   http://localhost:8000"
echo "👑 Admin Panel:   http://localhost:8000/admin"
echo ""
echo "🔐 Login Credentials:"
echo "   Admin: admin@jobtracking.com / password"
echo "   User:  user@jobtracking.com / password"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Keep script running and wait for user to press Ctrl+C
wait
