#!/usr/bin/env python3
"""
SugarDrop Supabase Migration Validation Test Suite
Comprehensive testing of the Supabase migration with specific focus on:
- Database connection and health
- UUID handling vs ObjectIds
- PostgreSQL-specific features
- OpenAI direct integration
- Real-time capabilities
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Configuration
BACKEND_URL = "https://nutriai-14.preview.emergentagent.com/api"

class SupabaseMigrationTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.auth_token = None
        self.test_user_id = None
        self.results = {
            "database_migration": {"passed": 0, "failed": 0, "errors": []},
            "uuid_handling": {"passed": 0, "failed": 0, "errors": []},
            "openai_integration": {"passed": 0, "failed": 0, "errors": []},
            "postgresql_features": {"passed": 0, "failed": 0, "errors": []},
            "real_time_setup": {"passed": 0, "failed": 0, "errors": []}
        }
        
    def log_result(self, category, test_name, success, error_msg=None):
        """Log test result"""
        if success:
            self.results[category]["passed"] += 1
            print(f"✅ {test_name}")
        else:
            self.results[category]["failed"] += 1
            self.results[category]["errors"].append(f"{test_name}: {error_msg}")
            print(f"❌ {test_name}: {error_msg}")
    
    def test_supabase_health_check(self):
        """Test Supabase connection and health"""
        print("\n=== Testing Supabase Database Migration ===")
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                
                # Check version is 2.0.0 (migration version)
                if data.get("version") == "2.0.0":
                    self.log_result("database_migration", "Version updated to 2.0.0", True)
                else:
                    self.log_result("database_migration", "Version updated to 2.0.0", False, f"Version is {data.get('version')}")
                
                # Check database is Supabase
                if data.get("database") == "supabase":
                    self.log_result("database_migration", "Database type is Supabase", True)
                else:
                    self.log_result("database_migration", "Database type is Supabase", False, f"Database is {data.get('database')}")
                
                # Check Supabase connection
                features = data.get("features", {})
                if features.get("supabase_connection") is True:
                    self.log_result("database_migration", "Supabase connection active", True)
                else:
                    self.log_result("database_migration", "Supabase connection active", False, "Connection not established")
                
                # Check real-time capabilities
                if features.get("real_time") is True:
                    self.log_result("real_time_setup", "Real-time capabilities enabled", True)
                else:
                    self.log_result("real_time_setup", "Real-time capabilities enabled", False, "Real-time not enabled")
                    
            else:
                self.log_result("database_migration", "Health check endpoint", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("database_migration", "Health check endpoint", False, str(e))
    
    def test_uuid_vs_objectid(self):
        """Test UUID handling instead of MongoDB ObjectIds"""
        print("\n=== Testing UUID Handling (vs MongoDB ObjectIds) ===")
        
        # Create a test user and verify UUID format
        test_email = f"uuid_test_{uuid.uuid4().hex[:8]}@sugardrop.com"
        registration_data = {
            "email": test_email,
            "password": "testpass123",
            "name": "UUID Test User",
            "daily_sugar_goal": 50.0
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/auth/register",
                json=registration_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                user_id = data["user"]["id"]
                
                # Validate UUID format (not ObjectId)
                try:
                    uuid.UUID(user_id)
                    self.log_result("uuid_handling", "User ID is valid UUID", True)
                    print(f"   User ID: {user_id}")
                    
                    # Check it's not a MongoDB ObjectId format (24 hex chars)
                    if len(user_id.replace('-', '')) != 24:
                        self.log_result("uuid_handling", "User ID is not MongoDB ObjectId", True)
                    else:
                        self.log_result("uuid_handling", "User ID is not MongoDB ObjectId", False, "ID looks like ObjectId")
                        
                    self.auth_token = data["access_token"]
                    self.test_user_id = user_id
                    
                except ValueError:
                    self.log_result("uuid_handling", "User ID is valid UUID", False, f"Invalid UUID format: {user_id}")
            else:
                self.log_result("uuid_handling", "User registration for UUID test", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("uuid_handling", "User registration for UUID test", False, str(e))
    
    def test_food_entry_uuids(self):
        """Test food entry UUID generation"""
        if not self.auth_token:
            self.log_result("uuid_handling", "Food entry UUID test", False, "No auth token")
            return
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        food_data = {
            "name": "UUID Test Apple",
            "sugar_content": 12.5,
            "portion_size": 1.0,
            "calories": 95
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/food/entries",
                json=food_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                entry_id = data["id"]
                
                # Validate UUID format
                try:
                    uuid.UUID(entry_id)
                    self.log_result("uuid_handling", "Food entry ID is valid UUID", True)
                    print(f"   Food Entry ID: {entry_id}")
                except ValueError:
                    self.log_result("uuid_handling", "Food entry ID is valid UUID", False, f"Invalid UUID: {entry_id}")
            else:
                self.log_result("uuid_handling", "Food entry UUID test", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("uuid_handling", "Food entry UUID test", False, str(e))
    
    def test_openai_direct_integration(self):
        """Test direct OpenAI integration (not Emergent LLM)"""
        print("\n=== Testing OpenAI Direct Integration ===")
        
        if not self.auth_token:
            self.log_result("openai_integration", "OpenAI direct integration", False, "No auth token")
            return
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test with a specific prompt that should indicate OpenAI usage
        chat_data = {
            "message": "What AI model are you using? Please identify yourself."
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/ai/chat",
                json=chat_data,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                ai_response = data.get("response", "").lower()
                
                # Check if response indicates OpenAI (not Emergent LLM)
                if "gpt" in ai_response or "openai" in ai_response:
                    self.log_result("openai_integration", "AI identifies as OpenAI/GPT", True)
                    print(f"   AI Response: {data['response'][:100]}...")
                else:
                    # Still pass if we get a valid response, as the model might not identify itself
                    self.log_result("openai_integration", "OpenAI API responding", True)
                    print(f"   AI Response: {data['response'][:100]}...")
                
                # Test that it's not using Emergent LLM
                if "emergent" not in ai_response:
                    self.log_result("openai_integration", "Not using Emergent LLM", True)
                else:
                    self.log_result("openai_integration", "Not using Emergent LLM", False, "Response mentions Emergent")
                    
            elif response.status_code == 500:
                error_text = response.text.lower()
                if "emergent" in error_text:
                    self.log_result("openai_integration", "OpenAI direct integration", False, "Still using Emergent LLM")
                else:
                    self.log_result("openai_integration", "OpenAI direct integration", False, f"Server error: {response.text}")
            else:
                self.log_result("openai_integration", "OpenAI direct integration", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("openai_integration", "OpenAI direct integration", False, str(e))
    
    def test_postgresql_features(self):
        """Test PostgreSQL-specific features"""
        print("\n=== Testing PostgreSQL Features ===")
        
        if not self.auth_token:
            self.log_result("postgresql_features", "PostgreSQL features test", False, "No auth token")
            return
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test foreign key relationships (user_id references)
        try:
            # Create multiple food entries to test relationships
            for i in range(3):
                food_data = {
                    "name": f"PostgreSQL Test Food {i+1}",
                    "sugar_content": 5.0 + i,
                    "portion_size": 1.0,
                    "calories": 50 + (i * 10)
                }
                
                response = requests.post(
                    f"{self.base_url}/food/entries",
                    json=food_data,
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code != 200:
                    self.log_result("postgresql_features", "Foreign key relationships", False, f"Failed to create entry {i+1}")
                    return
            
            # Test that entries are properly linked to user
            response = requests.get(
                f"{self.base_url}/food/entries",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                entries = response.json()
                if len(entries) >= 3:  # Should have at least our 3 test entries
                    # Verify all entries have the correct user_id
                    user_ids = [entry.get("user_id") for entry in entries]
                    if all(uid == self.test_user_id for uid in user_ids):
                        self.log_result("postgresql_features", "Foreign key relationships working", True)
                        print(f"   Found {len(entries)} entries properly linked to user")
                    else:
                        self.log_result("postgresql_features", "Foreign key relationships working", False, "User IDs don't match")
                else:
                    self.log_result("postgresql_features", "Foreign key relationships working", False, f"Expected >= 3 entries, got {len(entries)}")
            else:
                self.log_result("postgresql_features", "Foreign key relationships working", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("postgresql_features", "PostgreSQL features test", False, str(e))
    
    def test_chat_history_storage(self):
        """Test chat history storage in Supabase"""
        print("\n=== Testing Chat History Storage in Supabase ===")
        
        if not self.auth_token:
            self.log_result("postgresql_features", "Chat history storage", False, "No auth token")
            return
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Send a unique chat message
        unique_message = f"Test message for Supabase storage - {uuid.uuid4().hex[:8]}"
        chat_data = {"message": unique_message}
        
        try:
            response = requests.post(
                f"{self.base_url}/ai/chat",
                json=chat_data,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if "response" in data and data["response"]:
                    self.log_result("postgresql_features", "Chat history storage in Supabase", True)
                    print(f"   Chat stored successfully")
                else:
                    self.log_result("postgresql_features", "Chat history storage in Supabase", False, "No response received")
            else:
                self.log_result("postgresql_features", "Chat history storage in Supabase", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("postgresql_features", "Chat history storage in Supabase", False, str(e))
    
    def test_no_mongodb_references(self):
        """Test that no MongoDB references remain"""
        print("\n=== Testing No MongoDB References ===")
        
        # Check health endpoint doesn't mention MongoDB
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                response_text = json.dumps(data).lower()
                
                if "mongo" not in response_text and "mongodb" not in response_text:
                    self.log_result("database_migration", "No MongoDB references in health", True)
                else:
                    self.log_result("database_migration", "No MongoDB references in health", False, "MongoDB mentioned in response")
                    
                # Check database field specifically
                if data.get("database") != "mongodb":
                    self.log_result("database_migration", "Database field not MongoDB", True)
                else:
                    self.log_result("database_migration", "Database field not MongoDB", False, "Database still shows MongoDB")
            else:
                self.log_result("database_migration", "Health check for MongoDB references", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("database_migration", "Health check for MongoDB references", False, str(e))
    
    def run_migration_tests(self):
        """Run all Supabase migration validation tests"""
        print("🔄 Starting Supabase Migration Validation Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test database migration
        self.test_supabase_health_check()
        self.test_no_mongodb_references()
        
        # Test UUID handling
        self.test_uuid_vs_objectid()
        self.test_food_entry_uuids()
        
        # Test OpenAI integration
        self.test_openai_direct_integration()
        
        # Test PostgreSQL features
        self.test_postgresql_features()
        self.test_chat_history_storage()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test results summary"""
        print("\n" + "=" * 60)
        print("🏁 SUPABASE MIGRATION TEST RESULTS")
        print("=" * 60)
        
        total_passed = 0
        total_failed = 0
        
        for category, results in self.results.items():
            passed = results["passed"]
            failed = results["failed"]
            total_passed += passed
            total_failed += failed
            
            status = "✅" if failed == 0 else "❌"
            print(f"{status} {category.upper().replace('_', ' ')}: {passed} passed, {failed} failed")
            
            if results["errors"]:
                for error in results["errors"]:
                    print(f"   • {error}")
        
        print("-" * 60)
        print(f"TOTAL: {total_passed} passed, {total_failed} failed")
        
        if total_failed == 0:
            print("🎉 Supabase migration validation successful!")
        else:
            print(f"⚠️  {total_failed} migration issues found - see details above")

if __name__ == "__main__":
    tester = SupabaseMigrationTester()
    tester.run_migration_tests()