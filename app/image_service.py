"""Image Generation service for Voice Text Processor.

This module implements the ImageGenerationService class for generating
cat character images using the MiniMax Text-to-Image API.

Requirements: PRD - AI形象生成模块
"""

import logging
import httpx
from typing import Optional, Dict, List
import time
import json
from pathlib import Path

logger = logging.getLogger(__name__)


class ImageGenerationError(Exception):
    """Exception raised when image generation operations fail.
    
    This exception is raised when the MiniMax API call fails,
    such as due to network issues, API errors, or invalid responses.
    """
    
    def __init__(self, message: str = "图像生成服务不可用"):
        """Initialize ImageGenerationError.
        
        Args:
            message: Error message describing the failure
        """
        super().__init__(message)
        self.message = message


class ImageGenerationService:
    """Service for generating cat character images using MiniMax API.
    
    This service handles image generation by calling the MiniMax Text-to-Image API
    to create healing-style cat illustrations based on user preferences
    (color, personality, appearance).
    
    Attributes:
        api_key: MiniMax API key for authentication
        group_id: MiniMax group ID for authentication
        client: Async HTTP client for making API requests
        api_url: MiniMax API endpoint URL
        model: Model identifier (text-to-image-v2)
    
    Requirements: PRD - AI形象生成模块
    """
    
    # 颜色映射
    COLOR_MAPPING = {
        "温暖粉": "soft pastel pink fur, rose-colored aesthetic",
        "天空蓝": "light sky blue fur, serene blue atmosphere",
        "薄荷绿": "mint green fur, fresh green ambiance",
        "奶油黄": "cream yellow fur, warm golden glow",
        "薰衣草紫": "lavender purple fur, gentle purple tones",
        "珊瑚橙": "coral orange fur, warm peachy atmosphere",
        "纯白": "pure white fur, clean minimalist aesthetic",
        "浅灰": "light gray fur, soft neutral tones"
    }
    
    # 性格映射
    PERSONALITY_MAPPING = {
        "活泼": "big curious eyes, dynamic paw gesture, energetic aura, playful expression",
        "温柔": "soft gentle eyes, calm posture, peaceful expression, caring demeanor",
        "聪明": "intelligent eyes, thoughtful expression, wise appearance, attentive look",
        "慵懒": "relaxed eyes, lounging posture, comfortable expression, laid-back vibe",
        "勇敢": "confident eyes, strong posture, determined expression, courageous stance",
        "害羞": "shy eyes, timid posture, gentle expression, reserved demeanor"
    }
    
    # 形象特征映射
    APPEARANCE_MAPPING = {
        "戴眼镜": "wearing tiny round glasses, scholarly look",
        "戴帽子": "wearing a cute small hat, fashionable style",
        "戴围巾": "wearing a cozy scarf, warm appearance",
        "戴蝴蝶结": "wearing a cute bow tie, elegant look",
        "无配饰": "natural appearance, simple and pure"
    }
    
    # 角色类型映射
    ROLE_MAPPING = {
        "陪伴式朋友": "friendly companion, approachable and warm",
        "温柔照顾型长辈": "caring elder figure, nurturing and protective",
        "引导型老师": "wise teacher figure, knowledgeable and patient"
    }
    
    # 系统底座提示词
    BASE_PROMPT = (
        "A masterpiece cute stylized cat illustration, {color} theme, "
        "{personality} facial expression and posture, {appearance}. "
        "{role}. Japanese watercolor style, clean minimalist background, "
        "high quality, soft studio lighting, 4k, healing aesthetic, "
        "adorable and heartwarming"
    )
    
    def __init__(self, api_key: str, group_id: Optional[str] = None):
        """Initialize the image generation service.
        
        Args:
            api_key: MiniMax API key for authentication
            group_id: MiniMax group ID (optional, for compatibility)
        """
        self.api_key = api_key
        self.group_id = group_id  # 保留但不使用
        self.client = httpx.AsyncClient(timeout=120.0)  # 图像生成需要更长时间
        self.api_url = "https://api.minimaxi.com/v1/image_generation"
        self.model = "image-01"
    
    async def close(self):
        """Close the HTTP client.
        
        This should be called when the service is no longer needed
        to properly clean up resources.
        """
        await self.client.aclose()
    
    async def download_image(self, url: str, save_path: str) -> str:
        """Download image from URL and save to local file.
        
        Args:
            url: Image URL to download
            save_path: Local file path to save the image
        
        Returns:
            Absolute path to the saved image file
        
        Raises:
            ImageGenerationError: If download fails
        """
        try:
            logger.info(f"Downloading image from: {url}")
            
            # 创建保存目录（如果不存在）
            save_path_obj = Path(save_path)
            save_path_obj.parent.mkdir(parents=True, exist_ok=True)
            
            # 下载图像
            response = await self.client.get(url, timeout=60.0)
            
            if response.status_code != 200:
                error_msg = f"Failed to download image: HTTP {response.status_code}"
                logger.error(error_msg)
                raise ImageGenerationError(error_msg)
            
            # 保存到文件
            with open(save_path, 'wb') as f:
                f.write(response.content)
            
            abs_path = str(save_path_obj.absolute())
            logger.info(f"Image saved to: {abs_path}")
            
            return abs_path
            
        except ImageGenerationError:
            raise
        except Exception as e:
            error_msg = f"Failed to download image: {str(e)}"
            logger.error(error_msg)
            raise ImageGenerationError(error_msg)
    
    def build_prompt(
        self,
        color: str = "温暖粉",
        personality: str = "温柔",
        appearance: str = "无配饰",
        role: str = "陪伴式朋友"
    ) -> str:
        """Build the complete prompt for image generation.
        
        Args:
            color: Color preference (温暖粉/天空蓝/薄荷绿等)
            personality: Personality trait (活泼/温柔/聪明等)
            appearance: Appearance feature (戴眼镜/戴帽子等)
            role: Character role (陪伴式朋友/温柔照顾型长辈等)
        
        Returns:
            Complete prompt string for CogView API
        """
        # 获取映射值，如果没有则使用默认值
        color_desc = self.COLOR_MAPPING.get(color, self.COLOR_MAPPING["温暖粉"])
        personality_desc = self.PERSONALITY_MAPPING.get(
            personality, 
            self.PERSONALITY_MAPPING["温柔"]
        )
        appearance_desc = self.APPEARANCE_MAPPING.get(
            appearance, 
            self.APPEARANCE_MAPPING["无配饰"]
        )
        role_desc = self.ROLE_MAPPING.get(
            role, 
            self.ROLE_MAPPING["陪伴式朋友"]
        )
        
        # 构建完整提示词
        prompt = self.BASE_PROMPT.format(
            color=color_desc,
            personality=personality_desc,
            appearance=appearance_desc,
            role=role_desc
        )
        
        logger.info(f"Generated prompt: {prompt[:100]}...")
        return prompt
    
    async def generate_image(
        self,
        color: str = "温暖粉",
        personality: str = "温柔",
        appearance: str = "无配饰",
        role: str = "陪伴式朋友",
        aspect_ratio: str = "1:1",
        n: int = 1,
        response_format: str = "url"
    ) -> Dict[str, str]:
        """Generate a cat character image using MiniMax API.
        
        This method sends a request to the MiniMax API with the constructed
        prompt and returns the generated image URL or base64 data.
        
        Args:
            color: Color preference
            personality: Personality trait
            appearance: Appearance feature
            role: Character role
            aspect_ratio: Image aspect ratio (1:1, 16:9, 9:16, 4:3, 3:4)
            n: Number of images to generate (1-4)
            response_format: Response format ("url" or "base64")
        
        Returns:
            Dictionary containing:
                - url: Image URL (if response_format="url")
                - data: Base64 image data (if response_format="base64")
                - prompt: Used prompt
                - task_id: Task ID from MiniMax
        
        Raises:
            ImageGenerationError: If API call fails or returns invalid response
        """
        try:
            # 构建提示词
            prompt = self.build_prompt(color, personality, appearance, role)
            
            # 准备请求
            headers = {
                "Authorization": f"Bearer {self.api_key.strip()}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": self.model,
                "prompt": prompt,
                "aspect_ratio": aspect_ratio,
                "response_format": "url",
                "n": n,
                "prompt_optimizer": True
            }
            
            logger.info(
                f"Calling MiniMax API for image generation. "
                f"Aspect ratio: {aspect_ratio}, Count: {n}"
            )
            logger.debug(f"API URL: {self.api_url}")
            logger.debug(f"API Key (first 20 chars): {self.api_key[:20]}...")
            logger.debug(f"Payload: {json.dumps(payload, ensure_ascii=False)}")
            
            # 发送请求
            response = await self.client.post(
                self.api_url,
                headers=headers,
                json=payload
            )
            
            # 检查响应状态
            if response.status_code != 200:
                error_msg = f"MiniMax API returned status {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f": {json.dumps(error_detail, ensure_ascii=False)}"
                except Exception:
                    error_msg += f": {response.text}"
                
                logger.error(f"Image generation API call failed: {error_msg}")
                logger.error(f"Request URL: {self.api_url}")
                logger.error(f"Request headers: Authorization=Bearer {self.api_key[:20]}..., Content-Type=application/json")
                logger.error(f"Request payload: {json.dumps(payload, ensure_ascii=False)}")
                raise ImageGenerationError(f"图像生成服务不可用: {error_msg}")
            
            # 解析响应
            try:
                result = response.json()
                logger.info(f"API Response (full): {json.dumps(result, indent=2, ensure_ascii=False)}")
            except Exception as e:
                error_msg = f"Failed to parse MiniMax API response: {str(e)}"
                logger.error(error_msg)
                logger.error(f"Raw response text: {response.text}")
                raise ImageGenerationError(f"图像生成服务不可用: 响应格式无效")
            
            # 提取图像 URL
            try:
                # MiniMax 实际返回格式：
                # {
                #   "id": "task_id",
                #   "data": {"image_urls": [...]},
                #   "metadata": {...},
                #   "base_resp": {"status_code": 0, "status_msg": "success"}
                # }
                
                # 先检查是否有 base_resp
                if "base_resp" in result:
                    base_resp = result.get("base_resp", {})
                    status_code = base_resp.get("status_code", -1)
                    error_msg = base_resp.get("status_msg", "Unknown error")
                    
                    # status_code = 0 表示成功
                    if status_code != 0:
                        logger.error(f"MiniMax API error: {status_code} - {error_msg}")
                        raise ImageGenerationError(f"图像生成失败: {error_msg}")
                    
                    logger.info(f"MiniMax API success: {status_code} - {error_msg}")
                
                # 提取 task_id（可能在 id 或 task_id 字段）
                task_id = result.get("id") or result.get("task_id", "")
                
                # 提取图像数据
                if "data" in result:
                    data = result["data"]
                    logger.info(f"Data field keys: {list(data.keys()) if isinstance(data, dict) else 'not a dict'}")
                    
                    if isinstance(data, dict):
                        # 尝试多个可能的字段名
                        urls = None
                        if "image_urls" in data:
                            urls = data["image_urls"]
                            logger.info("Found image_urls field")
                        elif "url" in data:
                            urls = data["url"]
                            logger.info("Found url field")
                        
                        if urls:
                            # 如果只生成一张，返回单个 URL
                            image_url = urls[0] if n == 1 else urls
                            logger.info(f"Image generation successful. URLs: {urls}")
                            
                            return {
                                "url": image_url,
                                "prompt": prompt,
                                "task_id": task_id,
                                "metadata": result.get("metadata", {})
                            }
                
                # 如果到这里还没有返回，说明响应格式不符合预期
                logger.error(f"Could not extract image URLs from response: {json.dumps(result, ensure_ascii=False)}")
                raise ImageGenerationError("API 响应格式错误: 无法提取图像 URL")
                
            except (KeyError, IndexError) as e:
                error_msg = f"Invalid API response structure: {str(e)}, Response: {json.dumps(result, ensure_ascii=False)}"
                logger.error(error_msg)
                raise ImageGenerationError(f"图像生成服务不可用: 响应结构无效")
        
        except ImageGenerationError:
            # Re-raise ImageGenerationError as-is
            raise
        
        except httpx.TimeoutException as e:
            error_msg = f"MiniMax API request timeout: {str(e)}"
            logger.error(error_msg)
            raise ImageGenerationError("图像生成服务不可用: 请求超时")
        
        except httpx.RequestError as e:
            error_msg = f"MiniMax API request failed: {str(e)}"
            logger.error(error_msg)
            raise ImageGenerationError(f"图像生成服务不可用: 网络错误")
        
        except Exception as e:
            error_msg = f"Unexpected error in image generation service: {str(e)}"
            logger.error(error_msg, exc_info=True)
            raise ImageGenerationError(f"图像生成服务不可用: {str(e)}")
    
    async def generate_multiple_images(
        self,
        color: str = "温暖粉",
        personality: str = "温柔",
        appearance: str = "无配饰",
        role: str = "陪伴式朋友",
        count: int = 3,
        aspect_ratio: str = "1:1"
    ) -> List[Dict[str, str]]:
        """Generate multiple cat character images.
        
        This method generates multiple images with the same parameters,
        allowing users to choose their favorite one.
        
        Args:
            color: Color preference
            personality: Personality trait
            appearance: Appearance feature
            role: Character role
            count: Number of images to generate (1-4)
            aspect_ratio: Image aspect ratio
        
        Returns:
            List of dictionaries, each containing url, prompt, and task_id
        
        Raises:
            ImageGenerationError: If any API call fails
        """
        if count < 1 or count > 4:
            raise ValueError("Count must be between 1 and 4")
        
        try:
            # MiniMax 支持一次生成多张图像
            result = await self.generate_image(
                color=color,
                personality=personality,
                appearance=appearance,
                role=role,
                aspect_ratio=aspect_ratio,
                n=count
            )
            
            # 将结果转换为列表格式
            urls = result['url'] if isinstance(result['url'], list) else [result['url']]
            
            images = []
            for i, url in enumerate(urls):
                images.append({
                    "url": url,
                    "prompt": result['prompt'],
                    "task_id": result['task_id'],
                    "index": i
                })
            
            return images
            
        except ImageGenerationError as e:
            logger.error(f"Failed to generate images: {e.message}")
            raise
