"""快速示例：生成并保存角色图像"""

import asyncio
from dotenv import load_dotenv
import os

load_dotenv()

from app.image_service import ImageGenerationService


async def main():
    """快速生成一个角色图像"""
    
    print("="*80)
    print("角色图像生成")
    print("="*80)
    
    # 显示可选参数
    print("\n📋 可选参数:")
    
    print("\n颜色选项:")
    colors = ["温暖粉", "天空蓝", "薄荷绿", "奶油黄", "薰衣草紫", "珊瑚橙", "纯白", "浅灰"]
    for i, c in enumerate(colors, 1):
        print(f"  {i}. {c}")
    
    print("\n性格选项:")
    personalities = ["活泼", "温柔", "聪明", "慵懒", "勇敢", "害羞"]
    for i, p in enumerate(personalities, 1):
        print(f"  {i}. {p}")
    
    print("\n外观选项:")
    appearances = ["戴眼镜", "戴帽子", "戴围巾", "戴蝴蝶结", "无配饰"]
    for i, a in enumerate(appearances, 1):
        print(f"  {i}. {a}")
    
    print("\n角色选项:")
    roles = ["陪伴式朋友", "温柔照顾型长辈", "引导型老师"]
    for i, r in enumerate(roles, 1):
        print(f"  {i}. {r}")
    
    # 获取用户输入
    print("\n" + "="*80)
    print("请选择你的设定（输入数字，直接回车使用默认值）:")
    print("="*80)
    
    color_input = input(f"\n颜色 (1-{len(colors)}, 默认: 1): ").strip()
    color = colors[int(color_input)-1] if color_input.isdigit() and 1 <= int(color_input) <= len(colors) else colors[0]
    
    personality_input = input(f"性格 (1-{len(personalities)}, 默认: 1): ").strip()
    personality = personalities[int(personality_input)-1] if personality_input.isdigit() and 1 <= int(personality_input) <= len(personalities) else personalities[0]
    
    appearance_input = input(f"外观 (1-{len(appearances)}, 默认: 5): ").strip()
    appearance = appearances[int(appearance_input)-1] if appearance_input.isdigit() and 1 <= int(appearance_input) <= len(appearances) else appearances[4]
    
    role_input = input(f"角色 (1-{len(roles)}, 默认: 1): ").strip()
    role = roles[int(role_input)-1] if role_input.isdigit() and 1 <= int(role_input) <= len(roles) else roles[0]
    
    # 确认设定
    print("\n" + "="*80)
    print("你选择的设定:")
    print("="*80)
    print(f"  颜色: {color}")
    print(f"  性格: {personality}")
    print(f"  外观: {appearance}")
    print(f"  角色: {role}")
    
    confirm = input("\n确认生成？(y/n, 默认: y): ").strip().lower()
    if confirm == 'n':
        print("已取消")
        return
    
    # 1. 初始化服务
    api_key = os.getenv('MINIMAX_API_KEY')
    image_service = ImageGenerationService(api_key)
    
    try:
        print("\n" + "="*80)
        print("🎨 开始生成角色图像...")
        print("⏳ 请稍候，这可能需要 30-60 秒...")
        print("="*80)
        
        # 2. 生成图像
        result = await image_service.generate_image(
            color=color,
            personality=personality,
            appearance=appearance,
            role=role
        )
        
        print(f"\n✅ 生成成功！")
        print(f"图像 URL: {result['url'][:80]}...")
        
        # 3. 下载并保存到本地
        print("\n💾 下载图像...")
        
        # 生成文件名
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"character_{color}_{personality}_{timestamp}.jpeg"
        save_path = os.path.join("generated_images", filename)
        
        local_path = await image_service.download_image(
            result['url'],
            save_path
        )
        
        print(f"✅ 已保存到: {local_path}")
        print("\n🎉 完成！你可以打开图像查看效果。")
        
    except Exception as e:
        print(f"\n❌ 错误: {str(e)}")
    
    finally:
        # 4. 关闭服务
        await image_service.close()


if __name__ == "__main__":
    asyncio.run(main())
