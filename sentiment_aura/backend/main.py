import os, json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY in environment")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=OPENAI_API_KEY)

class ProcessTextIn(BaseModel):
    text: str = Field(..., min_length=1)

class ProcessTextOut(BaseModel):
    sentiment_label: str
    sentiment_score: float
    keywords: list[str]

SYSTEM_PROMPT = """You are a service that ONLY returns strict JSON with:
{
  "sentiment_label": "positive|neutral|negative",
  "sentiment_score": 0..1,
  "keywords": ["k1","k2",...]
}
Rules:
- Keep keywords short (1-3 words), 3 to 7 items.
- sentiment_score: map negative→0..0.33, neutral→0.34..0.66, positive→0.67..1.0.
- No extra commentary. Output ONLY JSON.
"""

@app.post("/process_text", response_model=ProcessTextOut)
def process_text(body: ProcessTextIn):
    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",  
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": body.text},
            ],
            temperature=0.2,
        )
        content = resp.choices[0].message.content
        data = json.loads(content)
        # Basic validation
        return ProcessTextOut(
            sentiment_label=str(data.get("sentiment_label", "neutral")),
            sentiment_score=float(data.get("sentiment_score", 0.5)),
            keywords=[str(k) for k in (data.get("keywords") or [])][:10],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))