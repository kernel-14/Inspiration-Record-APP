# 🚀 Hugging Face Spaces 部署指南

## ✅ 部署前检查清单

### 1. 根目录必需文件

确保以下文件在**根目录**（不是子目录）：

- ✅ `Dockerfile` - Docker 构建配置
- ✅ `start.py` - 应用启动脚本
- ✅ `requirements.txt` - Python 依赖
- ✅ `README_HF.md` - Hugging Face 专用 README（带 frontmatter）

### 2. 前端构建文件

确保前端已构建：

```bash
cd frontend
npm install
npm run build
```

检查 `frontend/dist/` 目录是否存在且包含：
- ✅ `index.html`
- ✅ `assets/` 目录（包含 JS 和 CSS 文件）

### 3. 环境变量配置

在 Hugging Face Space 的 **Settings → Variables and secrets** 中配置：

**必需：**
- `ZHIPU_API_KEY` - 智谱 AI API 密钥

**可选：**
- `MINIMAX_API_KEY` - MiniMax API 密钥
- `MINIMAX_GROUP_ID` - MiniMax Group ID

### 4. README 配置

确保 `README_HF.md` 包含正确的 frontmatter：

```yaml
---
title: Nora - 治愈系记录助手
emoji: 🌟
colorFrom: purple
colorTo: pink
sdk: docker
pinned: false
license: mit
---
```

## 🔧 部署步骤

### 方法 1：通过 GitHub 同步（推荐）

1. **提交所有更改到 GitHub**：
   ```bash
   git add .
   git commit -m "Fix: Add required files to root directory for HF deployment"
   git push origin main
   ```

2. **在 Hugging Face Space 中同步**：
   - 进入你的 Space：https://huggingface.co/spaces/kernel14/Nora
   - 点击 **Settings**
   - 找到 **Sync from GitHub** 部分
   - 点击 **Sync now**

3. **等待构建完成**：
   - 查看 **Logs** 标签页
   - 等待 Docker 构建完成（可能需要 5-10 分钟）

### 方法 2：直接上传文件

1. **在 Hugging Face Space 中上传文件**：
   - 进入 **Files** 标签页
   - 上传以下文件到根目录：
     - `Dockerfile`
     - `start.py`
     - `requirements.txt`
     - `README_HF.md`（重命名为 `README.md`）

2. **上传应用代码**：
   - 上传 `app/` 目录
   - 上传 `data/` 目录
   - 上传 `frontend/dist/` 目录

3. **触发重新构建**：
   - 点击 **Factory reboot**

## 🐛 常见问题

### 问题 1：Space 显示 "Missing app file"

**原因**：根目录缺少 `Dockerfile` 或 `start.py`

**解决方案**：
1. 确认根目录有 `Dockerfile` 和 `start.py`
2. 如果使用 GitHub 同步，确保这些文件已提交并推送
3. Factory reboot 重启 Space

### 问题 2：Docker 构建失败

**原因**：依赖安装失败或文件路径错误

**解决方案**：
1. 查看 **Logs** 标签页的详细错误信息
2. 检查 `requirements.txt` 是否正确
3. 检查 `Dockerfile` 中的路径是否正确

### 问题 3：前端无法加载

**原因**：`frontend/dist/` 目录不存在或未包含在 Docker 镜像中

**解决方案**：
1. 本地运行 `cd frontend && npm run build`
2. 确认 `frontend/dist/` 目录存在
3. 提交并推送到 GitHub
4. 重新同步 Space

### 问题 4：API 调用失败

**原因**：未配置环境变量

**解决方案**：
1. 在 Space Settings 中配置 `ZHIPU_API_KEY`
2. Factory reboot 重启 Space
3. 检查 Logs 确认环境变量已加载

## 📊 验证部署

部署成功后，访问你的 Space URL，应该能看到：

1. ✅ 前端页面正常加载
2. ✅ AI 角色形象显示
3. ✅ 可以进行文本输入
4. ✅ 可以查看心情、灵感、待办数据

测试 API 端点：
- `https://你的space.hf.space/health` - 应该返回健康状态
- `https://你的space.hf.space/docs` - 应该显示 API 文档

## 🔄 更新部署

当你更新代码后：

1. **提交到 GitHub**：
   ```bash
   git add .
   git commit -m "Update: 描述你的更改"
   git push origin main
   ```

2. **同步到 Hugging Face**：
   - 在 Space Settings 中点击 **Sync now**
   - 或者等待自动同步（如果已配置）

3. **重启 Space**（如果需要）：
   - 点击 **Factory reboot**

## 📚 相关文档

- [Hugging Face Spaces 文档](https://huggingface.co/docs/hub/spaces)
- [Docker SDK 文档](https://huggingface.co/docs/hub/spaces-sdks-docker)
- [项目完整文档](README.md)

## 🆘 需要帮助？

如果遇到问题：

1. 查看 Space 的 **Logs** 标签页
2. 检查 **Community** 标签页的讨论
3. 在 GitHub 仓库提 Issue
