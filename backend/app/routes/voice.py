from flask import Blueprint, request, jsonify
from app.services.ai_service import generate_ai_response
from app.services.database import get_latest_scan_result, store_voice_chat_log

voice_bp = Blueprint('voice', __name__)

@voice_bp.route('/api/voice-chat', methods=['POST', 'OPTIONS'])
def voice_chat_endpoint():
    if request.method == "OPTIONS":
        return "", 200

    try:
        data = request.get_json()
        user_id = data.get("user_id")
        message = data.get("message") or data.get("speech_text")
        
        if not user_id or not message:
            return jsonify({"error": "Missing 'user_id' or 'message'"}), 400
            
        scan_data = get_latest_scan_result(user_id)
        ai_reply = generate_ai_response(message, scan_data=scan_data)
        store_voice_chat_log(user_id=user_id, user_speech=message, ai_response=ai_reply)
        
        return jsonify({"ai_response": ai_reply}), 200
        
    except Exception as e:
        print(f"Error in /api/voice-chat: {str(e)}")
        return jsonify({"error": str(e)}), 500
