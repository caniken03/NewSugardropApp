"""
Passio Nutrition AI Service
Integrates with Passio API for real food data and nutrition information
"""

import httpx
import os
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)

class PassioService:
    def __init__(self):
        self.api_key = os.getenv('PASSIO_API_KEY')
        self.base_url = "https://api.passiolife.com/v2"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
    async def search_food(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Search for food items using Passio API
        Returns normalized food data compatible with SugarDrop
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/products/napi/food/search/advanced",
                    headers=self.headers,
                    params={
                        "term": query,
                        "limit": limit
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return self._normalize_search_results(data)
                else:
                    logger.error(f"Passio API error: {response.status_code} - {response.text}")
                    return self._get_fallback_results(query)
                    
        except Exception as e:
            logger.error(f"Error searching food with Passio: {str(e)}")
            return self._get_fallback_results(query)
    
    async def get_food_details(self, food_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed nutrition information for a specific food item
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/products/napi/food/{food_id}",
                    headers=self.headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return self._normalize_food_details(data)
                else:
                    logger.error(f"Passio API error for food details: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting food details from Passio: {str(e)}")
            return None
    
    async def recognize_food_from_image(self, image_data: bytes) -> List[Dict[str, Any]]:
        """
        Recognize food from image using Passio AI
        """
        try:
            async with httpx.AsyncClient() as client:
                files = {"image": ("food.jpg", image_data, "image/jpeg")}
                headers = {"Authorization": f"Bearer {self.api_key}"}
                
                response = await client.post(
                    f"{self.base_url}/products/napi/food/recognize",
                    headers=headers,
                    files=files,
                    timeout=15.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return self._normalize_recognition_results(data)
                else:
                    logger.error(f"Passio image recognition error: {response.status_code}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error recognizing food image: {str(e)}")
            return []
    
    async def get_barcode_nutrition(self, barcode: str) -> Optional[Dict[str, Any]]:
        """
        Get nutrition information from barcode
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/products/napi/food/barcode/{barcode}",
                    headers=self.headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return self._normalize_food_details(data)
                else:
                    logger.error(f"Passio barcode API error: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting barcode nutrition: {str(e)}")
            return None
    
    async def get_popular_foods(self, category: str = None, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get popular/trending foods
        """
        try:
            params = {"limit": limit}
            if category:
                params["category"] = category
                
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/products/napi/food/popular",
                    headers=self.headers,
                    params=params,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return self._normalize_search_results(data)
                else:
                    return self._get_popular_fallback(category)
                    
        except Exception as e:
            logger.error(f"Error getting popular foods: {str(e)}")
            return self._get_popular_fallback(category)
    
    def _normalize_search_results(self, data: Any) -> List[Dict[str, Any]]:
        """
        Normalize Passio search results to SugarDrop format
        """
        normalized = []
        
        # Handle different response formats from Passio
        items = data.get('results', []) if isinstance(data, dict) else data
        
        for item in items[:20]:  # Limit to 20 results
            try:
                normalized_item = {
                    "id": item.get("passio_id", str(hash(item.get("name", "")))),
                    "name": item.get("name", "Unknown Food"),
                    "brand": item.get("brand_name"),
                    "sugar_per_100g": self._extract_sugar_content(item),
                    "calories_per_100g": self._extract_calories(item),
                    "category": item.get("food_type", "General"),
                    "serving_sizes": self._extract_serving_sizes(item),
                    "confidence": item.get("confidence", 1.0)
                }
                normalized.append(normalized_item)
            except Exception as e:
                logger.warning(f"Error normalizing food item: {str(e)}")
                continue
                
        return normalized
    
    def _normalize_food_details(self, data: Any) -> Dict[str, Any]:
        """
        Normalize detailed food information to SugarDrop format
        """
        try:
            return {
                "id": data.get("passio_id", ""),
                "name": data.get("name", "Unknown Food"),
                "brand": data.get("brand_name"),
                "sugar_per_100g": self._extract_sugar_content(data),
                "calories_per_100g": self._extract_calories(data),
                "category": data.get("food_type", "General"),
                "nutrients": self._extract_detailed_nutrients(data),
                "serving_sizes": self._extract_serving_sizes(data),
                "ingredients": data.get("ingredients", []),
                "allergens": data.get("allergens", [])
            }
        except Exception as e:
            logger.error(f"Error normalizing food details: {str(e)}")
            return None
    
    def _normalize_recognition_results(self, data: Any) -> List[Dict[str, Any]]:
        """
        Normalize image recognition results
        """
        normalized = []
        
        recognitions = data.get('recognitions', []) if isinstance(data, dict) else data
        
        for item in recognitions[:5]:  # Limit to top 5 recognitions
            try:
                normalized_item = {
                    "id": item.get("passio_id", ""),
                    "name": item.get("name", "Unknown Food"),
                    "sugar_per_100g": self._extract_sugar_content(item),
                    "calories_per_100g": self._extract_calories(item),
                    "confidence": item.get("confidence", 0.0),
                    "estimated_weight": item.get("portion_weight", 100),
                    "category": item.get("food_type", "General")
                }
                normalized.append(normalized_item)
            except Exception as e:
                logger.warning(f"Error normalizing recognition result: {str(e)}")
                continue
                
        return normalized
    
    def _extract_sugar_content(self, item: Dict) -> float:
        """
        Extract sugar content from various Passio response formats
        """
        # Try different possible locations for sugar content
        nutrients = item.get("nutrients", {})
        
        # Check for sugar in different formats
        sugar_keys = ["sugar", "sugars", "total_sugars", "sugar_g"]
        for key in sugar_keys:
            if key in nutrients:
                value = nutrients[key]
                return float(value.get("quantity", 0) if isinstance(value, dict) else value)
        
        # Check in serving unit nutrients
        serving_units = item.get("serving_units", [])
        for unit in serving_units:
            if unit.get("unit_name") == "gram" or unit.get("serving_weight") == 100:
                unit_nutrients = unit.get("nutrients", {})
                for key in sugar_keys:
                    if key in unit_nutrients:
                        value = unit_nutrients[key]
                        return float(value.get("quantity", 0) if isinstance(value, dict) else value)
        
        # Default fallback based on food type
        return self._estimate_sugar_content(item.get("name", ""))
    
    def _extract_calories(self, item: Dict) -> float:
        """
        Extract calorie content per 100g
        """
        nutrients = item.get("nutrients", {})
        
        # Check for calories
        calorie_keys = ["calories", "energy", "kcal", "energy_kcal"]
        for key in calorie_keys:
            if key in nutrients:
                value = nutrients[key]
                return float(value.get("quantity", 0) if isinstance(value, dict) else value)
        
        # Check in serving units
        serving_units = item.get("serving_units", [])
        for unit in serving_units:
            if unit.get("unit_name") == "gram" or unit.get("serving_weight") == 100:
                unit_nutrients = unit.get("nutrients", {})
                for key in calorie_keys:
                    if key in unit_nutrients:
                        value = unit_nutrients[key]
                        return float(value.get("quantity", 0) if isinstance(value, dict) else value)
        
        return 0.0
    
    def _extract_serving_sizes(self, item: Dict) -> List[Dict]:
        """
        Extract available serving sizes
        """
        serving_sizes = []
        serving_units = item.get("serving_units", [])
        
        for unit in serving_units:
            serving_sizes.append({
                "name": unit.get("unit_name", "serving"),
                "weight_grams": unit.get("serving_weight", 100),
                "quantity": unit.get("quantity", 1)
            })
        
        # Add default 100g serving if none provided
        if not serving_sizes:
            serving_sizes.append({
                "name": "100g",
                "weight_grams": 100,
                "quantity": 1
            })
        
        return serving_sizes
    
    def _extract_detailed_nutrients(self, item: Dict) -> Dict:
        """
        Extract detailed nutrient information
        """
        nutrients = item.get("nutrients", {})
        detailed = {}
        
        nutrient_mapping = {
            "protein": ["protein", "protein_g"],
            "carbs": ["carbohydrates", "carbs", "total_carbs", "carbohydrate_g"],
            "fat": ["fat", "total_fat", "fat_g"],
            "fiber": ["fiber", "dietary_fiber", "fiber_g"],
            "sodium": ["sodium", "sodium_mg"],
            "potassium": ["potassium", "potassium_mg"],
            "vitamin_c": ["vitamin_c", "vitamin_c_mg"],
            "calcium": ["calcium", "calcium_mg"],
            "iron": ["iron", "iron_mg"]
        }
        
        for nutrient, keys in nutrient_mapping.items():
            for key in keys:
                if key in nutrients:
                    value = nutrients[key]
                    detailed[nutrient] = float(value.get("quantity", 0) if isinstance(value, dict) else value)
                    break
        
        return detailed
    
    def _estimate_sugar_content(self, food_name: str) -> float:
        """
        Estimate sugar content based on food name when not available
        """
        name_lower = food_name.lower()
        
        # High sugar foods
        if any(word in name_lower for word in ["candy", "chocolate", "cake", "cookie", "donut", "soda", "juice"]):
            return 25.0
        # Medium sugar foods
        elif any(word in name_lower for word in ["fruit", "apple", "banana", "orange", "berry"]):
            return 12.0
        # Low sugar foods
        elif any(word in name_lower for word in ["vegetable", "meat", "chicken", "fish", "egg"]):
            return 2.0
        # Default
        else:
            return 5.0
    
    def _get_fallback_results(self, query: str) -> List[Dict[str, Any]]:
        """
        Provide fallback results when Passio API is unavailable
        """
        # Enhanced fallback database with more realistic foods
        fallback_foods = [
            {
                "id": f"fallback_{hash(query + 'apple')}",
                "name": "Apple",
                "brand": None,
                "sugar_per_100g": 10.4,
                "calories_per_100g": 52,
                "category": "Fruits",
                "confidence": 0.8
            },
            {
                "id": f"fallback_{hash(query + 'banana')}",
                "name": "Banana",
                "brand": None,
                "sugar_per_100g": 12.2,
                "calories_per_100g": 89,
                "category": "Fruits",
                "confidence": 0.8
            },
            {
                "id": f"fallback_{hash(query + 'orange')}",
                "name": "Orange",
                "brand": None,
                "sugar_per_100g": 9.4,
                "calories_per_100g": 47,
                "category": "Fruits",
                "confidence": 0.8
            },
            {
                "id": f"fallback_{hash(query + 'chicken')}",
                "name": "Chicken Breast",
                "brand": None,
                "sugar_per_100g": 0.0,
                "calories_per_100g": 165,
                "category": "Protein",
                "confidence": 0.7
            },
            {
                "id": f"fallback_{hash(query + 'rice')}",
                "name": "White Rice",
                "brand": None,
                "sugar_per_100g": 0.1,
                "calories_per_100g": 130,
                "category": "Grains",
                "confidence": 0.7
            }
        ]
        
        # Filter based on query
        query_lower = query.lower()
        filtered = [food for food in fallback_foods if query_lower in food["name"].lower()]
        
        return filtered if filtered else fallback_foods[:3]
    
    def _get_popular_fallback(self, category: str = None) -> List[Dict[str, Any]]:
        """
        Provide popular foods fallback
        """
        popular_foods = [
            {"id": "pop_apple", "name": "Apple", "sugar_per_100g": 10.4, "calories_per_100g": 52, "category": "Fruits"},
            {"id": "pop_banana", "name": "Banana", "sugar_per_100g": 12.2, "calories_per_100g": 89, "category": "Fruits"},
            {"id": "pop_chicken", "name": "Chicken Breast", "sugar_per_100g": 0.0, "calories_per_100g": 165, "category": "Protein"},
            {"id": "pop_rice", "name": "White Rice", "sugar_per_100g": 0.1, "calories_per_100g": 130, "category": "Grains"},
            {"id": "pop_bread", "name": "Whole Wheat Bread", "sugar_per_100g": 2.5, "calories_per_100g": 247, "category": "Grains"},
        ]
        
        if category:
            return [food for food in popular_foods if food["category"].lower() == category.lower()]
        
        return popular_foods

# Global instance
passio_service = PassioService()