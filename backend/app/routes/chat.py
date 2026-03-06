from flask import Blueprint, request, jsonify
from app.services.ai_service import generate_ai_response
from app.services.database import store_chat_log, get_latest_scan_result

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat', methods=['POST', 'OPTIONS'])
@chat_bp.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat_endpoint():
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
            
        scan_data = get_latest_scan_result(user_id)
        ai_reply = generate_ai_response(message, scan_data=scan_data)
        store_chat_log(user_id=user_id, message=message, ai_response=ai_reply)

        return jsonify({"reply": ai_reply}), 200
        
    except Exception as e:
        print(f"Error in /chat endpoint: {str(e)}")
        return jsonify({"error": "An error occurred while processing your request"}), 500
