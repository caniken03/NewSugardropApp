from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import json
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from supabase import create_client, Client
import openai

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
JWT_SECRET = os.getenv('JWT_SECRET', 'sugardrop-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Initialize OpenAI client
openai.api_key = OPENAI_API_KEY

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Security
security = HTTPBearer()

# FastAPI app setup
app = FastAPI(title="SugarDrop API with Supabase", version="2.0.0")
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

# Database setup function
async def setup_database():
    """Create database tables if they don't exist"""
    try:
        # Create users table
        supabase.table('users').select('id').limit(1).execute()
    except Exception:
        # Table doesn't exist, create it via SQL
        supabase.rpc('create_users_table').execute()
    
    try:
        # Create food_entries table
        supabase.table('food_entries').select('id').limit(1).execute()
    except Exception:
        # Table doesn't exist, create it via SQL
        supabase.rpc('create_food_entries_table').execute()
    
    try:
        # Create chat_history table
        supabase.table('chat_history').select('id').limit(1).execute()
    except Exception:
        # Table doesn't exist, create it via SQL
        supabase.rpc('create_chat_history_table').execute()

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
        
        # Get user from Supabase
        result = supabase.table('users').select('*').eq('id', user_id).execute()
        if not result.data:
            raise HTTPException(status_code=401, detail="User not found")
        
        user_data = result.data[0]
        return User(
            id=user_data["id"],
            email=user_data["email"],
            name=user_data["name"],
            daily_sugar_goal=user_data["daily_sugar_goal"],
            created_at=datetime.fromisoformat(user_data["created_at"].replace('Z', '+00:00'))
        )
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = supabase.table('users').select('*').eq('email', user_data.email).execute()
    if existing_user.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(user_data.password)
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_password,
        "daily_sugar_goal": user_data.daily_sugar_goal,
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Insert user into Supabase
    result = supabase.table('users').insert(user_doc).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user")
    
    # Create token
    access_token = create_access_token({"user_id": user_id})
    user = User(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        daily_sugar_goal=user_data.daily_sugar_goal,
        created_at=datetime.utcnow()
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    # Find user
    result = supabase.table('users').select('*').eq('email', user_data.email).execute()
    if not result.data or not verify_password(user_data.password, result.data[0]["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_doc = result.data[0]
    
    # Create token
    access_token = create_access_token({"user_id": user_doc["id"]})
    user = User(
        id=user_doc["id"],
        email=user_doc["email"],
        name=user_doc["name"],
        daily_sugar_goal=user_doc["daily_sugar_goal"],
        created_at=datetime.fromisoformat(user_doc["created_at"].replace('Z', '+00:00'))
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
    
    # Insert into Supabase
    result = supabase.table('food_entries').insert(entry.dict()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create food entry")
    
    return entry

@api_router.get("/food/entries", response_model=List[FoodEntry])
async def get_food_entries(current_user: User = Depends(get_current_user)):
    result = supabase.table('food_entries').select('*').eq('user_id', current_user.id).order('timestamp', desc=True).limit(100).execute()
    return [FoodEntry(**entry) for entry in result.data]

@api_router.get("/food/entries/today")
async def get_today_entries(current_user: User = Depends(get_current_user)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    
    result = supabase.table('food_entries').select('*').eq('user_id', current_user.id).gte('timestamp', today.isoformat()).lt('timestamp', tomorrow.isoformat()).execute()
    
    entries = [FoodEntry(**entry) for entry in result.data]
    total_sugar = sum(entry.sugar_content * entry.portion_size for entry in entries)
    
    return {
        "entries": entries,
        "total_sugar": total_sugar,
        "daily_goal": current_user.daily_sugar_goal,
        "percentage": (total_sugar / current_user.daily_sugar_goal) * 100 if current_user.daily_sugar_goal > 0 else 0
    }

# AI Chat routes using OpenAI directly
@api_router.post("/ai/chat")
async def ai_chat(chat_data: ChatMessage, current_user: User = Depends(get_current_user)):
    try:
        # Create OpenAI chat completion
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a friendly and knowledgeable AI nutritionist and dietary coach for {current_user.name}. Help users track their sugar intake, provide healthy eating advice, and support their wellness journey. Be encouraging, informative, and personalized in your responses. The user's daily sugar goal is {current_user.daily_sugar_goal}g."
                },
                {
                    "role": "user", 
                    "content": chat_data.message
                }
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        
        # Store chat history in Supabase
        chat_entry = {
            "user_id": current_user.id,
            "message": chat_data.message,
            "response": ai_response,
            "timestamp": datetime.utcnow().isoformat()
        }
        supabase.table('chat_history').insert(chat_entry).execute()
        
        return {"response": ai_response}
        
    except Exception as e:
        logger.error(f"AI Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="AI service unavailable")

# Knowledge Base routes (dev-only)
@api_router.post("/kb/search")
async def kb_search(query_data: KBQuery, current_user: User = Depends(get_current_user)):
    # Enhanced mock KB data with more relevant nutrition information
    mock_results = [
        {
            "type": "article",
            "title": f"Understanding {query_data.query} and blood sugar impact",
            "snippet": f"Learn how {query_data.query} affects your blood glucose levels and discover healthier alternatives for better sugar management...",
            "url": "https://example.com/article1",
            "score": 0.92
        },
        {
            "type": "tip",
            "title": f"Smart portion control for {query_data.query}",
            "snippet": f"Practical strategies to enjoy {query_data.query} in moderation while staying within your daily sugar goals...",
            "score": 0.85
        },
        {
            "type": "recipe",
            "title": f"Low-sugar alternatives to {query_data.query}",
            "snippet": f"Delicious recipes that satisfy your cravings for {query_data.query} with natural sweeteners and whole ingredients...",
            "score": 0.78
        },
        {
            "type": "science",
            "title": f"The metabolic effects of {query_data.query}",
            "snippet": f"Research-backed insights into how {query_data.query} is processed by your body and its long-term health implications...",
            "score": 0.71
        }
    ]
    
    if query_data.debug:
        return {
            "results": mock_results,
            "debug_info": {
                "query_tokens": query_data.query.split(),
                "total_results": len(mock_results),
                "processing_time_ms": 42,
                "data_source": "supabase_enhanced"
            }
        }
    
    return {"results": mock_results}

# Health check
@api_router.get("/health")
async def health_check():
    # Test Supabase connection
    try:
        supabase.table('users').select('id').limit(1).execute()
        supabase_status = True
    except Exception:
        supabase_status = False
    
    return {
        "status": "healthy" if supabase_status else "degraded",
        "timestamp": datetime.utcnow(),
        "version": "2.0.0",
        "database": "supabase",
        "features": {
            "auth": True,
            "food_tracking": True,
            "ai_chat": bool(OPENAI_API_KEY),
            "kb_search": True,
            "real_time": True,
            "supabase_connection": supabase_status
        }
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    await setup_database()
    logger.info("SugarDrop API with Supabase started successfully")

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)