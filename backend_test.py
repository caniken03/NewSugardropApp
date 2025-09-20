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
BACKEND_URL = "https://nutriai-14.preview.emergentagent.com/api"
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
            "passio_integration": {"passed": 0, "failed": 0, "errors": []},
            "meal_categorization": {"passed": 0, "failed": 0, "errors": []},
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
        """Test health check endpoint and verify version 2.1.0 with Passio integration"""
        print("\n=== Testing Health Check API ===")
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "healthy":
                    # Check version is 2.1.0
                    version = data.get("version")
                    if version == "2.1.0":
                        self.log_result("health_check", "API version 2.1.0", True)
                    else:
                        self.log_result("health_check", "API version 2.1.0", False, f"Expected 2.1.0, got {version}")
                    
                    # Check Passio integration is enabled
                    features = data.get("features", {})
                    passio_integration = features.get("passio_integration", False)
                    if passio_integration:
                        self.log_result("health_check", "Passio integration enabled", True)
                    else:
                        self.log_result("health_check", "Passio integration enabled", False, "passio_integration is false")
                    
                    self.log_result("health_check", "Health check endpoint", True)
                    print(f"   Version: {version}")
                    print(f"   Features: {features}")
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
        """Test today's entries summary with meal grouping"""
        print("\n=== Testing Today's Entries Summary with Meal Grouping ===")
        
        if not self.auth_token:
            self.log_result("meal_categorization", "Today's entries with meals", False, "No auth token")
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
                required_fields = ["entries", "meals", "total_sugar", "daily_goal", "percentage"]
                if all(field in data for field in required_fields):
                    # Check if meals object has the expected structure
                    meals = data.get("meals", {})
                    expected_meal_types = ["breakfast", "lunch", "dinner", "snack"]
                    if all(meal_type in meals for meal_type in expected_meal_types):
                        self.log_result("meal_categorization", "Today's entries with meals", True)
                        print(f"   Total sugar: {data['total_sugar']}g / {data['daily_goal']}g ({data['percentage']:.1f}%)")
                        print(f"   Meal breakdown: {[(k, len(v)) for k, v in meals.items()]}")
                    else:
                        self.log_result("meal_categorization", "Today's entries with meals", False, "Missing meal categories in response")
                else:
                    self.log_result("meal_categorization", "Today's entries with meals", False, "Missing required fields in response")
            else:
                self.log_result("meal_categorization", "Today's entries with meals", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("meal_categorization", "Today's entries with meals", False, str(e))
    
    def test_passio_food_search(self):
        """Test Passio food search API"""
        print("\n=== Testing Passio Food Search API ===")
        
        if not self.auth_token:
            self.log_result("passio_integration", "Food search", False, "No auth token")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test search for "apple"
        search_data = {
            "query": "apple",
            "limit": 10
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/food/search",
                json=search_data,
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["results", "query", "count", "source"]
                if all(field in data for field in required_fields):
                    results = data.get("results", [])
                    if len(results) > 0:
                        # Check if results have expected structure
                        first_result = results[0]
                        expected_result_fields = ["id", "name", "sugar_per_100g", "calories_per_100g"]
                        if all(field in first_result for field in expected_result_fields):
                            self.log_result("passio_integration", "Food search - apple", True)
                            print(f"   Found {len(results)} results for 'apple'")
                            print(f"   First result: {first_result['name']} - {first_result['sugar_per_100g']}g sugar/100g")
                        else:
                            self.log_result("passio_integration", "Food search - apple", False, "Results missing expected fields")
                    else:
                        self.log_result("passio_integration", "Food search - apple", False, "No results returned")
                else:
                    self.log_result("passio_integration", "Food search - apple", False, "Missing required response fields")
            else:
                self.log_result("passio_integration", "Food search - apple", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("passio_integration", "Food search - apple", False, str(e))
        
        # Test search for "chocolate"
        search_data = {
            "query": "chocolate",
            "limit": 10
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/food/search",
                json=search_data,
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if "results" in data and len(data["results"]) > 0:
                    self.log_result("passio_integration", "Food search - chocolate", True)
                    print(f"   Found {len(data['results'])} results for 'chocolate'")
                else:
                    self.log_result("passio_integration", "Food search - chocolate", False, "No results for chocolate")
            else:
                self.log_result("passio_integration", "Food search - chocolate", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("passio_integration", "Food search - chocolate", False, str(e))
    
    def test_passio_popular_foods(self):
        """Test Passio popular foods API"""
        print("\n=== Testing Passio Popular Foods API ===")
        
        if not self.auth_token:
            self.log_result("passio_integration", "Popular foods", False, "No auth token")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test popular foods without category
        try:
            response = requests.get(
                f"{self.base_url}/food/popular",
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if "results" in data and len(data["results"]) > 0:
                    self.log_result("passio_integration", "Popular foods - no category", True)
                    print(f"   Found {len(data['results'])} popular foods")
                else:
                    self.log_result("passio_integration", "Popular foods - no category", False, "No popular foods returned")
            else:
                self.log_result("passio_integration", "Popular foods - no category", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("passio_integration", "Popular foods - no category", False, str(e))
        
        # Test popular foods with fruits category
        try:
            response = requests.get(
                f"{self.base_url}/food/popular?category=fruits",
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if "results" in data:
                    self.log_result("passio_integration", "Popular foods - fruits", True)
                    print(f"   Found {len(data['results'])} popular fruits")
                else:
                    self.log_result("passio_integration", "Popular foods - fruits", False, "No results field")
            else:
                self.log_result("passio_integration", "Popular foods - fruits", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("passio_integration", "Popular foods - fruits", False, str(e))
        
        # Test popular foods with vegetables category
        try:
            response = requests.get(
                f"{self.base_url}/food/popular?category=vegetables",
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if "results" in data:
                    self.log_result("passio_integration", "Popular foods - vegetables", True)
                    print(f"   Found {len(data['results'])} popular vegetables")
                else:
                    self.log_result("passio_integration", "Popular foods - vegetables", False, "No results field")
            else:
                self.log_result("passio_integration", "Popular foods - vegetables", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("passio_integration", "Popular foods - vegetables", False, str(e))
    
    def test_food_recognition(self):
        """Test Passio food recognition API"""
        print("\n=== Testing Passio Food Recognition API ===")
        
        if not self.auth_token:
            self.log_result("passio_integration", "Food recognition", False, "No auth token")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Create a simple base64 encoded test image (1x1 pixel PNG)
        test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg=="
        
        recognition_data = {
            "image_base64": test_image_base64
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/food/recognize",
                json=recognition_data,
                headers=headers,
                timeout=20
            )
            
            if response.status_code == 200:
                data = response.json()
                if "results" in data and "count" in data and "source" in data:
                    self.log_result("passio_integration", "Food recognition", True)
                    print(f"   Recognition returned {data['count']} results")
                    if data["results"]:
                        print(f"   First result: {data['results'][0].get('name', 'Unknown')}")
                else:
                    self.log_result("passio_integration", "Food recognition", False, "Missing expected response fields")
            elif response.status_code == 403:
                self.log_result("passio_integration", "Food recognition", False, "API access forbidden - may need valid Passio API key")
            else:
                self.log_result("passio_integration", "Food recognition", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("passio_integration", "Food recognition", False, str(e))
    
    def test_meal_categorization(self):
        """Test food entries with different meal types"""
        print("\n=== Testing Meal Categorization ===")
        
        if not self.auth_token:
            self.log_result("meal_categorization", "Meal type entries", False, "No auth token")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test creating entries with different meal types
        meal_types = ["breakfast", "lunch", "dinner", "snack"]
        foods = [
            {"name": "Oatmeal with Berries", "sugar_content": 8.5, "portion_size": 1.0, "calories": 150},
            {"name": "Grilled Chicken Salad", "sugar_content": 3.2, "portion_size": 1.0, "calories": 280},
            {"name": "Salmon with Vegetables", "sugar_content": 2.1, "portion_size": 1.0, "calories": 350},
            {"name": "Mixed Nuts", "sugar_content": 1.5, "portion_size": 0.5, "calories": 180}
        ]
        
        created_entries = []
        
        for i, meal_type in enumerate(meal_types):
            food_data = foods[i].copy()
            food_data["meal_type"] = meal_type
            
            try:
                response = requests.post(
                    f"{self.base_url}/food/entries",
                    json=food_data,
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if "meal_type" in data and data["meal_type"] == meal_type:
                        self.log_result("meal_categorization", f"Food entry - {meal_type}", True)
                        created_entries.append(data["id"])
                        print(f"   Created {meal_type} entry: {data['name']}")
                    else:
                        self.log_result("meal_categorization", f"Food entry - {meal_type}", False, "meal_type not preserved")
                else:
                    self.log_result("meal_categorization", f"Food entry - {meal_type}", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_result("meal_categorization", f"Food entry - {meal_type}", False, str(e))
        
        print(f"   Created {len(created_entries)} meal entries for testing")
    
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
        print("🧪 Starting SugarDrop Backend API Tests - Passio Integration & Meal Categorization")
        print(f"Backend URL: {self.base_url}")
        print("=" * 70)
        
        # Test health check first (includes version and Passio integration check)
        self.test_health_check()
        
        # Test authentication
        login_success = self.test_user_login()
        if login_success:
            self.test_jwt_validation()
        
        # Test registration with new user
        self.test_user_registration()
        
        # Test basic food tracking (requires auth)
        if self.auth_token:
            self.test_food_entry_creation()
            self.test_food_entries_list()
        
        # Test NEW PASSIO INTEGRATION features (requires auth)
        if self.auth_token:
            self.test_passio_food_search()
            self.test_passio_popular_foods()
            self.test_food_recognition()
        
        # Test NEW MEAL CATEGORIZATION features (requires auth)
        if self.auth_token:
            self.test_meal_categorization()
            self.test_today_entries()  # Updated to test meal grouping
        
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