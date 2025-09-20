#!/usr/bin/env python3
"""
Verify Body Type Quiz Database Migration
Tests if the new columns exist and can store quiz results
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def verify_migration():
    """Verify the Body Type Quiz database migration was successful"""
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("❌ Missing Supabase credentials in .env file")
        return False
    
    try:
        # Initialize Supabase client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print("✅ Connected to Supabase")
        
        print("\n🔍 Verifying Body Type Quiz columns...")
        
        # Test if new columns exist by trying to query them
        result = supabase.table('users').select('body_type, sugarpoints_range, onboarding_path, age, gender, activity_level, health_goals, daily_sugar_points_target, completed_onboarding').limit(1).execute()
        
        if result.data is not None:
            print("✅ All Body Type Quiz columns exist and are accessible!")
            print("✅ Migration verification successful")
            
            # Show column structure
            if len(result.data) > 0:
                user = result.data[0]
                print("\n📋 Available columns:")
                for key, value in user.items():
                    if key in ['body_type', 'sugarpoints_range', 'onboarding_path', 'age', 'gender', 'activity_level', 'health_goals', 'daily_sugar_points_target', 'completed_onboarding']:
                        print(f"   ✅ {key}: {value if value is not None else '(null)'}")
            
            return True
        else:
            print("❌ Migration verification failed - no data returned")
            return False
            
    except Exception as e:
        error_msg = str(e)
        if 'column' in error_msg and 'does not exist' in error_msg:
            print("❌ Migration not yet executed - columns missing")
            print(f"   Error: {error_msg}")
            print("\n📋 Please execute the migration SQL in Supabase dashboard first")
            return False
        else:
            print(f"❌ Verification error: {error_msg}")
            return False

if __name__ == "__main__":
    print("🧬 Body Type Quiz Migration Verification")
    print("=" * 50)
    
    success = verify_migration()
    
    if success:
        print("\n🎉 Database is ready for Body Type Quiz!")
        print("The quiz can now store results permanently.")
    else:
        print("\n⚠️  Migration needed.")
        print("Please run the SQL commands in Supabase dashboard.")
    
    sys.exit(0 if success else 1)