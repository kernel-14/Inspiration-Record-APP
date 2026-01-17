"""
快速测试脚本 - 验证后端和前端集成
"""

import asyncio
import httpx
import sys

API_URL = "http://localhost:8000"

async def test_backend():
    """测试后端 API"""
    print("🧪 测试后端 API...")
    print("-" * 50)
    
    async with httpx.AsyncClient() as client:
        # 1. 健康检查
        print("\n1️⃣ 健康检查...")
        try:
            response = await client.get(f"{API_URL}/health", timeout=5.0)
            if response.status_code == 200:
                print("✅ 后端服务正常运行")
                print(f"   响应: {response.json()}")
            else:
                print(f"❌ 健康检查失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 无法连接到后端: {e}")
            print(f"   请确保后端已启动: python -m uvicorn app.main:app --reload")
            return False
        
        # 2. 测试文本处理
        print("\n2️⃣ 测试文本处理...")
        try:
            test_text = "今天心情很好，想到了一个新点子，明天要记得买书"
            response = await client.post(
                f"{API_URL}/api/process",
                data={"text": test_text},
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ 文本处理成功")
                print(f"   记录 ID: {result.get('record_id')}")
                
                if result.get('mood'):
                    print(f"   情绪: {result['mood'].get('type')} (强度: {result['mood'].get('intensity')})")
                
                if result.get('inspirations'):
                    print(f"   灵感数量: {len(result['inspirations'])}")
                    for insp in result['inspirations']:
                        print(f"     - {insp.get('core_idea')}")
                
                if result.get('todos'):
                    print(f"   待办数量: {len(result['todos'])}")
                    for todo in result['todos']:
                        print(f"     - {todo.get('task')}")
            else:
                print(f"❌ 文本处理失败: {response.status_code}")
                print(f"   响应: {response.text}")
                return False
        except Exception as e:
            print(f"❌ 文本处理出错: {e}")
            return False
        
        # 3. 测试数据获取
        print("\n3️⃣ 测试数据获取...")
        endpoints = [
            ("/api/records", "记录"),
            ("/api/moods", "情绪"),
            ("/api/inspirations", "灵感"),
            ("/api/todos", "待办")
        ]
        
        for endpoint, name in endpoints:
            try:
                response = await client.get(f"{API_URL}{endpoint}", timeout=5.0)
                if response.status_code == 200:
                    data = response.json()
                    key = list(data.keys())[0]
                    count = len(data[key])
                    print(f"✅ {name}: {count} 条数据")
                else:
                    print(f"❌ {name}获取失败: {response.status_code}")
            except Exception as e:
                print(f"❌ {name}获取出错: {e}")
        
        # 4. 测试用户配置
        print("\n4️⃣ 测试用户配置...")
        try:
            response = await client.get(f"{API_URL}/api/user/config", timeout=5.0)
            if response.status_code == 200:
                config = response.json()
                print("✅ 用户配置获取成功")
                if config.get('character', {}).get('image_url'):
                    print(f"   角色形象: 已设置")
                else:
                    print(f"   角色形象: 未设置")
            else:
                print(f"❌ 用户配置获取失败: {response.status_code}")
        except Exception as e:
            print(f"❌ 用户配置获取出错: {e}")
    
    print("\n" + "=" * 50)
    print("✅ 后端测试完成！")
    return True


def test_frontend():
    """检查前端是否运行"""
    print("\n🎨 检查前端...")
    print("-" * 50)
    
    import socket
    
    # 检查端口 5173 是否被占用（Vite 默认端口）
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', 5173))
    sock.close()
    
    if result == 0:
        print("✅ 前端服务正在运行")
        print(f"   访问: http://localhost:5173")
        return True
    else:
        print("⚠️  前端服务未运行")
        print(f"   启动命令: cd frontend && npm run dev")
        return False


async def main():
    """主测试函数"""
    print("\n" + "=" * 50)
    print("🚀 治愈系记录助手 - 集成测试")
    print("=" * 50)
    
    # 测试后端
    backend_ok = await test_backend()
    
    # 测试前端
    frontend_ok = test_frontend()
    
    # 总结
    print("\n" + "=" * 50)
    print("📊 测试总结")
    print("=" * 50)
    print(f"后端 API: {'✅ 正常' if backend_ok else '❌ 异常'}")
    print(f"前端 UI: {'✅ 正常' if frontend_ok else '⚠️  未启动'}")
    
    if backend_ok and frontend_ok:
        print("\n🎉 所有服务运行正常！")
        print("\n📱 访问应用:")
        print("   前端界面: http://localhost:5173")
        print("   API 文档: http://localhost:8000/docs")
        print("   测试页面: http://localhost:5173/test-api.html")
    elif backend_ok:
        print("\n⚠️  后端正常，但前端未启动")
        print("   启动前端: cd frontend && npm run dev")
    else:
        print("\n❌ 后端服务异常，请检查配置")
        print("   启动后端: python -m uvicorn app.main:app --reload")
    
    print("\n" + "=" * 50)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n测试已取消")
        sys.exit(0)
