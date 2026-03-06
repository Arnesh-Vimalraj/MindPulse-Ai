# System Architecture

MindPulse follows a modern micro-services-lite architecture designed for scalability and real-time biometric processing.

## Components

### 1. Frontend (React)
- **Framework**: Vite + React
- **Purpose**: Provides the user interface for face scanning, health data visualization, and AI chatting.
- **Communication**: 
  - WebSockets for high-frequency frame transmission to the rPPG engine.
  - REST API for conversational AI and user management.

### 2. rPPG Computing Engine (FastAPI)
- **Location**: `ai-models/rppg/`
- **Purpose**: Processes 150 frames (approx. 10 seconds) of facial ROIs to extract physiological signals.
- **Logic**: Uses signal filtering and peak detection to calculate HR, SpO2, and HRV.

### 3. AI Insight Server (Flask)
- **Location**: `backend/`
- **Purpose**: Orchestrates the communication between the user's latest health data, the Gemini LLM, and the database.
- **Security**: Implements a dedicated crisis detection middleware to monitor user safety.

### 4. Data Layer (Supabase)
- **Purpose**: High-performance PostgreSQL database with real-time capabilities and built-in authentication.
- **Tables**:
  - `profiles`: User information.
  - `scan_results`: Physiological vitals log.
  - `chat_logs`: Conversational history.
