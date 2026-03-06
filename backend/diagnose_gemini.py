import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")
print(f"Testing Gemini API Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("ERROR: GEMINI_API_KEY not found in .env")
else:
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("models/gemini-1.5-flash")
        response = model.generate_content("Hello, this is a diagnostic test.")
        print("SUCCESS: Gemini API is working!")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"FAILURE: Gemini API error: {str(e)}")
