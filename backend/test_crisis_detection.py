import requests
import json

BASE_URL = "http://127.0.0.1:8001"

def test_chat(user_id, message):
    print(f"\nTesting Chat for User: {user_id}")
    print(f"Message: {message}")
    
    payload = {
        "user_id": user_id,
        "message": message
    }
    
    try:
        response = requests.post(f"{BASE_URL}/chat", json=payload)
        response.raise_for_status()
        print("Response:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Verifying Crisis Detection Logic...")
    
    # Test 1: Critical Risk - Suicide
    test_chat("crisis_test_user", "I want to end my life, everything is hopeless.")
    
    # Test 2: Critical Risk - Self Harm
    test_chat("crisis_test_user", "I'm thinking about cutting myself tonight.")
    
    # Test 3: Normal Health Question - No Risk
    test_chat("crisis_test_user", "How is my heart rate doing?")
