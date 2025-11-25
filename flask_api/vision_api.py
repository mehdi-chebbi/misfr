import requests
import json
import base64
import os
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class NemotronVisionAPI:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.model = "nvidia/nemotron-nano-12b-v2-vl:free"
        
        # System prompt for remote sensing expertise
        self.system_prompt = """You are an expert in remote sensing, satellite imagery analysis, and spectral indices interpretation. You specialize in:

**VEGETATION INDICES:**
- NDVI (Normalized Difference Vegetation Index): Values range from -1 to +1. Healthy vegetation: 0.6-0.9 (dark green), moderate vegetation: 0.2-0.6 (light green), sparse/stressed vegetation: 0.1-0.2 (yellow-green), bare soil/rock: -0.1-0.1 (brown/tan), water: <-0.1 (blue/black)
- EVI (Enhanced Vegetation Index): More sensitive than NDVI in high biomass areas
- SAVI (Soil Adjusted Vegetation Index): Minimizes soil brightness influences
- GNDVI (Green NDVI): Uses green band for chlorophyll content
- MSAVI (Modified SAVI): Better for low vegetation cover

**WATER INDICES:**
- NDWI (Normalized Difference Water Index): Positive values indicate water bodies, negative values indicate vegetation/land
- MNDWI (Modified NDWI): Better separates water from built-up areas
- NDMI (Normalized Difference Moisture Index): Measures vegetation water content and stress

**GEOLOGICAL & SOIL INDICES:**
- NDBI (Normalized Difference Built-up Index): Identifies urban/built-up areas
- Clay Minerals Index: Identifies clay-rich areas
- Ferrous Minerals Index: Detects iron-bearing minerals
- Soil Composition Index: Analyzes soil types

**ANALYSIS APPROACH:**
When analyzing satellite/aerial imagery:
1. Identify the type of index or imagery (multispectral, false-color, true-color)
2. Interpret color schemes (green shades for vegetation health, blue for water, red/brown for bare soil)
3. Analyze spatial patterns, textures, and gradients
4. Identify features: agricultural fields, water bodies, forests, urban areas, geological formations
5. Assess vegetation health, water presence, land use patterns
6. Detect anomalies, stress indicators, or changes in land cover

Always provide detailed, technical analysis appropriate for remote sensing professionals while remaining clear and actionable."""

    def encode_image(self, image_path: str) -> str:
        """Encode image file to base64 string."""
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            logger.error(f"Error encoding image {image_path}: {e}")
            raise

    def analyze_image(self, image_path: str, message: str = "Analyze this satellite image") -> Dict[str, Any]:
        """
        Analyze a single image with the vision model.
        
        Args:
            image_path: Path to the image file
            message: Text prompt to send with the image
            
        Returns:
            Dictionary containing the analysis result
        """
        try:
            # Encode image
            image_data = self.encode_image(image_path)
            
            # Prepare content
            content = [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image_data}"
                    }
                },
                {
                    "type": "text",
                    "text": message
                }
            ]
            
            return self._make_api_call(content)
            
        except Exception as e:
            logger.error(f"Error analyzing image: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def chat_with_images(self, message: str, image_paths: List[str] = None) -> Dict[str, Any]:
        """
        Send a text message with optional images to the vision model.
        
        Args:
            message: Text message to send
            image_paths: List of image file paths to include
            
        Returns:
            Dictionary containing the chat response
        """
        try:
            content = []
            
            # Add images if provided
            if image_paths:
                for image_path in image_paths:
                    try:
                        image_data = self.encode_image(image_path)
                        content.append({
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}"
                            }
                        })
                    except Exception as e:
                        logger.error(f"Failed to encode image {image_path}: {e}")
                        continue
            
            # Add text message
            content.append({
                "type": "text",
                "text": message
            })
            
            return self._make_api_call(content)
            
        except Exception as e:
            logger.error(f"Error in chat with images: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def simple_chat(self, message: str) -> Dict[str, Any]:
        """
        Send a simple text message to the vision model.
        
        Args:
            message: Text message to send
            
        Returns:
            Dictionary containing the response
        """
        try:
            content = [
                {
                    "type": "text",
                    "text": message
                }
            ]
            
            return self._make_api_call(content)
            
        except Exception as e:
            logger.error(f"Error in simple chat: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def _make_api_call(self, content: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Make the actual API call to OpenRouter."""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": self.system_prompt
                    },
                    {
                        "role": "user",
                        "content": content
                    }
                ]
            }
            
            logger.info(f"Making API call to {self.model}")
            
            response = requests.post(
                self.base_url,
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                assistant_message = result['choices'][0]['message']['content']
                
                logger.info("API call successful")
                
                return {
                    "success": True,
                    "response": assistant_message,
                    "model": self.model,
                    "usage": result.get('usage', {})
                }
            else:
                error_msg = f"API Error: {response.status_code} - {response.text}"
                logger.error(error_msg)
                return {
                    "success": False,
                    "error": error_msg
                }
                
        except requests.exceptions.Timeout:
            error_msg = "Request timed out after 60 seconds"
            logger.error(error_msg)
            return {
                "success": False,
                "error": error_msg
            }
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            return {
                "success": False,
                "error": error_msg
            }

# Global instance (will be initialized with API key)
vision_api: Optional[NemotronVisionAPI] = None

def initialize_vision_api(api_key: str):
    """Initialize the global vision API instance."""
    global vision_api
    vision_api = NemotronVisionAPI(api_key)
    logger.info("Vision API initialized successfully")

def get_vision_api() -> Optional[NemotronVisionAPI]:
    """Get the global vision API instance."""
    return vision_api