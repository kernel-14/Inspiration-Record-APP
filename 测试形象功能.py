#!/usr/bin/env python3
"""测试 AI 形象功能"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_character_history():
    """测试获取历史形象"""
    print("=" * 60)
    print("测试：获取历史形象列表")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/character/history")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            images = data.get('images', [])
            print(f"✅ 找到 {len(images)} 个历史形象")
            
            for i, img in enumerate(images[:3], 1):
                print(f"\n形象 {i}:")
                print(f"  文件名: {img['filename']}")
                print(f"  颜色: {img['color']}")
                print(f"  性格: {img['personality']}")
                print(f"  URL: {img['url']}")
        else:
            print(f"❌ 请求失败: {response.text}")
    except Exception as e:
        print(f"❌ 错误: {e}")

def test_select_character():
    """测试选择历史形象"""
    print("\n" + "=" * 60)
    print("测试：选择历史形象")
    print("=" * 60)
    
    # 先获取历史形象列表
    try:
        response = requests.get(f"{BASE_URL}/api/character/history")
        if response.status_code == 200:
            images = response.json().get('images', [])
            if images:
                # 选择第一个形象
                filename = images[0]['filename']
                print(f"选择形象: {filename}")
                
                # 发送选择请求
                response = requests.post(
                    f"{BASE_URL}/api/character/select",
                    data={'filename': filename}
                )
                
                print(f"状态码: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ 选择成功")
                    print(f"  图片 URL: {data['image_url']}")
                    print(f"  偏好设置: {data['preferences']}")
                else:
                    print(f"❌ 选择失败: {response.text}")
            else:
                print("⚠️ 没有历史形象可选择")
        else:
            print(f"❌ 获取历史失败: {response.text}")
    except Exception as e:
        print(f"❌ 错误: {e}")

def test_user_config():
    """测试获取用户配置"""
    print("\n" + "=" * 60)
    print("测试：获取用户配置")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/user/config")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            character = data.get('character', {})
            print(f"✅ 获取成功")
            print(f"  图片 URL: {character.get('image_url', '未设置')}")
            print(f"  偏好设置: {character.get('preferences', {})}")
            print(f"  生成次数: {character.get('generation_count', 0)}")
        else:
            print(f"❌ 请求失败: {response.text}")
    except Exception as e:
        print(f"❌ 错误: {e}")

def main():
    print("\n🎨 AI 形象功能测试")
    print("=" * 60)
    print("确保后端服务已启动: python -m uvicorn app.main:app --reload")
    print("=" * 60)
    
    # 测试健康检查
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ 后端服务运行正常\n")
        else:
            print("❌ 后端服务异常\n")
            return
    except Exception as e:
        print(f"❌ 无法连接到后端服务: {e}\n")
        return
    
    # 运行测试
    test_character_history()
    test_select_character()
    test_user_config()
    
    print("\n" + "=" * 60)
    print("✅ 测试完成！")
    print("=" * 60)
    print("\n前端测试步骤:")
    print("1. 启动前端: cd frontend && npm run dev")
    print("2. 访问: http://localhost:5173")
    print("3. 点击右下角 ✨ 按钮")
    print("4. 切换到\"历史形象\"标签")
    print("5. 点击任意历史形象即可切换")
    print("6. 或切换到\"生成新形象\"标签创建新形象")

if __name__ == "__main__":
    main()
