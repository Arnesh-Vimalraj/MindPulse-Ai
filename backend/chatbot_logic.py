import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini AI
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# System prompt for the mental health assistant
SYSTEM_PROMPT = """
You are a supportive AI mental health assistant designed to help students manage stress and anxiety. 
Respond in a calm, empathetic, and supportive tone. 
If the user expresses severe distress or negative emotions, encourage them to seek support or counselling.
Avoid giving medical diagnoses.
"""

def analyze_sentiment(text):
    """
    Basic NLP sentiment analysis for stress detection.
    Negative sentiment -> High stress
    Neutral sentiment -> Moderate stress
    Positive sentiment -> Low stress
    """
    text = text.lower()
    
    # Very basic keyword-based sentiment for demonstration
    # In a production app, we could use a proper NLP library or LLM for this
    stress_keywords = ["stressed", "anxious", "overwhelmed", "sad", "exams", "failed", "hate", "hard", "struggling"]
    low_stress_keywords = ["happy", "good", "better", "great", "relaxed", "calm"]

    stress_count = sum(1 for word in stress_keywords if word in text)
    low_stress_count = sum(1 for word in low_stress_keywords if word in text)

    if stress_count > low_stress_count:
        return "high", "negative"
    elif low_stress_count > stress_count:
        return "low", "positive"
    else:
        return "moderate", "neutral"

async def generate_ai_response(message):
    """
    Generate a response using Gemini AI.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")

    genai.configure(api_key=api_key)
    # Using 'gemini-3.1-flash-lite-preview' as it's the only one listed by list_models()
    model = genai.GenerativeModel('models/gemini-3.1-flash-lite-preview')
    
    # Construct the full prompt
    full_prompt = f"{SYSTEM_PROMPT}\n\nUser: {message}\nAssistant:"
    
    try:
        response = model.generate_content(full_prompt)
        if not response or not response.text:
            raise Exception("Empty response received from AI model.")
        return response.text
    except Exception as e:
        # Detailed logging for debugging
        print(f"--- AI API FAILURE ---")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        print(f"--- Details ---")
        if hasattr(e, 'status_code'): print(f"Status Code: {e.status_code}")
        print(f"----------------------")
        raise e
