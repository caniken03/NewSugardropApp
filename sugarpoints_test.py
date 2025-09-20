#!/usr/bin/env python3
"""
Backend Testing Suite for SugarPoints System - Phase A Implementation
Tests all 8 evaluation cases from specification and API endpoints
"""

import requests
import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://nutriai-14.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class SugarPointsBackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, passed: bool, details: str = "", expected: Any = None, actual: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "passed": passed,
            "details": details,
            "expected": expected,
            "actual": actual,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not passed and expected is not None and actual is not None:
            print(f"   Expected: {expected}")
            print(f"   Actual: {actual}")
        print()

    def setup_auth(self) -> bool:
        """Setup authentication for testing"""
        try:
            # Register a test user
            test_email = f"sugarpoints_test_{datetime.now().timestamp()}@test.com"
            register_data = {
                "email": test_email,
                "password": "TestPassword123!",
                "name": "SugarPoints Test User",
                "daily_sugar_goal": 50.0
            }
            
            response = self.session.post(f"{API_BASE}/auth/register", json=register_data)
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data["access_token"]
                self.user_id = data["user"]["id"]
                self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                self.log_test("Authentication Setup", True, f"User registered: {test_email}")
                return True
            else:
                self.log_test("Authentication Setup", False, f"Registration failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Authentication Setup", False, f"Auth setup error: {str(e)}")
            return False

    def test_sugar_points_calculation_logic(self):
        """Test all 8 SugarPoints calculation cases from specification"""
        print("=== Testing SugarPoints Calculation Logic ===")
        
        test_cases = [
            {
                "name": "Zero-Carb Food (0g carbs)",
                "carbs_per_100g": 0.0,
                "portion_size": 100,
                "expected_sugar_points": 0,
                "expected_blocks": 0,
                "expected_text": "Nil SugarPoints"
            },
            {
                "name": "Exact 1g Carb",
                "carbs_per_100g": 1.0,
                "portion_size": 100,
                "expected_sugar_points": 1,
                "expected_blocks": 0,
                "expected_text": "1 SugarPoints"
            },
            {
                "name": "Typical Soda (36g carbs)",
                "carbs_per_100g": 36.0,
                "portion_size": 100,
                "expected_sugar_points": 36,
                "expected_blocks": 6,
                "expected_text": "36 SugarPoints"
            },
            {
                "name": "Non-integer Carb (7.4g carbs)",
                "carbs_per_100g": 7.4,
                "portion_size": 100,
                "expected_sugar_points": 7,
                "expected_blocks": 1,
                "expected_text": "7 SugarPoints"
            },
            {
                "name": "High Protein, Low Carb (35g protein, 3g carbs)",
                "carbs_per_100g": 3.0,
                "fat_per_100g": 0.0,
                "protein_per_100g": 35.0,
                "portion_size": 100,
                "expected_sugar_points": 3,
                "expected_blocks": 0,
                "expected_text": "3 SugarPoints"
            },
            {
                "name": "Full Nutrient Set (12.6g carbs, 4.2g fat, 5g protein)",
                "carbs_per_100g": 12.6,
                "fat_per_100g": 4.2,
                "protein_per_100g": 5.0,
                "portion_size": 100,
                "expected_sugar_points": 13,  # rounded from 12.6
                "expected_blocks": 2,  # rounded(13/6)
                "expected_text": "13 SugarPoints"
            },
            {
                "name": "Large Portion Test (18g carbs per 100g, 200g portion)",
                "carbs_per_100g": 18.0,
                "portion_size": 200,
                "expected_sugar_points": 36,  # (18 * 200) / 100 = 36
                "expected_blocks": 6,
                "expected_text": "36 SugarPoints"
            },
            {
                "name": "Small Portion Test (30g carbs per 100g, 50g portion)",
                "carbs_per_100g": 30.0,
                "portion_size": 50,
                "expected_sugar_points": 15,  # (30 * 50) / 100 = 15
                "expected_blocks": 3,  # rounded(15/6) = 3
                "expected_text": "15 SugarPoints"
            }
        ]
        
        for i, case in enumerate(test_cases):
            try:
                # Create food entry
                entry_data = {
                    "name": f"Test Food {i+1}: {case['name']}",
                    "carbs_per_100g": case["carbs_per_100g"],
                    "fat_per_100g": case.get("fat_per_100g", 0.0),
                    "protein_per_100g": case.get("protein_per_100g", 0.0),
                    "portion_size": case["portion_size"],
                    "meal_type": "snack"
                }
                
                response = self.session.post(f"{API_BASE}/food/entries", json=entry_data)
                
                if response.status_code == 200:
                    entry = response.json()
                    
                    # Verify SugarPoints calculation
                    actual_sugar_points = entry.get("sugar_points")
                    actual_blocks = entry.get("sugar_point_blocks")
                    
                    points_correct = actual_sugar_points == case["expected_sugar_points"]
                    blocks_correct = actual_blocks == case["expected_blocks"]
                    
                    if points_correct and blocks_correct:
                        self.log_test(
                            f"SugarPoints Calculation: {case['name']}", 
                            True,
                            f"SugarPoints: {actual_sugar_points}, Blocks: {actual_blocks}"
                        )
                    else:
                        self.log_test(
                            f"SugarPoints Calculation: {case['name']}", 
                            False,
                            f"Calculation mismatch",
                            f"Points: {case['expected_sugar_points']}, Blocks: {case['expected_blocks']}",
                            f"Points: {actual_sugar_points}, Blocks: {actual_blocks}"
                        )
                        
                    # Test nutrition data preservation
                    if case.get("protein_per_100g"):
                        protein_correct = entry.get("protein_per_100g") == case["protein_per_100g"]
                        self.log_test(
                            f"Protein Preservation: {case['name']}", 
                            protein_correct,
                            f"Expected: {case['protein_per_100g']}g, Got: {entry.get('protein_per_100g')}g"
                        )
                        
                    if case.get("fat_per_100g"):
                        fat_correct = entry.get("fat_per_100g") == case["fat_per_100g"]
                        self.log_test(
                            f"Fat Preservation: {case['name']}", 
                            fat_correct,
                            f"Expected: {case['fat_per_100g']}g, Got: {entry.get('fat_per_100g')}g"
                        )
                        
                else:
                    self.log_test(
                        f"SugarPoints Calculation: {case['name']}", 
                        False,
                        f"API Error: {response.status_code} - {response.text}"
                    )
                    
            except Exception as e:
                self.log_test(
                    f"SugarPoints Calculation: {case['name']}", 
                    False,
                    f"Exception: {str(e)}"
                )

    def test_missing_carbs_handling(self):
        """Test error handling for missing nutritional data"""
        print("=== Testing Missing Carbs Field Handling ===")
        
        try:
            # Test with completely missing carbs data
            entry_data = {
                "name": "Test Food - No Carbs Data",
                "portion_size": 100,
                "meal_type": "snack"
                # No carbs_per_100g field
            }
            
            response = self.session.post(f"{API_BASE}/food/entries", json=entry_data)
            
            if response.status_code == 200:
                entry = response.json()
                # Should default to 0 carbs
                if entry.get("sugar_points") == 0 and entry.get("carbs_per_100g") == 0.0:
                    self.log_test(
                        "Missing Carbs Handling", 
                        True,
                        "Correctly defaulted to 0 carbs and 0 SugarPoints"
                    )
                else:
                    self.log_test(
                        "Missing Carbs Handling", 
                        False,
                        f"Unexpected values: carbs={entry.get('carbs_per_100g')}, points={entry.get('sugar_points')}"
                    )
            else:
                self.log_test(
                    "Missing Carbs Handling", 
                    False,
                    f"API Error: {response.status_code} - {response.text}"
                )
                
        except Exception as e:
            self.log_test("Missing Carbs Handling", False, f"Exception: {str(e)}")

    def test_backward_compatibility(self):
        """Test backward compatibility with legacy sugar_content field"""
        print("=== Testing Backward Compatibility ===")
        
        try:
            # Test with legacy sugar_content field
            entry_data = {
                "name": "Legacy Test Food",
                "sugar_content": 0.25,  # 25g per 100g in old format (per gram)
                "portion_size": 100,
                "meal_type": "snack"
            }
            
            response = self.session.post(f"{API_BASE}/food/entries", json=entry_data)
            
            if response.status_code == 200:
                entry = response.json()
                
                # Should convert sugar_content to carbs_per_100g
                expected_carbs = 25.0  # 0.25 * 100
                expected_points = 25
                expected_blocks = 4  # round(25/6)
                
                carbs_correct = entry.get("carbs_per_100g") == expected_carbs
                points_correct = entry.get("sugar_points") == expected_points
                blocks_correct = entry.get("sugar_point_blocks") == expected_blocks
                
                if carbs_correct and points_correct and blocks_correct:
                    self.log_test(
                        "Backward Compatibility", 
                        True,
                        f"Legacy conversion: {entry.get('carbs_per_100g')}g carbs, {entry.get('sugar_points')} points"
                    )
                else:
                    self.log_test(
                        "Backward Compatibility", 
                        False,
                        f"Conversion failed",
                        f"Carbs: {expected_carbs}, Points: {expected_points}, Blocks: {expected_blocks}",
                        f"Carbs: {entry.get('carbs_per_100g')}, Points: {entry.get('sugar_points')}, Blocks: {entry.get('sugar_point_blocks')}"
                    )
            else:
                self.log_test(
                    "Backward Compatibility", 
                    False,
                    f"API Error: {response.status_code} - {response.text}"
                )
                
        except Exception as e:
            self.log_test("Backward Compatibility", False, f"Exception: {str(e)}")

    def test_today_entries_api(self):
        """Test today entries API with SugarPoints totals and text formatting"""
        print("=== Testing Today Entries API ===")
        
        try:
            response = self.session.get(f"{API_BASE}/food/entries/today")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required SugarPoints fields
                required_fields = [
                    "total_sugar_points", 
                    "total_sugar_point_blocks", 
                    "sugar_points_text", 
                    "sugar_point_blocks_text"
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    total_points = data["total_sugar_points"]
                    total_blocks = data["total_sugar_point_blocks"]
                    points_text = data["sugar_points_text"]
                    blocks_text = data["sugar_point_blocks_text"]
                    
                    # Verify text formatting
                    expected_points_text = f"{total_points} SugarPoints" if total_points > 0 else "Nil SugarPoints"
                    expected_blocks_text = f"{total_blocks} Blocks"
                    
                    text_correct = (points_text == expected_points_text and 
                                  blocks_text == expected_blocks_text)
                    
                    # Verify blocks calculation
                    expected_blocks = round(total_points / 6) if total_points > 0 else 0
                    blocks_correct = total_blocks == expected_blocks
                    
                    if text_correct and blocks_correct:
                        self.log_test(
                            "Today Entries API", 
                            True,
                            f"Total: {total_points} SugarPoints ({total_blocks} Blocks)"
                        )
                    else:
                        self.log_test(
                            "Today Entries API", 
                            False,
                            f"Text/calculation mismatch",
                            f"Points text: '{expected_points_text}', Blocks: {expected_blocks}",
                            f"Points text: '{points_text}', Blocks: {total_blocks}"
                        )
                else:
                    self.log_test(
                        "Today Entries API", 
                        False,
                        f"Missing required fields: {missing_fields}"
                    )
                    
            else:
                self.log_test(
                    "Today Entries API", 
                    False,
                    f"API Error: {response.status_code} - {response.text}"
                )
                
        except Exception as e:
            self.log_test("Today Entries API", False, f"Exception: {str(e)}")

    def test_food_search_api(self):
        """Test food search API with carbs/fat/protein extraction"""
        print("=== Testing Food Search API ===")
        
        try:
            search_data = {"query": "apple", "limit": 5}
            response = self.session.post(f"{API_BASE}/food/search", json=search_data)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                
                if results:
                    # Check first result for nutrition fields
                    first_result = results[0]
                    required_fields = ["carbs_per_100g", "fat_per_100g", "protein_per_100g"]
                    
                    has_nutrition = all(field in first_result for field in required_fields)
                    
                    if has_nutrition:
                        carbs = first_result["carbs_per_100g"]
                        fat = first_result["fat_per_100g"]
                        protein = first_result["protein_per_100g"]
                        
                        # Verify values are reasonable for apple
                        carbs_reasonable = 10 <= carbs <= 20  # Apples have ~14g carbs per 100g
                        fat_reasonable = 0 <= fat <= 1       # Apples have minimal fat
                        protein_reasonable = 0 <= protein <= 2  # Apples have minimal protein
                        
                        if carbs_reasonable and fat_reasonable and protein_reasonable:
                            self.log_test(
                                "Food Search API", 
                                True,
                                f"Apple nutrition: {carbs}g carbs, {fat}g fat, {protein}g protein"
                            )
                        else:
                            self.log_test(
                                "Food Search API", 
                                False,
                                f"Unreasonable nutrition values for apple: {carbs}g carbs, {fat}g fat, {protein}g protein"
                            )
                    else:
                        self.log_test(
                            "Food Search API", 
                            False,
                            f"Missing nutrition fields in search results"
                        )
                else:
                    self.log_test(
                        "Food Search API", 
                        False,
                        "No search results returned"
                    )
                    
            else:
                self.log_test(
                    "Food Search API", 
                    False,
                    f"API Error: {response.status_code} - {response.text}"
                )
                
        except Exception as e:
            self.log_test("Food Search API", False, f"Exception: {str(e)}")

    def test_popular_foods_api(self):
        """Test popular foods API with nutrition format"""
        print("=== Testing Popular Foods API ===")
        
        try:
            response = self.session.get(f"{API_BASE}/food/popular?limit=3")
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                
                if results:
                    # Check nutrition format in results
                    nutrition_complete = True
                    for food in results:
                        required_fields = ["carbs_per_100g", "fat_per_100g", "protein_per_100g"]
                        if not all(field in food for field in required_fields):
                            nutrition_complete = False
                            break
                    
                    if nutrition_complete:
                        self.log_test(
                            "Popular Foods API", 
                            True,
                            f"Retrieved {len(results)} foods with complete nutrition data"
                        )
                    else:
                        self.log_test(
                            "Popular Foods API", 
                            False,
                            "Some foods missing nutrition data"
                        )
                else:
                    self.log_test(
                        "Popular Foods API", 
                        False,
                        "No popular foods returned"
                    )
                    
            else:
                self.log_test(
                    "Popular Foods API", 
                    False,
                    f"API Error: {response.status_code} - {response.text}"
                )
                
        except Exception as e:
            self.log_test("Popular Foods API", False, f"Exception: {str(e)}")

    def test_api_timeout_fallback(self):
        """Test API timeout fallback mechanism"""
        print("=== Testing API Timeout Fallback ===")
        
        try:
            # Test food search which should have fallback
            search_data = {"query": "nonexistent_food_12345", "limit": 1}
            response = self.session.post(f"{API_BASE}/food/search", json=search_data)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                
                # Should return fallback results even for non-existent food
                if results:
                    self.log_test(
                        "API Timeout Fallback", 
                        True,
                        f"Fallback mechanism working - returned {len(results)} results"
                    )
                else:
                    self.log_test(
                        "API Timeout Fallback", 
                        False,
                        "No fallback results provided"
                    )
            else:
                self.log_test(
                    "API Timeout Fallback", 
                    False,
                    f"API Error: {response.status_code} - {response.text}"
                )
                
        except Exception as e:
            self.log_test("API Timeout Fallback", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all SugarPoints backend tests"""
        print("🧪 Starting SugarPoints Backend Testing Suite")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Setup authentication
        if not self.setup_auth():
            print("❌ Authentication setup failed. Cannot proceed with tests.")
            return False
        
        # Run all test suites
        self.test_sugar_points_calculation_logic()
        self.test_missing_carbs_handling()
        self.test_backward_compatibility()
        self.test_today_entries_api()
        self.test_food_search_api()
        self.test_popular_foods_api()
        self.test_api_timeout_fallback()
        
        # Summary
        print("=" * 60)
        print("🏁 Test Summary")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["passed"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 Failed Tests:")
            for result in self.test_results:
                if not result["passed"]:
                    print(f"  • {result['test']}: {result['details']}")
        
        return failed_tests == 0

if __name__ == "__main__":
    tester = SugarPointsBackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)