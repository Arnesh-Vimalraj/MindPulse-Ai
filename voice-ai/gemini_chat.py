import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def get_gemini_response(prompt):
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    return response.text
