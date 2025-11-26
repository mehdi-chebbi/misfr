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
        
        # System prompt for focused satellite data analysis
        self.system_prompt = """You are an expert satellite imagery analyst specializing in spectral index interpretation. 

Your role is to analyze the specific satellite data parameters provided (layer type, date range, cloud coverage) and interpret what the imagery shows.

**FOCUS AREAS:**
- Analyze the spectral index patterns based on the layer type (NDVI, NDWI, etc.)
- Interpret vegetation health, water presence, or geological features visible in the data
- Describe patterns, anomalies, or environmental conditions indicated by the imagery
- Explain what the spectral index values and patterns reveal about the area

**IMPORTANT:**
- Focus ONLY on analyzing the satellite imagery data provided
- Do NOT give location recommendations or generic advice
- Do NOT suggest what data to use or analysis approaches
- Analyze what the current imagery shows, not what could be done
- Be concise and specific to the data parameters mentioned

Provide direct analysis of the imagery patterns and what they indicate about environmental conditions."""

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

    def analyze_image_stream(self, image_path: str, message: str = "Analyze this satellite image"):
        """
        Analyze an image with streaming response.
        
        Args:
            image_path: Path to the image file
            message: Text prompt to send with the image
            
        Yields:
            String chunks of the AI response
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
            
            # Make streaming API call
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
                ],
                "stream": True
            }
            
            logger.info(f"Making streaming API call to {self.model}")
            
            response = requests.post(
                self.base_url,
                headers=headers,
                json=data,
                stream=True,
                timeout=60
            )
            
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        line_str = line.decode('utf-8')
                        if line_str.startswith('data: '):
                            data_str = line_str[6:]  # Remove 'data: ' prefix
                            if data_str.strip() == '[DONE]':
                                break
                            try:
                                chunk_data = json.loads(data_str)
                                if 'choices' in chunk_data and len(chunk_data['choices']) > 0:
                                    delta = chunk_data['choices'][0].get('delta', {})
                                    if 'content' in delta:
                                        yield delta['content']
                            except json.JSONDecodeError:
                                continue
                logger.info("Streaming API call completed successfully")
            else:
                error_msg = f"API Error: {response.status_code} - {response.text}"
                logger.error(error_msg)
                yield f"Error: {error_msg}"
                
        except requests.exceptions.Timeout:
            error_msg = "Request timed out after 60 seconds"
            logger.error(error_msg)
            yield f"Error: {error_msg}"
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            yield f"Error: {error_msg}"

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