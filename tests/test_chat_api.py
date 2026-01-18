"""测试 Chat API"""
import requests

def test_chat_api():
    """测试聊天 API"""
    url = "http://172.18.16.245:8000/api/chat"
    
    print("=" * 50)
    print("测试 Chat API")
    print("=" * 50)
    print(f"URL: {url}")
    
    # 测试数据
    data = {
        'text': '你好，今天天气怎么样？'
    }
    
    print(f"\n发送消息: {data['text']}")
    print("等待响应...")
    
    try:
        response = requests.post(url, data=data, timeout=60)
        
        print(f"\n状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ 成功!")
            print(f"AI 回复: {result.get('response', 'No response')}")
        else:
            print(f"\n❌ 失败!")
            print(f"错误: {response.text}")
            
    except requests.exceptions.Timeout:
        print("\n❌ 请求超时!")
    except requests.exceptions.ConnectionError:
        print("\n❌ 连接失败! 请确保服务器正在运行")
    except Exception as e:
        print(f"\n❌ 错误: {e}")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    test_chat_api()
