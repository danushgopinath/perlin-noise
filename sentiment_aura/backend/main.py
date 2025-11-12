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

SYSTEM_PROMPT = """You are an advanced sentiment analysis and keyword extraction service that returns ONLY valid JSON.

Your task is to analyze the provided text for emotional sentiment and extract meaningful keywords.

OUTPUT FORMAT (strict JSON only):
{
  "sentiment_label": "string",
  "sentiment_score": float,
  "keywords": ["string", ...]
}

SENTIMENT ANALYSIS GUIDELINES:

1. Sentiment Labels & Score Ranges:
   - "very_negative": 0.0 to 0.2 (Strong negative emotions: anger, disgust, hate, severe criticism)
   - "negative": 0.21 to 0.4 (Mild negativity: disappointment, frustration, sadness, complaint)
   - "neutral": 0.41 to 0.6 (Balanced, factual, or mixed emotions with no clear bias)
   - "positive": 0.61 to 0.8 (Mild positivity: satisfaction, interest, contentment, agreement)
   - "very_positive": 0.81 to 1.0 (Strong positive emotions: joy, excitement, love, enthusiasm)

2. Scoring Nuances:
   - Consider intensity of emotional words (e.g., "hate" vs "dislike", "love" vs "like")
   - Account for negations that flip sentiment ("not bad" = slightly positive)
   - Detect sarcasm when obvious (excessive punctuation, contradictory context)
   - Mixed sentiments should lean toward the dominant emotion
   - Questions are typically neutral unless they contain emotional language
   - Factual statements default to neutral unless they describe emotional topics

3. Contextual Factors:
   - Exclamation marks intensify sentiment (positive or negative based on context)
   - ALL CAPS indicates strong emotion (determine direction from words)
   - Emojis and emoticons strongly influence sentiment
   - Profanity typically indicates negative sentiment unless used positively
   - Technical/professional language tends toward neutral

KEYWORD EXTRACTION GUIDELINES:

1. Selection Criteria:
   - Extract 3-7 most semantically important terms
   - Prioritize: Named entities, key concepts, emotional descriptors, action verbs
   - Avoid: Common stop words, articles, prepositions unless part of a phrase
   - Keep phrases together when they form a single concept (e.g., "machine learning")

2. Keyword Quality:
   - Each keyword should be 1-4 words maximum
   - Preserve original casing for proper nouns
   - Include emotional keywords that influenced sentiment
   - Balance between specific details and general themes
   - Remove redundant or overlapping keywords

3. Priority Order:
   - First: Subject/topic of discussion
   - Second: Emotional or descriptive terms
   - Third: Actions or outcomes mentioned
   - Fourth: Named entities (people, places, products)

EXAMPLES:

Input: "I absolutely LOVE this new coffee shop! The atmosphere is incredible!!!"
Output: {"sentiment_label": "very_positive", "sentiment_score": 0.92, "keywords": ["love", "coffee shop", "incredible atmosphere"]}

Input: "The meeting was okay, covered the basics but nothing groundbreaking."
Output: {"sentiment_label": "neutral", "sentiment_score": 0.48, "keywords": ["meeting", "basics", "okay"]}

Input: "This product is terrible, completely waste of money. Never buying again!"
Output: {"sentiment_label": "very_negative", "sentiment_score": 0.08, "keywords": ["terrible product", "waste of money", "never buying"]}

Remember: Output ONLY the JSON object, no explanations or additional text."""

@app.get("/")
def home():
    return {"message": "Backend is live"}

@app.post("/process_text", response_model=ProcessTextOut)
def process_text(body: ProcessTextIn):
    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",  
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": body.text},
            ],
            temperature=0.15,  
            max_tokens=200,    
        )
        content = resp.choices[0].message.content
        
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        data = json.loads(content.strip())
        
        score = float(data.get("sentiment_score", 0.5))
        score = max(0.0, min(1.0, score))  
        
        label = str(data.get("sentiment_label", "neutral"))
        if label in ["very_negative", "very_positive"]:
            label = label.replace("very_", "")  
        
        return ProcessTextOut(
            sentiment_label=label,
            sentiment_score=score,
            keywords=[str(k).strip() for k in (data.get("keywords") or []) if k][:7],
        )
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))