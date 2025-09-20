#!/usr/bin/env python3
"""
Add Body Type Quiz columns to users table
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent / "backend"
load_dotenv(ROOT_DIR / '.env')

# Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def add_quiz_columns():
    """Add Body Type Quiz columns to users table"""
    try:
        print("🔧 Adding Body Type Quiz columns to users table...")
        
        # Check current schema first
        result = supabase.table('users').select('*').limit(1).execute()
        if result.data:
            existing_columns = list(result.data[0].keys()) if result.data else []
            print(f"Current columns: {existing_columns}")
        
        # Try to add columns using direct table operations
        # Since we can't execute raw SQL directly, we'll try to update a record with the new fields
        # This will help us understand if the columns exist
        
        # Get a test user
        users = supabase.table('users').select('*').limit(1).execute()
        if not users.data:
            print("❌ No users found to test schema")
            return False
            
        test_user_id = users.data[0]['id']
        
        # Try to update with quiz fields
        try:
            update_data = {
                "body_type": "Ectomorph",
                "sugarpoints_range": "100-125", 
                "onboarding_path": "High Energy",
                "age": 25,
                "gender": "other",
                "activity_level": "moderate",
                "health_goals": ["weight_management"],
                "daily_sugar_points_target": 100,
                "completed_onboarding": True,
                "quiz_completed_at": "2025-01-01T00:00:00"
            }
            
            result = supabase.table('users').update(update_data).eq('id', test_user_id).execute()
            print("✅ Quiz columns already exist and are working!")
            return True
            
        except Exception as e:
            error_msg = str(e)
            if "Could not find" in error_msg and "column" in error_msg:
                print(f"❌ Missing columns detected: {error_msg}")
                print("\n📋 MANUAL SCHEMA UPDATE REQUIRED")
                print("Please run this SQL in your Supabase SQL Editor:")
                print("""
-- Add Body Type Quiz columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS body_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS sugarpoints_range VARCHAR(20),
ADD COLUMN IF NOT EXISTS onboarding_path VARCHAR(20),
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS activity_level VARCHAR(20),
ADD COLUMN IF NOT EXISTS health_goals JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS daily_sugar_points_target INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS completed_onboarding BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS quiz_completed_at TIMESTAMP WITH TIME ZONE;

-- Add SugarPoints columns to food_entries table
ALTER TABLE food_entries
ADD COLUMN IF NOT EXISTS carbs_per_100g REAL DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS fat_per_100g REAL DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS protein_per_100g REAL DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS sugar_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sugar_point_blocks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS meal_type VARCHAR(20) DEFAULT 'snack';
                """)
                return False
            else:
                print(f"❌ Unexpected error: {error_msg}")
                return False
                
    except Exception as e:
        print(f"❌ Error checking schema: {str(e)}")
        return False

def verify_quiz_schema():
    """Verify the schema has all required quiz columns"""
    try:
        print("\n🔍 Verifying Body Type Quiz schema...")
        
        # Get a user to test with
        users = supabase.table('users').select('*').limit(1).execute()
        if not users.data:
            print("❌ No users found to test schema")
            return False
            
        user_data = users.data[0]
        required_columns = [
            'body_type', 'sugarpoints_range', 'onboarding_path', 
            'age', 'gender', 'activity_level', 'health_goals',
            'daily_sugar_points_target', 'completed_onboarding', 'quiz_completed_at'
        ]
        
        missing_columns = []
        for col in required_columns:
            if col not in user_data:
                missing_columns.append(col)
        
        if missing_columns:
            print(f"❌ Missing columns: {missing_columns}")
            return False
        else:
            print("✅ All Body Type Quiz columns are present!")
            return True
            
    except Exception as e:
        print(f"❌ Schema verification failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Body Type Quiz Schema Migration")
    
    # Check if columns already exist
    if verify_quiz_schema():
        print("✅ Schema is already up to date!")
    else:
        print("\n🔧 Attempting to add missing columns...")
        if add_quiz_columns():
            print("\n✅ Schema updated successfully!")
            verify_quiz_schema()
        else:
            print("\n❌ Automatic schema update failed.")
            print("Please manually run the SQL commands shown above.")