# Run Project Script
echo "Starting MindPulse Services..."

# Start AI Backend (Port 8001) in background
cd backend
python server.py &

# Start rPPG Backend (Port 8000) in background
python -m uvicorn app.inference:app --port 8000 &

# Start Frontend (Port 5173) 
cd ../frontend
npm run dev
