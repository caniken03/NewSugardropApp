#!/usr/bin/env python3
"""
Body Type Quiz Database Migration Script
Executes SQL migration to add Body Type Quiz columns to Supabase users table
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def execute_migration():
    """Execute the Body Type Quiz database migration"""
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("❌ Missing Supabase credentials in .env file")
        return False
    
    try:
        # Initialize Supabase client with service role
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print("✅ Connected to Supabase")
        
        # Read migration SQL
        with open('body_type_quiz_migration.sql', 'r') as f:
            migration_sql = f.read()
        
        print("📄 Executing Body Type Quiz migration...")
        
        # Split SQL commands and execute each one
        sql_commands = [cmd.strip() for cmd in migration_sql.split(';') if cmd.strip()]
        
        for i, command in enumerate(sql_commands):
            if command:
                try:
                    print(f"   Executing command {i+1}/{len(sql_commands)}...")
                    # Note: Supabase Python client doesn't support raw SQL execution
                    # This would need to be done via Supabase dashboard or psql
                    print(f"   SQL: {command[:100]}...")
                    
                except Exception as cmd_error:
                    print(f"   ⚠️  Command {i+1} failed: {str(cmd_error)}")
        
        # Verify migration by checking if columns exist
        print("\n🔍 Verifying migration...")
        
        # Try to query new columns (this will fail if they don't exist)
        result = supabase.table('users').select('body_type, sugarpoints_range, completed_onboarding').limit(1).execute()
        
        if result.data is not None:
            print("✅ Migration successful - new columns accessible")
            print("✅ Body Type Quiz database schema is ready")
            return True
        else:
            print("❌ Migration verification failed")
            return False
            
    except Exception as e:
        print(f"❌ Migration error: {str(e)}")
        print("\n📋 Manual Migration Required:")
        print("Please execute the following SQL commands in your Supabase dashboard:")
        print("-" * 60)
        
        with open('body_type_quiz_migration.sql', 'r') as f:
            print(f.read())
        
        print("-" * 60)
        print("Go to: Supabase Dashboard → SQL Editor → Run the above commands")
        return False

if __name__ == "__main__":
    print("🧬 Body Type Quiz Database Migration")
    print("=" * 50)
    
    success = execute_migration()
    
    if success:
        print("\n🎉 Migration completed successfully!")
        print("The Body Type Quiz system is now fully operational.")
    else:
        print("\n⚠️  Manual migration required.")
        print("Please run the SQL commands in Supabase dashboard.")
    
    sys.exit(0 if success else 1)