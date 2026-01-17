# 治愈系记录助手 - SoulMate AI Companion

一个温暖、治愈的 AI 陪伴应用，帮助你记录心情、捕捉灵感、管理待办，并随时与 AI 助手对话。

## 🌟 核心特性

- 🎨 **精美 WebUI** - React + TypeScript 构建的现代化界面
- 🤖 **AI 语义解析** - 智能提取情绪、灵感和待办事项
- 💬 **AI 对话陪伴** - 随时与温暖的 AI 助手聊天
- 🎤 **语音输入** - 支持语音转文字（ASR）
- 🖼️ **AI 形象定制** - 生成专属的治愈系猫咪角色（720 种组合）
- 💾 **本地存储** - 数据和图片安全保存在本地

## 🚀 快速开始

### 环境要求

- Python 3.8+
- Node.js 16+
- npm 或 yarn

### 1. 安装依赖

```bash
# 后端依赖
pip install -r requirements.txt

# 前端依赖
cd frontend
npm install
cd ..
```

### 2. 配置环境变量

创建 `.env` 文件：

```bash
# 必需：智谱 AI API 密钥（用于语义解析和对话）
ZHIPU_API_KEY=your_zhipu_api_key_here

# 可选：MiniMax API（用于生成角色形象）
MINIMAX_API_KEY=your_minimax_api_key_here
MINIMAX_GROUP_ID=your_minimax_group_id_here

# 可选：服务配置
DATA_DIR=data
LOG_LEVEL=INFO
HOST=0.0.0.0
PORT=8000
MAX_AUDIO_SIZE=10485760
```

**获取 API 密钥：**
- 智谱 AI: https://open.bigmodel.cn/
- MiniMax: https://platform.minimaxi.com/

前端配置 `frontend/.env.local`：
```bash
VITE_API_URL=http://localhost:8000
```

### 3. 启动服务

**方式 1：手动启动（推荐）**

终端 1 - 启动后端：
```bash
python -m uvicorn app.main:app --reload
```

终端 2 - 启动前端：
```bash
cd frontend
npm run dev
```

**方式 2：使用启动脚本**

Windows CMD:
```bash
start_dev.bat
```

PowerShell:
```bash
.\start_dev.ps1
```

### 4. 访问应用

- 🌐 **前端界面**: http://localhost:5173
- 🔧 **后端 API**: http://localhost:8000
- 📚 **API 文档**: http://localhost:8000/docs

## 🎯 核心功能

### 1. 智能语义解析

输入文本或语音，AI 自动提取：
- **情绪** - 类型、强度（1-10）、关键词
- **灵感** - 核心观点、标签、分类
- **待办** - 任务、时间、地点

**示例：**
```
输入："今天工作很累，但看到晚霞很美。明天要整理项目文档。"

输出：
- 情绪: 疲惫 (强度: 7)
- 灵感: 晚霞的美好
- 待办: 整理项目文档 (明天)
```

### 2. AI 对话陪伴

每个页面都可以点击对话按钮，与 AI 助手聊天：
- 💬 温暖、治愈的对话风格
- 🎯 情感支持和建议
- ⚡ 实时响应
- 📱 流畅的用户体验

### 3. AI 形象定制

生成专属的治愈系猫咪 AI 陪伴形象：

**定制选项：**
- 🎨 **8 种颜色** - 温暖粉、天空蓝、薄荷绿、奶油黄、薰衣草紫、珊瑚橙、纯白、浅灰
- 😊 **6 种性格** - 活泼、温柔、聪明、慵懒、勇敢、害羞
- 👓 **5 种外观** - 戴眼镜、戴帽子、戴围巾、戴蝴蝶结、无配饰
- 🎭 **3 种角色** - 陪伴式朋友、温柔照顾型长辈、引导型老师

**使用方法：**
1. 点击主页右下角 ✨ 按钮
2. 选择偏好（两步流程）
3. 点击"生成形象"
4. 等待 30-60 秒
5. 查看新生成的 AI 形象

**图片存储：**
- 自动保存到 `generated_images/` 目录
- 文件名格式：`character_颜色_性格_时间戳.jpeg`
- 启动时自动加载最新图片
- 通过 `http://localhost:8000/generated_images/` 访问

### 4. 统一页面头部

所有页面都有一致的头部设计：
- ⬅️ **返回按钮** - 返回主页
- 🐱 **角色形象** - 显示 AI 头像和在线状态
- 📝 **页面标题** - 当前页面名称
- 💬 **对话按钮** - 打开对话界面

### 5. 数据可视化

- **心情气泡图** - 情绪以气泡形式展示，可点击查看详情
- **灵感卡片** - 精美的卡片式展示，支持添加（文本+语音）
- **待办列表** - 清晰的任务列表，显示日期和地点

## 📁 项目结构

```
voice-text-processor/
├── app/                    # 后端代码
│   ├── main.py            # FastAPI 应用入口
│   ├── semantic_parser.py # AI 语义解析
│   ├── asr_service.py     # 语音识别
│   ├── image_service.py   # AI 图像生成
│   ├── storage.py         # 数据存储
│   ├── user_config.py     # 用户配置
│   └── models.py          # 数据模型
├── frontend/              # 前端代码
│   ├── components/        # React 组件
│   │   ├── AIEntity.tsx          # AI 形象
│   │   ├── PageHeader.tsx        # 页面头部
│   │   ├── ChatDialog.tsx        # 对话界面
│   │   ├── CharacterCustomizationDialog.tsx  # 形象定制
│   │   ├── MoodView.tsx          # 心情视图
│   │   ├── InspirationView.tsx   # 灵感视图
│   │   ├── TodoView.tsx          # 待办视图
│   │   └── ...
│   ├── services/          # API 服务层
│   │   └── api.ts        # API 调用封装
│   ├── utils/            # 工具函数
│   │   └── dataTransform.ts  # 数据转换
│   ├── App.tsx           # 主应用
│   └── types.ts          # 类型定义
├── data/                  # 数据存储
│   ├── records.json      # 完整记录
│   ├── moods.json        # 情绪数据
│   ├── inspirations.json # 灵感数据
│   ├── todos.json        # 待办数据
│   └── user_config.json  # 用户配置
├── generated_images/      # AI 生成的角色图片
├── tests/                # 测试代码
├── .env                  # 环境变量配置
└── README.md
```

## 🔌 API 端点

### 核心功能

| 方法 | 端点 | 功能 |
|------|------|------|
| POST | `/api/process` | 处理文本/语音输入 |
| POST | `/api/chat` | 与 AI 助手对话 |
| GET | `/api/records` | 获取所有记录 |
| GET | `/api/moods` | 获取情绪数据 |
| GET | `/api/inspirations` | 获取灵感 |
| GET | `/api/todos` | 获取待办事项 |
| PATCH | `/api/todos/{id}` | 更新待办状态 |
| GET | `/api/user/config` | 获取用户配置 |
| POST | `/api/character/generate` | 生成角色形象 |
| POST | `/api/character/preferences` | 更新角色偏好 |
| GET | `/health` | 健康检查 |

### API 示例

#### 处理文本输入
```bash
curl -X POST http://localhost:8000/api/process \
  -F "text=今天心情很好，想到了一个新点子，明天要记得买书"
```

#### 与 AI 对话
```bash
curl -X POST http://localhost:8000/api/chat \
  -F "text=你好呀"
```

#### 生成角色形象
```bash
curl -X POST http://localhost:8000/api/character/generate \
  -F "color=温暖粉" \
  -F "personality=温柔" \
  -F "appearance=无配饰" \
  -F "role=陪伴式朋友"
```

## 🧪 测试

### 运行测试

```bash
# 后端测试
pytest

# 验证项目状态
python 验证项目状态.py

# 测试本地图片加载
python 测试本地图片加载.py
```

### 手动测试

访问测试页面：http://localhost:5173/test-api.html

## 🛠️ 技术栈

### 后端
- **FastAPI** - 现代化 Web 框架
- **Pydantic** - 数据验证
- **Uvicorn** - ASGI 服务器
- **智谱 AI** - ASR 和语义解析
- **MiniMax** - 图像生成
- **httpx** - 异步 HTTP 客户端

### 前端
- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库

### 数据存储
- **JSON 文件** - 本地持久化
- **静态文件服务** - 图片访问

## 🔍 故障排查

### 常见问题

#### Q: 前端无法连接后端
**A**: 检查：
1. 后端是否启动: `curl http://localhost:8000/health`
2. CORS 配置是否正确
3. `VITE_API_URL` 环境变量是否正确

#### Q: 语音识别不工作
**A**: 检查：
1. 浏览器是否支持 MediaRecorder API
2. 是否允许麦克风权限
3. `ZHIPU_API_KEY` 是否配置正确

#### Q: 对话功能无响应
**A**: 检查：
1. 后端日志: `tail -f logs/app.log`
2. 浏览器控制台是否有错误
3. 网络请求是否成功

#### Q: AI 形象生成失败
**A**: 检查：
1. `MINIMAX_API_KEY` 是否配置
2. API 配额是否充足
3. 网络连接是否正常
4. 查看详细错误信息

#### Q: 图片不显示
**A**: 检查：
1. `generated_images/` 目录是否存在
2. 图片文件是否存在
3. 静态文件服务是否启动
4. 访问 `http://localhost:8000/generated_images/文件名.jpeg`

#### Q: 端口被占用
**A**: 更改端口：
```bash
# 后端
python -m uvicorn app.main:app --reload --port 8001

# 前端
npm run dev -- --port 5174
```

### 查看日志

```bash
# 后端日志
tail -f logs/app.log

# 或在 Windows 中
Get-Content logs/app.log -Wait
```

## ⚙️ 配置说明

### 环境变量

| 变量 | 必需 | 默认值 | 说明 |
|------|------|--------|------|
| `ZHIPU_API_KEY` | ✅ | - | 智谱 AI API 密钥 |
| `MINIMAX_API_KEY` | ❌ | - | MiniMax API 密钥（图像生成） |
| `MINIMAX_GROUP_ID` | ❌ | - | MiniMax Group ID |
| `DATA_DIR` | ❌ | `data` | 数据存储目录 |
| `LOG_LEVEL` | ❌ | `INFO` | 日志级别 |
| `HOST` | ❌ | `0.0.0.0` | 服务器地址 |
| `PORT` | ❌ | `8000` | 服务器端口 |
| `MAX_AUDIO_SIZE` | ❌ | `10485760` | 最大音频文件大小 |

## 📚 文档

- **PRD.md** - 产品需求文档
- **启动.txt** - 详细启动说明
- **API 文档** - http://localhost:8000/docs

## 🎯 使用指南

### 基本使用流程

1. **启动应用**
   - 启动后端和前端服务
   - 访问 http://localhost:5173

2. **记录心情**
   - 点击"心情"按钮
   - 查看情绪气泡图
   - 点击气泡查看详情
   - 点击对话按钮与 AI 聊天

3. **捕捉灵感**
   - 点击"灵感"按钮
   - 浏览灵感卡片
   - 点击 ✨ 按钮添加新灵感
   - 支持文本输入或语音录制

4. **管理待办**
   - 点击"待办"按钮
   - 查看待办列表（显示日期和地点）
   - 完成任务打勾

5. **定制 AI 形象**
   - 点击主页右下角 ✨ 按钮
   - 选择颜色、性格、外观、角色
   - 点击"生成形象"
   - 等待生成完成

6. **与 AI 对话**
   - 任意页面点击对话按钮
   - 输入消息
   - 按 Enter 发送
   - 查看 AI 回复

## 🎨 UI 特点

### 视觉设计
- 柔和的紫粉渐变色调
- 毛玻璃效果（backdrop-blur）
- 圆润的卡片和按钮
- 流畅的动画过渡

### 交互体验
- 统一的页面头部
- 可点击的情绪气泡
- 实时的 AI 对话
- 友好的错误提示
- 加载状态反馈

### 响应式设计
- 适配不同屏幕尺寸
- 移动端友好
- 触摸优化

## 🚀 部署

### 生产环境构建

**前端：**
```bash
cd frontend
npm run build
```

构建产物在 `frontend/dist/`

**后端：**
```bash
# 使用 gunicorn
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 🎓 开发指南

### 添加新功能

1. **后端 API**
   - 在 `app/main.py` 添加新端点
   - 更新 API 文档

2. **前端组件**
   - 在 `frontend/components/` 创建新组件
   - 在 `App.tsx` 中集成

3. **数据模型**
   - 在 `app/models.py` 定义数据结构
   - 更新存储逻辑

### 代码规范

- Python: PEP 8
- TypeScript: ESLint
- 提交信息: Conventional Commits

## 📈 性能优化

### 前端优化
- 组件懒加载
- 数据缓存
- 乐观更新
- 图片懒加载

### 后端优化
- 异步处理
- 连接池复用
- 响应压缩
- 静态文件缓存

## 🔐 安全机制

### API Key 保护
- 存储在 `.env` 文件
- 不提交到版本控制
- 日志中自动过滤

### 输入验证
- 前端基本格式验证
- 后端 Pydantic 模型验证
- 文件大小和格式限制

### CORS 配置
- 仅允许特定域名
- 开发环境: localhost
- 生产环境: 配置实际域名

## 🎯 未来计划

### 功能增强
- [ ] WebSocket 实时推送
- [ ] 图片上传和展示
- [ ] 社区功能实现
- [ ] 用户认证和授权
- [ ] 数据导出和备份
- [ ] 多语言支持
- [ ] 主题切换
- [ ] 形象历史记录

### 性能优化
- [ ] 前端代码分割
- [ ] API 响应缓存
- [ ] 虚拟滚动列表
- [ ] Service Worker

### 部署
- [ ] Docker 容器化
- [ ] CI/CD 流程
- [ ] 生产环境配置
- [ ] 监控和日志

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 开发流程
1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请提交 Issue。

---

**祝你使用愉快！让 AI 陪伴你的每一天 🌟**
