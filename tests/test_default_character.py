"""测试默认形象功能"""
import os
import sys
from pathlib import Path

# 添加项目根目录到路径
sys.path.insert(0, str(Path(__file__).parent))

# 设置环境变量
os.environ.setdefault("DATA_DIR", "data")

from app.user_config import UserConfig

def test_default_character():
    """测试默认形象加载"""
    print("=" * 50)
    print("测试默认形象功能")
    print("=" * 50)
    
    # 1. 检查默认形象文件是否存在
    default_image = Path("generated_images/default_character.jpeg")
    print(f"\n1. 检查默认形象文件: {default_image}")
    if default_image.exists():
        print(f"   ✅ 默认形象存在，大小: {default_image.stat().st_size} bytes")
    else:
        print(f"   ❌ 默认形象不存在")
        return
    
    # 2. 清空用户配置（模拟新用户）
    print(f"\n2. 清空用户配置（模拟新用户）")
    user_config = UserConfig("data")
    config_file = Path("data/user_config.json")
    if config_file.exists():
        config_file.unlink()
        print(f"   ✅ 已删除旧配置")
    
    # 3. 加载配置（应该创建新配置）
    print(f"\n3. 加载用户配置")
    config = user_config.load_config()
    print(f"   配置内容: {config}")
    
    # 4. 检查是否有形象
    if config.get('character', {}).get('image_url'):
        print(f"   ✅ 已有形象: {config['character']['image_url']}")
    else:
        print(f"   ℹ️  暂无形象（需要通过 API 端点加载）")
    
    # 5. 模拟 API 调用加载默认形象
    print(f"\n4. 模拟加载默认形象")
    if not config.get('character', {}).get('image_url'):
        user_config.save_character_image(
            image_url=str(default_image),
            prompt="默认治愈系小猫形象",
            preferences={
                "color": "薰衣草紫",
                "personality": "温柔",
                "appearance": "无配饰",
                "role": "陪伴式朋友"
            }
        )
        print(f"   ✅ 默认形象已保存")
    
    # 6. 重新加载配置验证
    print(f"\n5. 验证配置")
    config = user_config.load_config()
    if config.get('character', {}).get('image_url'):
        print(f"   ✅ 形象 URL: {config['character']['image_url']}")
        print(f"   ✅ 偏好设置: {config['character'].get('preferences', {})}")
    else:
        print(f"   ❌ 形象加载失败")
    
    print("\n" + "=" * 50)
    print("测试完成！")
    print("=" * 50)

if __name__ == "__main__":
    test_default_character()
