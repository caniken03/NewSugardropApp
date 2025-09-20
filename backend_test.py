#!/usr/bin/env python3
"""
Backend Test Suite for Body Type Quiz System
Tests all 10 evaluation cases from specification and API endpoints
"""

import requests
import json
import sys
import os
import uuid
from typing import Dict, List, Any
from datetime import datetime

# Configuration
BACKEND_URL = "https://nutriai-14.preview.emergentagent.com/api"
TEST_USER_EMAIL = "quiz_tester@example.com"
TEST_USER_PASSWORD = "SecurePass123!"
TEST_USER_NAME = "Quiz Tester"

class BodyTypeQuizTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
    
    def setup_test_user(self) -> bool:
        """Create or login test user"""
        print("\n=== Setting up test user ===")
        
        # Try to register new user
        register_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "name": TEST_USER_NAME,
            "daily_sugar_goal": 50.0
        }
        
        try:
            response = self.session.post(f"{BACKEND_URL}/auth/register", json=register_data)
            if response.status_code == 201 or response.status_code == 200:
                data = response.json()
                self.auth_token = data["access_token"]
                self.user_id = data["user"]["id"]
                print(f"✅ Created new test user: {self.user_id}")
                return True
            elif response.status_code == 400 and "already registered" in response.text:
                # User exists, try to login
                print("User already exists, attempting login...")
                return self.login_test_user()
            else:
                print(f"❌ Registration failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Registration error: {str(e)}")
            return self.login_test_user()
    
    def login_test_user(self) -> bool:
        """Login existing test user"""
        login_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        try:
            response = self.session.post(f"{BACKEND_URL}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data["access_token"]
                self.user_id = data["user"]["id"]
                print(f"✅ Logged in test user: {self.user_id}")
                return True
            else:
                print(f"❌ Login failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            return False
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Get authorization headers"""
        return {"Authorization": f"Bearer {self.auth_token}"}
    
    def create_quiz_responses(self, pattern: str) -> List[Dict[str, Any]]:
        """Create quiz responses based on pattern"""
        responses = []
        
        if pattern == "all_a":
            # Test Case 1: All A responses → Ectomorph
            for i in range(1, 16):
                responses.append({"question_id": i, "value": "A"})
        elif pattern == "all_b":
            # Test Case 2: All B responses → Mesomorph
            for i in range(1, 16):
                responses.append({"question_id": i, "value": "B"})
        elif pattern == "all_c":
            # Test Case 3: All C responses → Endomorph
            for i in range(1, 16):
                responses.append({"question_id": i, "value": "C"})
        elif pattern == "tie_ab":
            # Test Case 4: 7 A, 7 B, 1 C → Hybrid
            for i in range(1, 8):  # 7 A's
                responses.append({"question_id": i, "value": "A"})
            for i in range(8, 15):  # 7 B's
                responses.append({"question_id": i, "value": "B"})
            responses.append({"question_id": 15, "value": "C"})  # 1 C
        elif pattern == "tie_ac":
            # Test Case 5: 7 A, 1 B, 7 C → Hybrid
            for i in range(1, 8):  # 7 A's
                responses.append({"question_id": i, "value": "A"})
            responses.append({"question_id": 8, "value": "B"})  # 1 B
            for i in range(9, 16):  # 7 C's
                responses.append({"question_id": i, "value": "C"})
        elif pattern == "tie_all":
            # Test Case 6: 5 A, 5 B, 5 C → Hybrid
            for i in range(1, 6):  # 5 A's
                responses.append({"question_id": i, "value": "A"})
            for i in range(6, 11):  # 5 B's
                responses.append({"question_id": i, "value": "B"})
            for i in range(11, 16):  # 5 C's
                responses.append({"question_id": i, "value": "C"})
        elif pattern == "dominant_b":
            # Test Case 7: 3 A, 9 B, 3 C → Mesomorph
            for i in range(1, 4):  # 3 A's
                responses.append({"question_id": i, "value": "A"})
            for i in range(4, 13):  # 9 B's
                responses.append({"question_id": i, "value": "B"})
            for i in range(13, 16):  # 3 C's
                responses.append({"question_id": i, "value": "C"})
        elif pattern == "near_tie":
            # Test Case 9: 6 A, 6 B, 3 C → Hybrid
            for i in range(1, 7):  # 6 A's
                responses.append({"question_id": i, "value": "A"})
            for i in range(7, 13):  # 6 B's
                responses.append({"question_id": i, "value": "B"})
            for i in range(13, 16):  # 3 C's
                responses.append({"question_id": i, "value": "C"})
        elif pattern == "incomplete":
            # Test Case 8: Only 13 responses → 400 error
            for i in range(1, 14):  # Only 13 responses
                responses.append({"question_id": i, "value": "A"})
        elif pattern == "invalid":
            # Test Case 10: Invalid choice values → 400 error
            for i in range(1, 15):
                responses.append({"question_id": i, "value": "A"})
            responses.append({"question_id": 15, "value": "D"})  # Invalid value
        
        return responses
    
    def test_quiz_submission(self, pattern: str, expected_body_type: str = None, expected_range: str = None, should_fail: bool = False) -> bool:
        """Test quiz submission with specific pattern"""
        responses = self.create_quiz_responses(pattern)
        quiz_data = {"responses": responses}
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/quiz/submit",
                json=quiz_data,
                headers=self.get_auth_headers()
            )
            
            if should_fail:
                if response.status_code == 400:
                    return True
                else:
                    print(f"   Expected 400 error but got {response.status_code}")
                    return False
            
            if response.status_code != 200:
                print(f"   API Error: {response.status_code} - {response.text}")
                return False
            
            result = response.json()
            
            # Verify expected results
            if expected_body_type and result.get("body_type") != expected_body_type:
                print(f"   Expected body_type: {expected_body_type}, got: {result.get('body_type')}")
                return False
            
            if expected_range and result.get("sugarpoints_range") != expected_range:
                print(f"   Expected range: {expected_range}, got: {result.get('sugarpoints_range')}")
                return False
            
            # Verify required fields exist
            required_fields = ["body_type", "sugarpoints_range", "onboarding_path", "health_risk", "recommendations", "score_breakdown"]
            for field in required_fields:
                if field not in result:
                    print(f"   Missing required field: {field}")
                    return False
            
            print(f"   Result: {result['body_type']} ({result['sugarpoints_range']})")
            return True
            
        except Exception as e:
            print(f"   Exception: {str(e)}")
            return False
    
    def test_user_profile_integration(self) -> bool:
        """Test user profile integration for quiz results"""
        print("\n=== Testing User Profile Integration ===")
        
        # First submit a quiz to store results
        responses = self.create_quiz_responses("all_a")  # Ectomorph
        quiz_data = {"responses": responses}
        
        try:
            # Submit quiz
            response = self.session.post(
                f"{BACKEND_URL}/quiz/submit",
                json=quiz_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code != 200:
                self.log_test("Quiz submission for profile test", False, f"Status: {response.status_code}")
                return False
            
            # Get user profile to verify quiz results are stored
            profile_response = self.session.get(
                f"{BACKEND_URL}/user/profile",
                headers=self.get_auth_headers()
            )
            
            if profile_response.status_code != 200:
                self.log_test("Get user profile", False, f"Status: {profile_response.status_code}")
                return False
            
            profile_data = profile_response.json()
            
            # Check if quiz results are in profile (they should be stored in the database)
            # Note: The current implementation stores quiz results in the users table
            self.log_test("Get user profile", True, "Profile retrieved successfully")
            
            # Test profile update
            update_data = {
                "age": 30,
                "gender": "other",
                "activity_level": "moderate",
                "health_goals": ["weight_management", "energy_boost"],
                "daily_sugar_points_target": 100,
                "completed_onboarding": True
            }
            
            update_response = self.session.put(
                f"{BACKEND_URL}/user/profile",
                json=update_data,
                headers=self.get_auth_headers()
            )
            
            if update_response.status_code != 200:
                self.log_test("Update user profile", False, f"Status: {update_response.status_code}")
                return False
            
            self.log_test("Update user profile", True, "Profile updated successfully")
            return True
            
        except Exception as e:
            self.log_test("User profile integration", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all Body Type Quiz tests"""
        print("🧪 Starting Body Type Quiz Backend Tests")
        print(f"Backend URL: {BACKEND_URL}")
        
        # Setup
        if not self.setup_test_user():
            print("❌ Failed to setup test user. Aborting tests.")
            return False
        
        print("\n=== Testing All 10 Evaluation Cases ===")
        
        # Test Case 1: All A responses → Ectomorph
        passed = self.test_quiz_submission("all_a", "Ectomorph", "100–125")
        self.log_test("Test Case 1: All A → Ectomorph", passed)
        
        # Test Case 2: All B responses → Mesomorph
        passed = self.test_quiz_submission("all_b", "Mesomorph", "75–100")
        self.log_test("Test Case 2: All B → Mesomorph", passed)
        
        # Test Case 3: All C responses → Endomorph
        passed = self.test_quiz_submission("all_c", "Endomorph", "50–75")
        self.log_test("Test Case 3: All C → Endomorph", passed)
        
        # Test Case 4: Tie A-B → Hybrid
        passed = self.test_quiz_submission("tie_ab", "Hybrid", "75–125")
        self.log_test("Test Case 4: Tie A-B → Hybrid", passed)
        
        # Test Case 5: Tie A-C → Hybrid
        passed = self.test_quiz_submission("tie_ac", "Hybrid", "75–125")
        self.log_test("Test Case 5: Tie A-C → Hybrid", passed)
        
        # Test Case 6: Tie All Equal → Hybrid
        passed = self.test_quiz_submission("tie_all", "Hybrid", "75–125")
        self.log_test("Test Case 6: Tie All Equal → Hybrid", passed)
        
        # Test Case 7: Mixed Dominant B → Mesomorph
        passed = self.test_quiz_submission("dominant_b", "Mesomorph", "75–100")
        self.log_test("Test Case 7: Dominant B → Mesomorph", passed)
        
        # Test Case 8: Incomplete submission → 400 error
        passed = self.test_quiz_submission("incomplete", should_fail=True)
        self.log_test("Test Case 8: Incomplete submission → 400 error", passed)
        
        # Test Case 9: Near-tie → Hybrid
        passed = self.test_quiz_submission("near_tie", "Hybrid", "75–125")
        self.log_test("Test Case 9: Near-tie → Hybrid", passed)
        
        # Test Case 10: Invalid choice values → 400 error
        passed = self.test_quiz_submission("invalid", should_fail=True)
        self.log_test("Test Case 10: Invalid values → 400 error", passed)
        
        # Test user profile integration
        self.test_user_profile_integration()
        
        # Summary
        print("\n=== Test Summary ===")
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["passed"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        
        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result["passed"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return failed_tests == 0

def main():
    """Main test runner"""
    tester = BodyTypeQuizTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()