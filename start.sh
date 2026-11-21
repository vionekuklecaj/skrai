#!/bin/bash
echo "Starting SKRAI Platform..."

# Start backend
cd /home/claude/skrai/backend
python3 seed_data.py
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "Backend started (PID $BACKEND_PID) at http://localhost:8000"

# Start frontend
cd /home/claude/skrai/frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend started (PID $FRONTEND_PID) at http://localhost:3000"

echo ""
echo "SKRAI is running:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

wait
