from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configuration
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'sugardrop_db')
EMERGENT_LLM_KEY = os.getenv('EMERGENT_LLM_KEY', '')
JWT_SECRET = os.getenv('JWT_SECRET', 'sugardrop-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# MongoDB connection
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Security
security = HTTPBearer()

# FastAPI app setup
app = FastAPI(title="SugarDrop API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Models
class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    daily_sugar_goal: Optional[float] = 50.0

class UserLogin(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: str
    email: str
    name: str
    daily_sugar_goal: float
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class FoodEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    sugar_content: float
    portion_size: float
    calories: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class FoodEntryCreate(BaseModel):
    name: str
    sugar_content: float
    portion_size: float
    calories: Optional[float] = None

class ChatMessage(BaseModel):
    message: str
    image_base64: Optional[str] = None

class KBQuery(BaseModel):
    query: str
    debug: Optional[bool] = False

# Utility functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_data = await db.users.find_one({"_id": user_id})
        if user_data is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(
            id=user_data["_id"],
            email=user_data["email"],
            name=user_data["name"],
            daily_sugar_goal=user_data["daily_sugar_goal"],
            created_at=user_data["created_at"]
        )
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(user_data.password)
    
    user_doc = {
        "_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_password,
        "daily_sugar_goal": user_data.daily_sugar_goal,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create token
    access_token = create_access_token({"user_id": user_id})
    user = User(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        daily_sugar_goal=user_data.daily_sugar_goal,
        created_at=user_doc["created_at"]
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": user_data.email})
    if not user_doc or not verify_password(user_data.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    access_token = create_access_token({"user_id": user_doc["_id"]})
    user = User(
        id=user_doc["_id"],
        email=user_doc["email"],
        name=user_doc["name"],
        daily_sugar_goal=user_doc["daily_sugar_goal"],
        created_at=user_doc["created_at"]
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user)

# Food tracking routes
@api_router.post("/food/entries", response_model=FoodEntry)
async def create_food_entry(entry_data: FoodEntryCreate, current_user: User = Depends(get_current_user)):
    entry = FoodEntry(
        user_id=current_user.id,
        name=entry_data.name,
        sugar_content=entry_data.sugar_content,
        portion_size=entry_data.portion_size,
        calories=entry_data.calories
    )
    
    await db.food_entries.insert_one(entry.dict())
    return entry

@api_router.get("/food/entries", response_model=List[FoodEntry])
async def get_food_entries(current_user: User = Depends(get_current_user)):
    entries = await db.food_entries.find({"user_id": current_user.id}).sort("timestamp", -1).to_list(100)
    return [FoodEntry(**entry) for entry in entries]

@api_router.get("/food/entries/today")
async def get_today_entries(current_user: User = Depends(get_current_user)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    
    entries = await db.food_entries.find({
        "user_id": current_user.id,
        "timestamp": {"$gte": today, "$lt": tomorrow}
    }).to_list(100)
    
    total_sugar = sum(entry["sugar_content"] * entry["portion_size"] for entry in entries)
    
    return {
        "entries": [FoodEntry(**entry) for entry in entries],
        "total_sugar": total_sugar,
        "daily_goal": current_user.daily_sugar_goal,
        "percentage": (total_sugar / current_user.daily_sugar_goal) * 100 if current_user.daily_sugar_goal > 0 else 0
    }

# AI Chat routes
@api_router.post("/ai/chat")
async def ai_chat(chat_data: ChatMessage, current_user: User = Depends(get_current_user)):
    try:
        # Create chat instance
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"user_{current_user.id}",
            system_message="You are a friendly and knowledgeable AI nutritionist and dietary coach. Help users track their sugar intake, provide healthy eating advice, and support their wellness journey. Be encouraging, informative, and personalized in your responses."
        ).with_model("openai", "gpt-4o-mini")
        
        # Create user message
        user_message = UserMessage(text=chat_data.message)
        
        # Get response
        response = await chat.send_message(user_message)
        
        # Store chat history
        chat_entry = {
            "user_id": current_user.id,
            "message": chat_data.message,
            "response": response,
            "timestamp": datetime.utcnow()
        }
        await db.chat_history.insert_one(chat_entry)
        
        return {"response": response}
        
    except Exception as e:
        logger.error(f"AI Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="AI service unavailable")

# Knowledge Base routes (dev-only)
@api_router.post("/kb/search")
async def kb_search(query_data: KBQuery, current_user: User = Depends(get_current_user)):
    # Mock KB data for development
    mock_results = [
        {
            "type": "article",
            "title": f"Sugar intake guidelines for {query_data.query}",
            "snippet": f"Comprehensive information about {query_data.query} and its impact on blood sugar levels...",
            "url": "https://example.com/article1",
            "score": 0.85
        },
        {
            "type": "tip",
            "title": f"Quick tip: Managing {query_data.query}",
            "snippet": f"Practical advice for incorporating {query_data.query} into your daily routine...",
            "score": 0.78
        },
        {
            "type": "recipe",
            "title": f"Healthy recipes with {query_data.query}",
            "snippet": f"Delicious and nutritious recipes that feature {query_data.query} as a key ingredient...",
            "score": 0.72
        }
    ]
    
    if query_data.debug:
        return {
            "results": mock_results,
            "debug_info": {
                "query_tokens": query_data.query.split(),
                "total_results": len(mock_results),
                "processing_time_ms": 45
            }
        }
    
    return {"results": mock_results}

# Health check
@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0",
        "features": {
            "auth": True,
            "food_tracking": True,
            "ai_chat": bool(EMERGENT_LLM_KEY),
            "kb_search": True
        }
    }

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)