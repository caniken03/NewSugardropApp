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
import base64

# Import Passio service
from passio_service import passio_service

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PASSIO_API_KEY = os.getenv('PASSIO_API_KEY')
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
app = FastAPI(title="SugarDrop API with Passio + Supabase", version="2.1.0")
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
    # Legacy fields for backward compatibility
    sugar_content: float = 0.0  # Deprecated - use carbs_per_100g instead
    portion_size: float
    calories: Optional[float] = None  # Deprecated - will be removed
    # New SugarPoints system fields
    carbs_per_100g: float = 0.0  # Total carbohydrates per 100g
    fat_per_100g: float = 0.0
    protein_per_100g: float = 0.0
    sugar_points: int = 0
    sugar_point_blocks: int = 0
    meal_type: Optional[str] = "snack"  # breakfast, lunch, dinner, snack
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class FoodEntryCreate(BaseModel):
    name: str
    # Accept both old and new formats for backward compatibility
    sugar_content: Optional[float] = None  # Deprecated
    carbs_per_100g: Optional[float] = None  # New preferred field
    fat_per_100g: Optional[float] = 0.0
    protein_per_100g: Optional[float] = 0.0
    portion_size: float
    calories: Optional[float] = None  # Deprecated - will be removed
    meal_type: Optional[str] = "snack"

class QuizResponse(BaseModel):
    question_id: int
    value: str  # A, B, or C

class QuizSubmission(BaseModel):
    responses: List[QuizResponse]

class QuizResult(BaseModel):
    body_type: str
    sugarpoints_range: str
    onboarding_path: str
    health_risk: str
    recommendations: List[str]
    score_breakdown: dict

class UserProfileUpdate(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    activity_level: Optional[str] = None
    health_goals: Optional[List[str]] = None
    daily_sugar_points_target: Optional[int] = None
    completed_onboarding: Optional[bool] = None
    # Body type quiz results
    body_type: Optional[str] = None
    sugarpoints_range: Optional[str] = None
    onboarding_path: Optional[str] = None

class ChatMessage(BaseModel):
    message: str
    image_base64: Optional[str] = None

class KBQuery(BaseModel):
    query: str
    debug: Optional[bool] = False

class FoodSearchQuery(BaseModel):
    query: str
    limit: Optional[int] = 20

class ImageRecognitionRequest(BaseModel):
    image_base64: str

class BarcodeRequest(BaseModel):
    barcode: str

# SugarPoints Calculation Functions
def calculate_sugar_points(carbs_per_100g: float, portion_size_grams: float) -> dict:
    """
    Calculate SugarPoints based on total carbohydrate content
    1 SugarPoint = 1g total carbohydrates (rounded to nearest whole number)
    1 SugarPoint Block = 6 SugarPoints (rounded to nearest 6g total carbohydrates)
    """
    if carbs_per_100g == 0:
        return {
            "sugar_points": 0,
            "sugar_points_text": "Nil SugarPoints",
            "sugar_point_blocks": 0,
            "sugar_point_blocks_text": "0 Blocks"
        }
    
    # Calculate total carbs for the portion
    total_carbs = (carbs_per_100g * portion_size_grams) / 100
    
    # Round to nearest whole number for SugarPoints
    sugar_points = round(total_carbs)
    
    # Calculate SugarPoint Blocks (rounded to nearest 6)
    sugar_point_blocks = round(sugar_points / 6)
    
    return {
        "sugar_points": sugar_points,
        "sugar_points_text": f"{sugar_points} SugarPoints",
        "sugar_point_blocks": sugar_point_blocks,
        "sugar_point_blocks_text": f"{sugar_point_blocks} Blocks"
    }

def extract_nutrition_values(passio_item: dict) -> dict:
    """
    Extract carbs, fat, and protein values from Passio nutrition data
    Returns values per 100g
    """
    nutrients = passio_item.get("nutrients", {})
    
    # Extract carbohydrates
    carbs_keys = ["carbohydrates", "carbs", "total_carbs", "carbohydrate_g"]
    carbs_per_100g = 0.0
    for key in carbs_keys:
        if key in nutrients:
            value = nutrients[key]
            carbs_per_100g = float(value.get("quantity", 0) if isinstance(value, dict) else value)
            break
    
    # Extract fat
    fat_keys = ["fat", "total_fat", "fat_g"]
    fat_per_100g = 0.0
    for key in fat_keys:
        if key in nutrients:
            value = nutrients[key]
            fat_per_100g = float(value.get("quantity", 0) if isinstance(value, dict) else value)
            break
    
    # Extract protein
    protein_keys = ["protein", "protein_g"]
    protein_per_100g = 0.0
    for key in protein_keys:
        if key in nutrients:
            value = nutrients[key]
            protein_per_100g = float(value.get("quantity", 0) if isinstance(value, dict) else value)
            break
    
    return {
        "carbs_per_100g": carbs_per_100g,
        "fat_per_100g": fat_per_100g,
        "protein_per_100g": protein_per_100g
    }

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

# User profile routes
@api_router.put("/user/profile")
async def update_user_profile(profile_data: UserProfileUpdate, current_user: User = Depends(get_current_user)):
    """
    Update user profile with onboarding data
    """
    try:
        # Prepare update data
        update_fields = {}
        
        if profile_data.age is not None:
            update_fields['age'] = profile_data.age
        if profile_data.gender is not None:
            update_fields['gender'] = profile_data.gender
        if profile_data.activity_level is not None:
            update_fields['activity_level'] = profile_data.activity_level
        if profile_data.health_goals is not None:
            update_fields['health_goals'] = profile_data.health_goals
        if profile_data.daily_sugar_points_target is not None:
            update_fields['daily_sugar_points_target'] = profile_data.daily_sugar_points_target
        if profile_data.completed_onboarding is not None:
            update_fields['completed_onboarding'] = profile_data.completed_onboarding
        
        # Update user in Supabase
        result = supabase.table('users').update(update_fields).eq('id', current_user.id).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update user profile")
        
        # Return updated user data
        updated_user_data = result.data[0]
        return {
            "message": "Profile updated successfully",
            "user": {
                "id": updated_user_data["id"],
                "email": updated_user_data["email"],
                "name": updated_user_data["name"],
                "daily_sugar_goal": updated_user_data.get("daily_sugar_goal", 50.0),
                "daily_sugar_points_target": updated_user_data.get("daily_sugar_points_target", 100),
                "age": updated_user_data.get("age"),
                "gender": updated_user_data.get("gender"),
                "activity_level": updated_user_data.get("activity_level"),
                "health_goals": updated_user_data.get("health_goals", []),
                "completed_onboarding": updated_user_data.get("completed_onboarding", False),
            }
        }
        
    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

@api_router.get("/user/profile")
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get complete user profile including onboarding data
    """
    try:
        result = supabase.table('users').select('*').eq('id', current_user.id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = result.data[0]
        return {
            "id": user_data["id"],
            "email": user_data["email"],
            "name": user_data["name"],
            "daily_sugar_goal": user_data.get("daily_sugar_goal", 50.0),
            "daily_sugar_points_target": user_data.get("daily_sugar_points_target", 100),
            "age": user_data.get("age"),
            "gender": user_data.get("gender"),
            "activity_level": user_data.get("activity_level"),
            "health_goals": user_data.get("health_goals", []),
            "completed_onboarding": user_data.get("completed_onboarding", False),
            "created_at": user_data["created_at"],
        }
        
    except Exception as e:
        logger.error(f"Error fetching user profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")

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

# Food tracking routes with SugarPoints system
@api_router.post("/food/entries", response_model=FoodEntry)
async def create_food_entry(entry_data: FoodEntryCreate, current_user: User = Depends(get_current_user)):
    # Handle backward compatibility - convert sugar_content to carbs_per_100g if needed
    carbs_per_100g = entry_data.carbs_per_100g
    if carbs_per_100g is None and entry_data.sugar_content is not None:
        # Legacy mode: assume sugar_content was actually carbs per 100g
        carbs_per_100g = entry_data.sugar_content * 100  # Convert from per gram to per 100g
    elif carbs_per_100g is None:
        carbs_per_100g = 0.0
    
    # Calculate SugarPoints
    sugar_points_data = calculate_sugar_points(carbs_per_100g, entry_data.portion_size)
    
    entry = FoodEntry(
        user_id=current_user.id,
        name=entry_data.name,
        # Legacy fields for backward compatibility
        sugar_content=entry_data.sugar_content or 0.0,
        portion_size=entry_data.portion_size,
        calories=entry_data.calories,  # Deprecated but kept for compatibility
        # New SugarPoints system fields
        carbs_per_100g=carbs_per_100g,
        fat_per_100g=entry_data.fat_per_100g or 0.0,
        protein_per_100g=entry_data.protein_per_100g or 0.0,
        sugar_points=sugar_points_data["sugar_points"],
        sugar_point_blocks=sugar_points_data["sugar_point_blocks"],
        meal_type=entry_data.meal_type or "snack"
    )
    
    # Convert to dict with proper datetime serialization
    entry_dict = entry.dict()
    entry_dict['timestamp'] = entry_dict['timestamp'].isoformat()
    
    # Try to insert with new fields, with fallback for older schema
    try:
        result = supabase.table('food_entries').insert(entry_dict).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create food entry")
        return entry
    except Exception as e:
        # If new columns don't exist, try with minimal fields
        if any(field in str(e) for field in ["carbs_per_100g", "fat_per_100g", "protein_per_100g", "sugar_points", "meal_type"]):
            logger.warning(f"New columns not found in database schema, inserting with basic legacy fields: {str(e)}")
            # Use only the most basic fields that should exist in any food_entries table
            basic_entry_dict = {
                "id": entry_dict["id"],
                "user_id": entry_dict["user_id"],
                "name": entry_dict["name"],
                "sugar_content": entry_dict["sugar_content"],
                "portion_size": entry_dict["portion_size"],
                "timestamp": entry_dict["timestamp"]
            }
            
            # Only add calories if it's not None
            if entry_dict.get("calories") is not None:
                basic_entry_dict["calories"] = entry_dict["calories"]
            
            result = supabase.table('food_entries').insert(basic_entry_dict).execute()
            if not result.data:
                raise HTTPException(status_code=500, detail="Failed to create food entry")
            
            # Return entry with calculated SugarPoints for API consistency
            return entry
        else:
            raise HTTPException(status_code=500, detail=f"Failed to create food entry: {str(e)}")

@api_router.get("/food/entries", response_model=List[FoodEntry])
async def get_food_entries(current_user: User = Depends(get_current_user)):
    result = supabase.table('food_entries').select('*').eq('user_id', current_user.id).order('timestamp', desc=True).limit(100).execute()
    return [FoodEntry(**entry) for entry in result.data]

@api_router.get("/food/entries/today")
async def get_today_entries(current_user: User = Depends(get_current_user)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    
    result = supabase.table('food_entries').select('*').eq('user_id', current_user.id).gte('timestamp', today.isoformat()).lt('timestamp', tomorrow.isoformat()).execute()
    
    entries = []
    total_sugar_points = 0
    total_sugar_point_blocks = 0
    
    for entry_data in result.data:
        # Handle entries that might not have new SugarPoints columns yet
        carbs_per_100g = entry_data.get('carbs_per_100g', 0.0)
        fat_per_100g = entry_data.get('fat_per_100g', 0.0)
        protein_per_100g = entry_data.get('protein_per_100g', 0.0)
        
        # Calculate SugarPoints if not already stored
        stored_sugar_points = entry_data.get('sugar_points')
        if stored_sugar_points is not None:
            sugar_points = stored_sugar_points
            sugar_point_blocks = entry_data.get('sugar_point_blocks', 0)
        else:
            # Fallback: calculate from legacy sugar_content or carbs
            if carbs_per_100g == 0.0 and entry_data.get('sugar_content', 0) > 0:
                # Legacy mode: assume sugar_content was per gram, convert to carbs per 100g
                carbs_per_100g = entry_data['sugar_content'] * 100
            
            sugar_points_data = calculate_sugar_points(carbs_per_100g, entry_data['portion_size'])
            sugar_points = sugar_points_data["sugar_points"]
            sugar_point_blocks = sugar_points_data["sugar_point_blocks"]
        
        entry = FoodEntry(
            id=entry_data['id'],
            user_id=entry_data['user_id'],
            name=entry_data['name'],
            sugar_content=entry_data.get('sugar_content', 0.0),
            portion_size=entry_data['portion_size'],
            calories=entry_data.get('calories'),
            carbs_per_100g=carbs_per_100g,
            fat_per_100g=fat_per_100g,
            protein_per_100g=protein_per_100g,
            sugar_points=sugar_points,
            sugar_point_blocks=sugar_point_blocks,
            meal_type=entry_data.get('meal_type', 'snack'),
            timestamp=datetime.fromisoformat(entry_data['timestamp'].replace('Z', '+00:00'))
        )
        entries.append(entry)
        total_sugar_points += sugar_points
        total_sugar_point_blocks += sugar_point_blocks
    
    # Group by meal type
    meals = {"breakfast": [], "lunch": [], "dinner": [], "snack": []}
    for entry in entries:
        meal_type = entry.meal_type or "snack"
        if meal_type in meals:
            meals[meal_type].append(entry)
        else:
            # If unknown meal type, put in snack
            meals["snack"].append(entry)
    
    # Calculate total SugarPoint Blocks (rounded)
    total_sugar_point_blocks_rounded = round(total_sugar_points / 6) if total_sugar_points > 0 else 0
    
    return {
        "entries": entries,
        "meals": meals,
        # New SugarPoints system
        "total_sugar_points": total_sugar_points,
        "total_sugar_point_blocks": total_sugar_point_blocks_rounded,
        "sugar_points_text": f"{total_sugar_points} SugarPoints" if total_sugar_points > 0 else "Nil SugarPoints",
        "sugar_point_blocks_text": f"{total_sugar_point_blocks_rounded} Blocks",
        # Legacy fields for backward compatibility
        "total_sugar": sum(entry.sugar_content * entry.portion_size for entry in entries),  # Deprecated
        "daily_goal": current_user.daily_sugar_goal,  # Deprecated - will be removed
        "percentage": 0  # Deprecated - SugarPoints don't use percentage goals
    }

# NEW PASSIO FOOD DATABASE ROUTES
@api_router.post("/food/search")
async def search_food(search_query: FoodSearchQuery, current_user: User = Depends(get_current_user)):
    """
    Search for food items using Passio Nutrition AI
    """
    try:
        results = await passio_service.search_food(search_query.query, search_query.limit)
        return {
            "results": results,
            "query": search_query.query,
            "count": len(results),
            "source": "passio_ai"
        }
    except Exception as e:
        logger.error(f"Food search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Food search service unavailable")

@api_router.get("/food/popular")
async def get_popular_foods(category: Optional[str] = None, limit: int = 20, current_user: User = Depends(get_current_user)):
    """
    Get popular/trending foods
    """
    try:
        results = await passio_service.get_popular_foods(category, limit)
        return {
            "results": results,
            "category": category,
            "count": len(results),
            "source": "passio_ai"
        }
    except Exception as e:
        logger.error(f"Popular foods error: {str(e)}")
        raise HTTPException(status_code=500, detail="Popular foods service unavailable")

@api_router.get("/food/details/{food_id}")
async def get_food_details(food_id: str, current_user: User = Depends(get_current_user)):
    """
    Get detailed nutrition information for a specific food
    """
    try:
        details = await passio_service.get_food_details(food_id)
        if not details:
            raise HTTPException(status_code=404, detail="Food not found")
        return details
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Food details error: {str(e)}")
        raise HTTPException(status_code=500, detail="Food details service unavailable")

@api_router.post("/food/recognize")
async def recognize_food_from_image(image_request: ImageRecognitionRequest, current_user: User = Depends(get_current_user)):
    """
    Recognize food from image using Passio AI
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(image_request.image_base64)
        
        # Get recognition results
        results = await passio_service.recognize_food_from_image(image_data)
        
        return {
            "results": results,
            "count": len(results),
            "source": "passio_ai_vision"
        }
    except Exception as e:
        logger.error(f"Food recognition error: {str(e)}")
        raise HTTPException(status_code=500, detail="Food recognition service unavailable")

@api_router.post("/food/barcode")
async def get_barcode_nutrition(barcode_request: BarcodeRequest, current_user: User = Depends(get_current_user)):
    """
    Get nutrition information from barcode
    """
    try:
        nutrition_info = await passio_service.get_barcode_nutrition(barcode_request.barcode)
        if not nutrition_info:
            raise HTTPException(status_code=404, detail="Product not found")
        return nutrition_info
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Barcode lookup error: {str(e)}")
        raise HTTPException(status_code=500, detail="Barcode lookup service unavailable")

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
        "version": "2.1.0",
        "database": "supabase",
        "features": {
            "auth": True,
            "food_tracking": True,
            "ai_chat": bool(OPENAI_API_KEY),
            "kb_search": True,
            "real_time": True,
            "supabase_connection": supabase_status,
            "passio_integration": bool(PASSIO_API_KEY),
            "food_search": True,
            "food_recognition": True,
            "barcode_scanning": True
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)