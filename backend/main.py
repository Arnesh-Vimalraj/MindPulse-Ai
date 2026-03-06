import asyncio
import json
import logging
from collections import deque
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

from supabase import create_client, Client
from chatbot_logic import analyze_sentiment, generate_ai_response
from core.rppg_engine import extract_vitals
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="MindPulse Phase 1 Backend")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

class ChatRequest(BaseModel):
    user_id: str
    message: str

class VoiceChatRequest(BaseModel):
    user_id: str
    speech_text: str

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # 1. Analyze sentiment and stress level
    stress_level, emotion = analyze_sentiment(request.message)
    
    try:
        # 2. Generate AI response
        ai_reply = await generate_ai_response(request.message)
        
        # 3. Store in Supabase 'feedback' table (Success only)
        try:
            feedback_data = {
                "user_message": request.message,
                "ai_response": ai_reply,
                "emotion": emotion
            }
            supabase.table("feedback").insert(feedback_data).execute()
        except Exception as e:
            logger.error(f"Error saving feedback to Supabase: {e}")

        # Also store in general 'chat_messages' history
        try:
            data = {
                "user_id": request.user_id,
                "message": request.message,
                "ai_response": ai_reply,
                "emotion": emotion,
                "stress_level": stress_level
            }
            supabase.table("chat_messages").insert(data).execute()
        except Exception as e:
            logger.error(f"Error saving chat to Supabase: {e}")
        
        return {
            "reply": ai_reply,
            "emotion": emotion,
            "stress_level": stress_level
        }

    except Exception as e:
        logger.error(f"Chatbot failed to generate response: {e}")
        return {
            "reply": "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again later or reach out to a professional if you need immediate support.",
            "emotion": "neutral",
            "stress_level": "moderate"
        }

@app.get("/api/chat-test")
async def chat_test_endpoint():
    """Verify AI connection with a simple prompt."""
    try:
        test_reply = await generate_ai_response("Hello, this is a system test. Please respond with 'AI Connection Operational'.")
        return {
            "status": "success",
            "ai_response": test_reply
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/voice-chat")
async def voice_chat_endpoint(request: VoiceChatRequest):
    # 1. Generate AI response using existing logic
    # We use a specific voice-friendly prompt extension
    voice_prompt = f"Speak in a short, conversational, and empathetic way. {request.speech_text}"
    ai_reply = await generate_ai_response(voice_prompt)
    
    # 2. Store in Supabase voice_conversations table
    try:
        data = {
            "user_id": request.user_id,
            "user_speech": request.speech_text,
            "ai_response": ai_reply
        }
        supabase.table("voice_conversations").insert(data).execute()
    except Exception as e:
        logger.error(f"Error saving voice chat to Supabase: {e}")
    
    # 3. Return response
    return {
        "ai_response": ai_reply
    }

# Backend Frame Buffer System
# Limit buffer size to prevent memory leaks on continuous streaming
FRAME_BUFFER_CAPACITY = 300
frame_buffer = deque(maxlen=FRAME_BUFFER_CAPACITY)

class FramePayload(BaseModel):
    timestamp: float
    frame_id: int
    forehead_roi: str
    left_cheek_roi: str
    right_cheek_roi: str
    stability: float

@app.websocket("/scan")
async def websocket_scan_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("New WebSocket connection established on /scan")
    
    # Use a session-specific buffer
    session_buffer = []
    
    try:
        while True:
            # Wait for any incoming messages from the frontend
            data = await websocket.receive_text()
            
            try:
                # Parse JSON string to dictionary
                payload_dict = json.loads(data)
                
                # Validate against schema
                frame_data = FramePayload(**payload_dict)
                
                # Append to session buffer
                session_buffer.append(frame_data.model_dump())
                
                if len(session_buffer) >= 150:
                    # Calculate actual FPS and stability
                    start_time = session_buffer[0]["timestamp"]
                    end_time = session_buffer[-1]["timestamp"]
                    duration_sec = (end_time - start_time) / 1000.0
                    fps = 150 / duration_sec if duration_sec > 0 else 15.0
                    
                    avg_stability = sum([f["stability"] for f in session_buffer]) / 150.0
                    
                    # Process signal
                    result = extract_vitals(session_buffer, fps, avg_stability)
                    
                    # Send result to frontend
                    await websocket.send_json(result)
                    
                    if "error" in result:
                        logger.warning(f"Scan failed: {result['error']}")
                    else:
                        logger.info(f"Processed 150 frames. FPS: {fps:.2f} | Result: {result}")
                    
                    # Reset buffer for next window
                    session_buffer.clear()
                
            except json.JSONDecodeError:
                logger.error("Invalid JSON received from frontend.")
            except ValidationError as e:
                logger.error(f"Payload schema validation failed: {e}")
                
    except WebSocketDisconnect:
        logger.info("WebSocket connection closed by client.")
        
    except Exception as e:
        logger.error(f"Unexpected error in websocket handler: {e}")

@app.get("/")
def read_root():
    return {"status": "MindPulse Phase 1 Backend is running"}
