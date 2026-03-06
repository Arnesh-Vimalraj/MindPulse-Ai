import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def test_chatbot_logic():
    api_key = os.environ.get("GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    
    # Replicate the prompt from chatbot.py
    SYSTEM_PROMPT = """You are an empathetic, supportive AI mental wellness assistant for MindPulse.
Your goal is to help users understand their health scan results and provide emotional support.

### CRISIS PROTOCOL (CRITICAL)
(Protocol omitted for brevity in test)

### HEALTH SCAN INTERPRETATION
...
"""
    health_context = "\nNo scan results found for this user yet."
    user_message = "How is my health?"
    prompt = f"{SYSTEM_PROMPT}\n\n{health_context}\n\nUser: {user_message}\nAssistant:"
    
    print(f"Sending prompt to Gemini...")
    try:
        model = genai.GenerativeModel("models/gemini-2.0-flash")
        response = model.generate_content(prompt)
        print(f"Gemini Response: {response.text}")
    except Exception as e:
        print(f"Caught Exception: {str(e)}")
        if hasattr(e, 'message'): print(f"Message: {e.message}")
        if hasattr(e, 'status'): print(f"Status: {e.status}")

test_chatbot_logic()
