import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from services.chatbot import generate_ai_response
from services.database import store_chat_log, get_latest_scan_result

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Add CORS so React frontend can communicate with the backend
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/chat', methods=['POST', 'OPTIONS'])
@app.route('/api/chat', methods=['POST', 'OPTIONS'])  # Also supports /api/chat based on frontend configuration
def chat_endpoint():
    # Handle preflight requests
    if request.method == "OPTIONS":
        return "", 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON format"}), 400
        
        user_id = data.get("user_id")
        message = data.get("message")
        
        if not user_id or not message:
            return jsonify({"error": "Missing 'user_id' or 'message'"}), 400
            
        # 1. Fetch latest scan result for the user
        scan_data = get_latest_scan_result(user_id)
        
        # 3. Generate AI response via Gemini with scan context
        ai_reply = generate_ai_response(message, scan_data=scan_data)
        
        # 4. Store in Supabase 'chat_logs' table
        store_chat_log(user_id=user_id, message=message, ai_response=ai_reply)

        
        # 5. Return JSON response
        return jsonify({
            "reply": ai_reply
        }), 200
        
    except Exception as e:
        print(f"Error in /chat endpoint: {str(e)}")
        # 6. Basic error handling
        return jsonify({"error": "An error occurred while processing your request"}), 500

@app.route('/api/voice-chat', methods=['POST', 'OPTIONS'])
def voice_chat_endpoint():
    if request.method == "OPTIONS":
        return "", 200

    try:
        data = request.get_json()
        user_id = data.get("user_id")
        message = data.get("message") or data.get("speech_text")
        
        if not user_id or not message:
            return jsonify({"error": "Missing 'user_id' or 'message'"}), 400
            
        # 1. Fetch latest scan result
        scan_data = get_latest_scan_result(user_id)
        
        # 2. Generate AI response with scan context
        # We can reuse generate_ai_response since it now accepts scan_data
        ai_reply = generate_ai_response(message, scan_data=scan_data)
        
        # 3. Store in voice_conversations table
        from services.database import store_voice_chat_log
        store_voice_chat_log(user_id=user_id, user_speech=message, ai_response=ai_reply)
        
        return jsonify({
            "ai_response": ai_reply
        }), 200
        
    except Exception as e:
        print(f"Error in /api/voice-chat: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run the Flask app
    app.run(host="127.0.0.1", port=8001, debug=True)

