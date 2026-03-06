import requests
import json

BASE_URL = "http://127.0.0.1:8001"

def test_voice_chat(user_id, speech_text):
    print(f"\nTesting Voice Chat for User: {user_id}")
    print(f"Speech: {speech_text}")
    
    payload = {
        "user_id": user_id,
        "speech_text": speech_text
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/voice-chat", json=payload)
        response.raise_for_status()
        print("Response:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Verifying Health-Aware Voice Assistant Logic...")
    
    # Test 1: User with no scan results
    test_voice_chat("voice_test_user_no_scan", "I feel a bit tired today.")
    
    # Test 2: General health question
    test_voice_chat("voice_test_user_no_scan", "How's my health looking?")
