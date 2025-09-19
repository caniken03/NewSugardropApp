#!/usr/bin/env python3
"""
SugarDrop Backend API Test Suite
Tests all backend endpoints comprehensively
"""

import requests
import json
import os
from datetime import datetime
import uuid

# Configuration
BACKEND_URL = "https://sugar-tracker-app-1.preview.emergentagent.com/api"
TEST_USER_EMAIL = "demo@sugardrop.com"
TEST_USER_PASSWORD = "demo123"
TEST_USER_NAME = "Demo User"

class SugarDropAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.auth_token = None
        self.test_results = {
            "authentication": {"passed": 0, "failed": 0, "errors": []},
            "food_tracking": {"passed": 0, "failed": 0, "errors": []},
            "ai_chat": {"passed": 0, "failed": 0, "errors": []},
            "knowledge_base": {"passed": 0, "failed": 0, "errors": []},
            "health_check": {"passed": 0, "failed": 0, "errors": []}
        }
        
    def log_result(self, category, test_name, success, error_msg=None):
        """Log test result"""
        if success:
            self.test_results[category]["passed"] += 1
            print(f"✅ {test_name}")
        else:
            self.test_results[category]["failed"] += 1
            self.test_results[category]["errors"].append(f"{test_name}: {error_msg}")
            print(f"❌ {test_name}: {error_msg}")
    
    def test_health_check(self):
        """Test health check endpoint"""
        print("\n=== Testing Health Check API ===")
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "healthy":
                    self.log_result("health_check", "Health check endpoint", True)
                    print(f"   Features: {data.get('features', {})}")
                else:
                    self.log_result("health_check", "Health check endpoint", False, "Invalid response format")
            else:
                self.log_result("health_check", "Health check endpoint", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("health_check", "Health check endpoint", False, str(e))
    
    def test_user_registration(self):
        """Test user registration"""
        print("\n=== Testing User Registration ===")
        
        # Generate unique email for testing
        test_email = f"test_{uuid.uuid4().hex[:8]}@sugardrop.com"
        
        registration_data = {
            "email": test_email,
            "password": "testpass123",
            "name": "Test User",
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
                if "access_token" in data and "user" in data:
                    self.log_result("authentication", "User registration", True)
                    return data["access_token"]
                else:
                    self.log_result("authentication", "User registration", False, "Missing token or user in response")
            else:
                self.log_result("authentication", "User registration", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("authentication", "User registration", False, str(e))
        
        return None
    
    def test_user_login(self):
        """Test user login with demo credentials"""
        print("\n=== Testing User Login ===")
        
        login_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.log_result("authentication", "User login", True)
                    self.auth_token = data["access_token"]
                    print(f"   Logged in as: {data['user']['name']} ({data['user']['email']})")
                    return True
                else:
                    self.log_result("authentication", "User login", False, "Missing token or user in response")
            elif response.status_code == 401:
                # Demo user doesn't exist, try to create it first
                print("   Demo user not found, creating demo user...")
                demo_registration = {
                    "email": TEST_USER_EMAIL,
                    "password": TEST_USER_PASSWORD,
                    "name": TEST_USER_NAME,
                    "daily_sugar_goal": 50.0
                }
                
                reg_response = requests.post(
                    f"{self.base_url}/auth/register",
                    json=demo_registration,
                    timeout=10
                )
                
                if reg_response.status_code == 200:
                    reg_data = reg_response.json()
                    self.auth_token = reg_data["access_token"]
                    self.log_result("authentication", "Demo user creation + login", True)
                    return True
                else:
                    self.log_result("authentication", "User login", False, f"Demo user creation failed: HTTP {reg_response.status_code}")
            else:
                self.log_result("authentication", "User login", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("authentication", "User login", False, str(e))
        
        return False
    
    def test_jwt_validation(self):
        """Test JWT token validation on protected endpoint"""
        print("\n=== Testing JWT Token Validation ===")
        
        if not self.auth_token:
            self.log_result("authentication", "JWT validation", False, "No auth token available")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            response = requests.get(
                f"{self.base_url}/food/entries",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                self.log_result("authentication", "JWT validation", True)
            elif response.status_code == 401:
                self.log_result("authentication", "JWT validation", False, "Token rejected")
            else:
                self.log_result("authentication", "JWT validation", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("authentication", "JWT validation", False, str(e))
    
    def test_food_entry_creation(self):
        """Test creating food entries"""
        print("\n=== Testing Food Entry Creation ===")
        
        if not self.auth_token:
            self.log_result("food_tracking", "Food entry creation", False, "No auth token")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        food_data = {
            "name": "Apple",
            "sugar_content": 10.5,
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
                if "id" in data and "name" in data and data["name"] == "Apple":
                    self.log_result("food_tracking", "Food entry creation", True)
                    return data["id"]
                else:
                    self.log_result("food_tracking", "Food entry creation", False, "Invalid response format")
            else:
                self.log_result("food_tracking", "Food entry creation", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("food_tracking", "Food entry creation", False, str(e))
        
        return None
    
    def test_food_entries_list(self):
        """Test listing food entries"""
        print("\n=== Testing Food Entries List ===")
        
        if not self.auth_token:
            self.log_result("food_tracking", "Food entries list", False, "No auth token")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            response = requests.get(
                f"{self.base_url}/food/entries",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("food_tracking", "Food entries list", True)
                    print(f"   Found {len(data)} food entries")
                else:
                    self.log_result("food_tracking", "Food entries list", False, "Response is not a list")
            else:
                self.log_result("food_tracking", "Food entries list", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("food_tracking", "Food entries list", False, str(e))
    
    def test_today_entries(self):
        """Test today's entries summary"""
        print("\n=== Testing Today's Entries Summary ===")
        
        if not self.auth_token:
            self.log_result("food_tracking", "Today's entries", False, "No auth token")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            response = requests.get(
                f"{self.base_url}/food/entries/today",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["entries", "total_sugar", "daily_goal", "percentage"]
                if all(field in data for field in required_fields):
                    self.log_result("food_tracking", "Today's entries", True)
                    print(f"   Total sugar: {data['total_sugar']}g / {data['daily_goal']}g ({data['percentage']:.1f}%)")
                else:
                    self.log_result("food_tracking", "Today's entries", False, "Missing required fields in response")
            else:
                self.log_result("food_tracking", "Today's entries", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("food_tracking", "Today's entries", False, str(e))
    
    def test_ai_chat(self):
        """Test AI chat endpoint"""
        print("\n=== Testing AI Chat Integration ===")
        
        if not self.auth_token:
            self.log_result("ai_chat", "AI chat", False, "No auth token")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        chat_data = {
            "message": "What are some healthy low-sugar snack options?"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/ai/chat",
                json=chat_data,
                headers=headers,
                timeout=30  # Longer timeout for AI response
            )
            
            if response.status_code == 200:
                data = response.json()
                if "response" in data and data["response"]:
                    self.log_result("ai_chat", "AI chat", True)
                    print(f"   AI Response: {data['response'][:100]}...")
                else:
                    self.log_result("ai_chat", "AI chat", False, "Empty or missing response")
            elif response.status_code == 500:
                self.log_result("ai_chat", "AI chat", False, f"Server error (likely emergentintegrations import issue): {response.text}")
            else:
                self.log_result("ai_chat", "AI chat", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("ai_chat", "AI chat", False, str(e))
    
    def test_knowledge_base_search(self):
        """Test knowledge base search"""
        print("\n=== Testing Knowledge Base Search ===")
        
        if not self.auth_token:
            self.log_result("knowledge_base", "KB search", False, "No auth token")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        search_data = {
            "query": "diabetes management",
            "debug": True
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/kb/search",
                json=search_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "results" in data and isinstance(data["results"], list):
                    self.log_result("knowledge_base", "KB search", True)
                    print(f"   Found {len(data['results'])} results")
                    if "debug_info" in data:
                        print(f"   Debug info: {data['debug_info']}")
                else:
                    self.log_result("knowledge_base", "KB search", False, "Invalid response format")
            else:
                self.log_result("knowledge_base", "KB search", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("knowledge_base", "KB search", False, str(e))
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🧪 Starting SugarDrop Backend API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 50)
        
        # Test health check first
        self.test_health_check()
        
        # Test authentication
        login_success = self.test_user_login()
        if login_success:
            self.test_jwt_validation()
        
        # Test registration with new user
        self.test_user_registration()
        
        # Test food tracking (requires auth)
        if self.auth_token:
            self.test_food_entry_creation()
            self.test_food_entries_list()
            self.test_today_entries()
        
        # Test AI chat (requires auth)
        if self.auth_token:
            self.test_ai_chat()
        
        # Test knowledge base (requires auth)
        if self.auth_token:
            self.test_knowledge_base_search()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test results summary"""
        print("\n" + "=" * 50)
        print("🏁 TEST RESULTS SUMMARY")
        print("=" * 50)
        
        total_passed = 0
        total_failed = 0
        
        for category, results in self.test_results.items():
            passed = results["passed"]
            failed = results["failed"]
            total_passed += passed
            total_failed += failed
            
            status = "✅" if failed == 0 else "❌"
            print(f"{status} {category.upper()}: {passed} passed, {failed} failed")
            
            if results["errors"]:
                for error in results["errors"]:
                    print(f"   • {error}")
        
        print("-" * 50)
        print(f"TOTAL: {total_passed} passed, {total_failed} failed")
        
        if total_failed == 0:
            print("🎉 All tests passed!")
        else:
            print(f"⚠️  {total_failed} tests failed - see details above")

if __name__ == "__main__":
    tester = SugarDropAPITester()
    tester.run_all_tests()