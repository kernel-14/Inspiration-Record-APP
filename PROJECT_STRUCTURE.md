# 项目目录结构

```
Inspiration-Record-APP/
├── app/                      # 后端应用代码
│   ├── __init__.py
│   ├── main.py              # FastAPI 主应用
│   ├── config.py            # 配置管理
│   ├── models.py            # 数据模型
│   ├── storage.py           # 数据存储
│   ├── asr_service.py       # 语音识别服务
│   ├── semantic_parser.py   # 语义解析服务
│   ├── image_service.py     # 图像生成服务
│   ├── user_config.py       # 用户配置管理
│   └── logging_config.py    # 日志配置
│
├── frontend/                 # 前端应用
│   ├── components/          # React 组件
│   ├── services/            # API 服务
│   ├── utils/               # 工具函数
│   ├── dist/                # 构建产物（部署需要）
│   ├── App.tsx              # 主应用组件
│   ├── index.tsx            # 入口文件
│   ├── types.ts             # TypeScript 类型定义
│   ├── package.json         # 前端依赖
│   └── vite.config.ts       # Vite 配置
│
├── data/                     # 数据存储目录
│   ├── moods.json           # 心情数据
│   ├── inspirations.json    # 灵感数据
│   ├── todos.json           # 待办数据
│   ├── records.json         # 记录数据
│   └── user_config.json     # 用户配置
│
├── generated_images/         # AI 生成的图片
│   └── default_character.jpeg  # 默认形象
│
├── logs/                     # 日志文件
│   └── app.log
│
├── tests/                    # 测试文件
│   ├── test_*.py            # 单元测试
│   ├── test_api.html        # API 测试页面
│   ├── test_chat_api.py     # 聊天 API 测试
│   └── test_default_character.py  # 默认形象测试
│
├── scripts/                  # 脚本文件
│   ├── start_local.py       # 本地启动脚本（8000端口）
│   ├── start_local.bat      # Windows 启动脚本
│   ├── start.py             # 通用启动脚本（7860端口）
│   ├── build_and_deploy.bat # 构建并部署脚本
│   └── build_and_deploy.sh  # Linux/Mac 部署脚本
│
├── deployment/               # 部署配置文件
│   ├── Dockerfile           # Docker 配置
│   ├── app_modelscope.py    # ModelScope 入口
│   ├── configuration.json   # ModelScope 配置
│   ├── ms_deploy.json       # ModelScope 部署配置
│   ├── requirements_hf.txt  # Hugging Face 依赖
│   ├── requirements_modelscope.txt  # ModelScope 依赖
│   ├── README_HF.md         # Hugging Face 说明
│   ├── README_MODELSCOPE.md # ModelScope 说明
│   ├── DEPLOY_CHECKLIST.md  # 部署检查清单
│   ├── DEPLOYMENT.md        # 部署指南
│   ├── deploy_to_hf.bat     # 部署到 HF 脚本
│   └── deploy_to_hf.sh      # 部署到 HF 脚本
│
├── docs/                     # 文档目录
│   ├── README.md            # 项目文档
│   ├── FEATURE_SUMMARY.md   # 功能总结
│   ├── API_配置说明.md      # API 配置说明
│   ├── 局域网访问指南.md    # 局域网访问指南
│   ├── 功能架构图.md        # 架构图
│   ├── 后端启动问题排查.md  # 故障排查
│   ├── 心情气泡池功能说明.md
│   ├── 心情气泡池快速开始.md
│   └── 语音录制问题排查.md
│
├── .github/                  # GitHub 配置
│   └── workflows/
│       └── sync.yml         # 自动同步工作流
│
├── .env                      # 环境变量（本地）
├── .env.example              # 环境变量示例
├── .gitignore                # Git 忽略文件
├── requirements.txt          # Python 依赖（开发环境）
├── pytest.ini                # Pytest 配置
├── PRD.md                    # 产品需求文档
└── README.md                 # 项目说明
```

## 目录说明

### 核心目录

- **app/** - 后端 FastAPI 应用，包含所有业务逻辑
- **frontend/** - 前端 React 应用，使用 TypeScript + Vite
- **data/** - 运行时数据存储，JSON 格式
- **generated_images/** - AI 生成的角色图片

### 开发目录

- **tests/** - 所有测试文件，包括单元测试和集成测试
- **scripts/** - 开发和部署脚本
- **logs/** - 应用日志文件

### 部署目录

- **deployment/** - 所有部署相关的配置文件
  - Hugging Face Spaces 部署
  - ModelScope 部署
  - Docker 部署

### 文档目录

- **docs/** - 项目文档和使用指南

## 快速开始

### 本地开发

```bash
# 1. 安装依赖
pip install -r requirements.txt
cd frontend && npm install && cd ..

# 2. 构建前端
cd frontend && npm run build && cd ..

# 3. 启动服务器
python scripts/start_local.py
```

### 部署

**Hugging Face:**
```bash
cd deployment
./deploy_to_hf.sh
```

**ModelScope:**
- 上传所有文件到 ModelScope
- 确保 `ms_deploy.json` 在根目录

## 文件清理说明

已删除的冗余文件：
- `app_gradio_old.py.bak` - 旧的 Gradio 备份文件
- `packages.txt` - 不再使用的包列表

已整理的文件：
- 脚本文件 → `scripts/`
- 部署文件 → `deployment/`
- 测试文件 → `tests/`
