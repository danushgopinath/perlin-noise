# 🧠 Memory Machines – Sentiment Aura

A full-stack interactive app that visualizes real-time sentiment as a glowing, animated aura.  
It captures live audio, transcribes it, analyzes sentiment, and updates visuals dynamically.

---

## 🚀 Tech Stack

- **Frontend:** React, p5.js, Tailwind CSS  
- **Backend:** FastAPI (Python), Deepgram Speech-to-Text API  
- **Language:** JavaScript / Python  
- **Deployment:** Local or Cloud (GitHub, Vercel, etc.)

---

## ✨ Features

- 🎙️ Real-time speech transcription  
- 💬 Sentiment analysis with visual feedback  
- 🌈 Animated aura that changes color and motion based on sentiment  
- 🧾 Transcript and control interface with start/stop buttons  
- 🔒 `.env` file used for API keys (excluded from GitHub)

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd sentiment_aura
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
npm start
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend` folder:

```env
OPENAI_API_KEY=your_api_key_here
```

Create a `.env` file inside the `frontend` folder:

```env
VITE_DEEPGRAM_API_KEY=your_api_key_here
```
