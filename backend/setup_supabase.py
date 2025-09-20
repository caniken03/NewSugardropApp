#!/usr/bin/env python3
"""
Setup script to create Supabase database tables for SugarDrop
Run this script to create the necessary tables in your Supabase database
"""

from supabase import create_client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def create_tables():
    """Create the necessary tables in Supabase"""
    
    print("🚀 Setting up SugarDrop database tables in Supabase...")
    
    # SQL commands to create tables
    create_users_table = """
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR UNIQUE NOT NULL,
        name VARCHAR NOT NULL,
        password VARCHAR NOT NULL,
        daily_sugar_goal REAL DEFAULT 50.0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    create_food_entries_table = """
    CREATE TABLE IF NOT EXISTS food_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        sugar_content REAL NOT NULL,
        portion_size REAL NOT NULL,
        calories REAL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    create_chat_history_table = """
    CREATE TABLE IF NOT EXISTS chat_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    # Create indexes for better performance
    create_indexes = """
    CREATE INDEX IF NOT EXISTS idx_food_entries_user_id ON food_entries(user_id);
    CREATE INDEX IF NOT EXISTS idx_food_entries_timestamp ON food_entries(timestamp);
    CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_history_timestamp ON chat_history(timestamp);
    """
    
    try:
        # Execute SQL commands directly using raw SQL
        print("Creating users table...")
        # Since we can't use RPC, we'll create using Python supabase client
        
        # Alternative approach: Create tables manually in Supabase Dashboard
        print("""
📋 Please create these tables manually in your Supabase Dashboard:

1. Go to https://app.supabase.com/project/qcgtjyhjrzqxaaejzqcc/editor

2. Create the USERS table:
   - id: uuid (primary key, default: gen_random_uuid())
   - email: varchar (unique, not null)
   - name: varchar (not null)
   - password: varchar (not null)
   - daily_sugar_goal: real (default: 50.0)
   - created_at: timestamp with time zone (default: now())

3. Create the FOOD_ENTRIES table:
   - id: uuid (primary key, default: gen_random_uuid())
   - user_id: uuid (foreign key to users.id, cascade delete)
   - name: varchar (not null)
   - sugar_content: real (not null)
   - portion_size: real (not null)
   - calories: real (nullable)
   - timestamp: timestamp with time zone (default: now())

4. Create the CHAT_HISTORY table:
   - id: uuid (primary key, default: gen_random_uuid())
   - user_id: uuid (foreign key to users.id, cascade delete)
   - message: text (not null)
   - response: text (not null)
   - timestamp: timestamp with time zone (default: now())

5. Add these indexes for performance:
   - idx_food_entries_user_id on food_entries(user_id)
   - idx_food_entries_timestamp on food_entries(timestamp)
   - idx_chat_history_user_id on chat_history(user_id)
   - idx_chat_history_timestamp on chat_history(timestamp)

🔧 SQL Commands to run in Supabase SQL Editor:
        """)
        
        print(create_users_table)
        print(create_food_entries_table)
        print(create_chat_history_table)
        print(create_indexes)
        
        print("\n✅ Database setup instructions provided!")
        print("Please run the SQL commands above in your Supabase Dashboard SQL Editor.")
        
    except Exception as e:
        print(f"❌ Error setting up database: {e}")

if __name__ == "__main__":
    create_tables()