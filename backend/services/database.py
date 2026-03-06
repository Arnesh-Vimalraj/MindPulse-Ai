import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_ANON_KEY")
    if not url or not key:
        raise ValueError("Supabase credentials not found in environment variables.")
    return create_client(url, key)

supabase = get_supabase_client()

def store_chat_log(user_id: str, message: str, ai_response: str) -> None:
    """Store the chat conversation in the 'chat_logs' Supabase table."""
    try:
        data = {
            "user_id": user_id,
            "message": message,
            "ai_response": ai_response
            # created_at is automatically handled by Postgres timestamp default
        }
        supabase.table("chat_logs").insert(data).execute()
    except Exception as e:
        print(f"Error storing chat in Supabase: {str(e)}")

def get_latest_scan_result(user_id: str):
    """Fetch the most recent scan result for a specific user."""
    try:
        response = supabase.table("scan_results") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
        
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error fetching latest scan result: {str(e)}")
        return None

def store_voice_chat_log(user_id: str, user_speech: str, ai_response: str) -> None:
    """Store the voice conversation in the 'voice_conversations' Supabase table."""
    try:
        data = {
            "user_id": user_id,
            "user_speech": user_speech,
            "ai_response": ai_response
        }
        supabase.table("voice_conversations").insert(data).execute()
    except Exception as e:
        print(f"Error storing voice chat in Supabase: {str(e)}")

