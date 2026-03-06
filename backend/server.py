import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Import routes
from app.routes.chat import chat_bp
from app.routes.voice import voice_bp

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Register Blueprints
    app.register_blueprint(chat_bp)
    app.register_blueprint(voice_bp)
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get("PORT", 8001))
    app.run(host="127.0.0.1", port=port, debug=True)
