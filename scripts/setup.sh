# Setup Script
echo "Installing dependencies..."
pip install -r requirements.txt
cd frontend && npm install
echo "Setup complete!"
