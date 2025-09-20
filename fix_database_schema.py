#!/usr/bin/env python3
"""
Fix database schema by adding meal_type column to food_entries table
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

def add_meal_type_column():
    """Add meal_type column to food_entries table"""
    try:
        # Execute SQL to add meal_type column
        result = supabase.rpc('exec_sql', {
            'sql': """
            ALTER TABLE food_entries 
            ADD COLUMN IF NOT EXISTS meal_type VARCHAR(20) DEFAULT 'snack';
            """
        }).execute()
        
        print("✅ Successfully added meal_type column to food_entries table")
        return True
        
    except Exception as e:
        print(f"❌ Error adding meal_type column: {str(e)}")
        
        # Try alternative approach using direct SQL execution
        try:
            # Use the SQL editor approach
            sql_query = "ALTER TABLE food_entries ADD COLUMN IF NOT EXISTS meal_type VARCHAR(20) DEFAULT 'snack';"
            
            # This might not work directly, but let's try
            result = supabase.postgrest.rpc('exec_sql', {'sql': sql_query}).execute()
            print("✅ Successfully added meal_type column using alternative method")
            return True
            
        except Exception as e2:
            print(f"❌ Alternative method also failed: {str(e2)}")
            print("⚠️  You may need to manually add the column in Supabase dashboard:")
            print("   SQL: ALTER TABLE food_entries ADD COLUMN meal_type VARCHAR(20) DEFAULT 'snack';")
            return False

def verify_schema():
    """Verify the schema has the meal_type column"""
    try:
        # Try to query the table structure
        result = supabase.table('food_entries').select('*').limit(1).execute()
        print("✅ food_entries table is accessible")
        
        # Check if we can insert with meal_type
        test_entry = {
            "id": "test-schema-check",
            "user_id": "test-user",
            "name": "Test Food",
            "sugar_content": 5.0,
            "portion_size": 1.0,
            "meal_type": "breakfast",
            "timestamp": "2025-01-01T00:00:00"
        }
        
        # This will fail if meal_type column doesn't exist
        result = supabase.table('food_entries').insert(test_entry).execute()
        
        # Clean up test entry
        supabase.table('food_entries').delete().eq('id', 'test-schema-check').execute()
        
        print("✅ meal_type column is working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Schema verification failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔧 Fixing database schema for meal categorization...")
    
    # First verify current state
    print("\n1. Verifying current schema...")
    if verify_schema():
        print("✅ Schema is already correct!")
    else:
        print("\n2. Adding meal_type column...")
        if add_meal_type_column():
            print("\n3. Verifying updated schema...")
            verify_schema()
        else:
            print("❌ Failed to update schema automatically")
            print("Please manually run this SQL in Supabase dashboard:")
            print("ALTER TABLE food_entries ADD COLUMN meal_type VARCHAR(20) DEFAULT 'snack';")