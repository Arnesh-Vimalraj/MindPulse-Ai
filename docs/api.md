# API Documentation

The MindPulse backend provides two primary services.

## AI Service (Port 8001)

### `POST /chat`
Generate a health-aware AI response.
- **Payload**:
  ```json
  {
    "user_id": "UUID",
    "message": "User text"
  }
  ```
- **Response**:
  ```json
  {
    "reply": "AI response text"
  }
  ```

### `POST /api/voice-chat`
Specialized endpoint for voice interactions.

## Biometric Service (Port 8000)

### `WS /scan`
WebSocket connection for real-time frame transmission.
- **Message Format**: Base64 ROIs (Forehead, Left Cheek, Right Cheek).
- **Final Message**: Returns a JSON object with full biometric metrics once the buffer is processed.
