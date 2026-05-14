# RBI Compliance RAG Assistant

A premium AI-powered verification tool for Indian banking guidelines, built with FastAPI, Next.js, and OpenAI.

## Features
- **PDF RAG**: Upload official RBI PDFs (Circulars, Master Directions) to create a searchable compliance database.
- **AI Verification**: Ask complex regulatory questions and get answers grounded in uploaded documents.
- **Citations**: AI responses include source page numbers for auditability.
- **Premium UI**: Professional banking-grade design with real-time feedback.

## Setup Instructions

### 1. Backend (Python 3.10+)
1. Navigate to `backend/`
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Add your `OPENAI_API_KEY` to `.env`.
4. Start the server:
   ```bash
   python main.py
   ```

### 2. Frontend (Next.js 15)
1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage
1. Open `http://localhost:3000`.
2. Upload an RBI PDF guideline (e.g., KYC Master Direction).
3. Wait for "Processing" to complete.
4. Ask a question like: "What are the latest Aadhaar-based KYC requirements?"
