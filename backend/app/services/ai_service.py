import os
import google.generativeai as genai
from dotenv import load_dotenv
from app.services.database import store_chat_log, get_latest_scan_result

load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# CRISIS DETECTION KEYWORDS
CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die", "life is not worth living", 
    "better off dead", "no reason to live", "I want to disappear", "I can't go on anymore", 
    "planning to die", "I wish I was dead", "I don't want to live anymore", 
    "I'm thinking about ending my life", "Everyone would be better without me",
    "hopeless", "worthless", "empty", "numb", "exhausted with life", "nothing matters", 
    "lost purpose", "I feel completely hopeless", "My life has no meaning", "I feel empty inside",
    "panic attack", "can't breathe", "overwhelmed", "losing control", "heart racing", 
    "terrified", "I feel like I'm losing control", "My chest feels tight and I can't breathe",
    "self harm", "cut myself", "hurt myself", "burn myself", "punish myself", 
    "I want to hurt myself", "Cutting helps me cope",
    "alone", "nobody cares", "no friends", "no one understands", "abandoned", 
    "Nobody cares about me", "I feel completely alone",
    "hate myself", "I ruined everything", "I can't handle this", "I am broken", 
    "everything is falling apart"
]

def detect_crisis(message: str) -> bool:
    """Check if the user message contains any crisis-related keywords or phrases."""
    msg_lower = message.lower()
    return any(keyword.lower() in msg_lower for keyword in CRISIS_KEYWORDS)

# Basic system instructions
SYSTEM_PROMPT = """You are an empathetic, supportive AI mental wellness assistant for MindPulse.
Your goal is to help users understand their health scan results and provide emotional support.

### CRISIS PROTOCOL (CRITICAL)
If the user message indicates severe distress, suicide risk, self-harm, or extreme depression:
1. Immediately respond with empathy.
2. Start the response with "⚠️ Mental Health Alert".
3. Inform the user that their message suggests severe emotional distress.
4. Provide India-specific helplines:
   - Kiran Mental Health Helpline: 1800-599-0019
   - AASRA Suicide Prevention Helpline: +91-9820466726
5. Ask if they would like to book a counselling appointment.
6. Encourage professional help and keep a supportive tone.

### HEALTH SCAN INTERPRETATION
If scan results are provided, interpret them based on these thresholds:
- Heart Rate: 60-100 bpm is Normal. < 60 is Low. > 100 is High.
- SpO2: >= 95% is Normal. < 95% is a Low oxygen level warning.
- Blood Pressure: < 120/80 is Normal. 120-129/<80 is Elevated. >= 130/80 is High BP.
- HRV (RMSSD): High HRV indicates relaxation/recovery. Low HRV indicates stress/fatigue.
- Stress Level: Low is Good. Medium suggest relaxation. High recommend rest/breathing.

If signal_confidence is below 0.7, mention that the scan quality may be low.
If no scan results are provided and the user asks about health, politely ask the user to complete a face scan first.

Always respond in a friendly, conversational tone. Answer user questions directly while incorporating scan data where relevant."""

def generate_ai_response(user_message: str, scan_data: dict = None) -> str:
    """Send message to Gemini API and return the generated text using gemini-1.5-flash."""
    try:
        model = genai.GenerativeModel("models/gemini-2.0-flash")
        
        is_crisis = detect_crisis(user_message)
        crisis_context = "\nALERT: This message has been flagged for CRITICAL MENTAL HEALTH RISK. You MUST follow the CRISIS PROTOCOL." if is_crisis else ""
        
        # Build context from scan data
        health_context = ""

        if scan_data:
            health_context = f"""
Latest Scan Results for this User:
- Heart Rate: {scan_data.get('heart_rate')} bpm
- SpO2: {scan_data.get('spo2')}%
- Blood Pressure: {scan_data.get('systolic_bp')}/{scan_data.get('diastolic_bp')} mmHg
- HRV (RMSSD): {scan_data.get('hrv_rmssd')} ms
- Stress Level: {scan_data.get('stress_level')}
- Signal Confidence: {scan_data.get('signal_confidence')}
- Scan Time: {scan_data.get('created_at')}
"""
        else:
            health_context = "\nNo scan results found for this user yet."

        prompt = f"{SYSTEM_PROMPT}\n\n{health_context}\n{crisis_context}\n\nUser: {user_message}\nAssistant:"
        
        response = model.generate_content(prompt)

        return response.text
    except Exception as e:
        print(f"Error generating AI response from Gemini: {str(e)}")
        # Provide a fallback error message
        return "I'm having a little trouble connecting to my service right now. Please try again."

