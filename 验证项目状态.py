#!/usr/bin/env python3
"""验证项目状态脚本 - 检查所有组件是否就绪"""

import os
import sys
import json
from pathlib import Path

def check_env_file():
    """检查 .env 文件"""
    print("🔍 检查环境配置...")
    
    if not os.path.exists('.env'):
        print("  ❌ .env 文件不存在")
        return False
    
    with open('.env', 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'ZHIPU_API_KEY=' in content and len(content.split('ZHIPU_API_KEY=')[1].split('\n')[0].strip()) > 0:
        print("  ✅ ZHIPU_API_KEY 已配置")
    else:
        print("  ❌ ZHIPU_API_KEY 未配置")
        return False
    
    return True

def check_data_files():
    """检查数据文件"""
    print("\n🔍 检查数据文件...")
    
    data_dir = Path('data')
    if not data_dir.exists():
        print("  ❌ data/ 目录不存在")
        return False
    
    files = ['records.json', 'moods.json', 'inspirations.json', 'todos.json', 'user_config.json']
    all_exist = True
    
    for file in files:
        file_path = data_dir / file
        if file_path.exists():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        count = len(data)
                    elif isinstance(data, dict):
                        count = "配置文件"
                    else:
                        count = "未知格式"
                    print(f"  ✅ {file} ({count})")
            except Exception as e:
                print(f"  ⚠️  {file} (格式错误: {e})")
                all_exist = False
        else:
            print(f"  ❌ {file} 不存在")
            all_exist = False
    
    return all_exist

def check_frontend():
    """检查前端配置"""
    print("\n🔍 检查前端配置...")
    
    frontend_dir = Path('frontend')
    if not frontend_dir.exists():
        print("  ❌ frontend/ 目录不存在")
        return False
    
    # 检查 package.json
    package_json = frontend_dir / 'package.json'
    if package_json.exists():
        print("  ✅ package.json 存在")
    else:
        print("  ❌ package.json 不存在")
        return False
    
    # 检查 node_modules
    node_modules = frontend_dir / 'node_modules'
    if node_modules.exists():
        print("  ✅ node_modules 已安装")
    else:
        print("  ⚠️  node_modules 未安装 (需要运行 npm install)")
    
    # 检查 .env.local
    env_local = frontend_dir / '.env.local'
    if env_local.exists():
        print("  ✅ .env.local 已配置")
    else:
        print("  ⚠️  .env.local 未配置 (可选)")
    
    # 检查 vite-env.d.ts
    vite_env = frontend_dir / 'vite-env.d.ts'
    if vite_env.exists():
        print("  ✅ vite-env.d.ts 存在")
    else:
        print("  ❌ vite-env.d.ts 不存在")
        return False
    
    return True

def check_backend():
    """检查后端配置"""
    print("\n🔍 检查后端配置...")
    
    # 检查主要模块
    modules = ['app/main.py', 'app/config.py', 'app/semantic_parser.py', 
               'app/asr_service.py', 'app/storage.py', 'app/models.py']
    
    all_exist = True
    for module in modules:
        if os.path.exists(module):
            print(f"  ✅ {module}")
        else:
            print(f"  ❌ {module} 不存在")
            all_exist = False
    
    return all_exist

def check_dependencies():
    """检查 Python 依赖"""
    print("\n🔍 检查 Python 依赖...")
    
    try:
        import fastapi
        print(f"  ✅ fastapi ({fastapi.__version__})")
    except ImportError:
        print("  ❌ fastapi 未安装")
        return False
    
    try:
        import pydantic
        print(f"  ✅ pydantic ({pydantic.__version__})")
    except ImportError:
        print("  ❌ pydantic 未安装")
        return False
    
    try:
        import httpx
        print(f"  ✅ httpx ({httpx.__version__})")
    except ImportError:
        print("  ❌ httpx 未安装")
        return False
    
    try:
        import uvicorn
        print(f"  ✅ uvicorn ({uvicorn.__version__})")
    except ImportError:
        print("  ❌ uvicorn 未安装")
        return False
    
    return True

def print_summary(results):
    """打印总结"""
    print("\n" + "="*60)
    print("📊 验证结果总结")
    print("="*60)
    
    all_passed = all(results.values())
    
    for check, passed in results.items():
        status = "✅" if passed else "❌"
        print(f"{status} {check}")
    
    print("="*60)
    
    if all_passed:
        print("\n🎉 所有检查通过！项目已就绪！")
        print("\n📝 启动步骤：")
        print("  1. 终端 1: python -m uvicorn app.main:app --reload")
        print("  2. 终端 2: cd frontend && npm run dev")
        print("  3. 访问: http://localhost:5173")
        return 0
    else:
        print("\n⚠️  部分检查未通过，请修复后再启动")
        print("\n📝 修复建议：")
        if not results['环境配置']:
            print("  - 检查 .env 文件，确保 ZHIPU_API_KEY 已配置")
        if not results['Python 依赖']:
            print("  - 运行: pip install -r requirements.txt")
        if not results['前端配置']:
            print("  - 运行: cd frontend && npm install")
        return 1

def main():
    """主函数"""
    print("🚀 开始验证项目状态...\n")
    
    results = {
        '环境配置': check_env_file(),
        '数据文件': check_data_files(),
        '前端配置': check_frontend(),
        '后端配置': check_backend(),
        'Python 依赖': check_dependencies()
    }
    
    return print_summary(results)

if __name__ == '__main__':
    sys.exit(main())
