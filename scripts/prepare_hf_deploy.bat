@echo off
chcp 65001 >nul
echo ============================================================
echo 🚀 准备 Hugging Face Spaces 部署
echo ============================================================
echo.

echo [1/5] 检查根目录必需文件...
if exist "Dockerfile" (
    echo ✅ Dockerfile 存在
) else (
    echo ❌ Dockerfile 不存在
    echo    正在从 deployment 目录复制...
    copy deployment\Dockerfile . >nul
    echo ✅ 已复制 Dockerfile
)

if exist "start.py" (
    echo ✅ start.py 存在
) else (
    echo ❌ start.py 不存在
    echo    正在从 scripts 目录复制...
    copy scripts\start.py . >nul
    echo ✅ 已复制 start.py
)

if exist "requirements.txt" (
    echo ✅ requirements.txt 存在
) else (
    echo ❌ requirements.txt 不存在！
    pause
    exit /b 1
)

if exist "README_HF.md" (
    echo ✅ README_HF.md 存在
) else (
    echo ❌ README_HF.md 不存在！
    pause
    exit /b 1
)
echo.

echo [2/5] 检查前端构建...
if exist "frontend\dist\index.html" (
    echo ✅ 前端已构建
) else (
    echo ❌ 前端未构建
    echo    正在构建前端...
    cd frontend
    call npm run build
    cd ..
    if exist "frontend\dist\index.html" (
        echo ✅ 前端构建完成
    ) else (
        echo ❌ 前端构建失败！
        pause
        exit /b 1
    )
)
echo.

echo [3/5] 检查应用代码...
if exist "app\main.py" (
    echo ✅ app/ 目录存在
) else (
    echo ❌ app/ 目录不存在！
    pause
    exit /b 1
)
echo.

echo [4/5] 检查数据目录...
if not exist "data" mkdir data
if not exist "generated_images" mkdir generated_images
echo ✅ 数据目录已准备
echo.

echo [5/5] 生成部署清单...
echo 📋 部署文件清单: > deploy_checklist.txt
echo. >> deploy_checklist.txt
echo 根目录文件: >> deploy_checklist.txt
echo   ✅ Dockerfile >> deploy_checklist.txt
echo   ✅ start.py >> deploy_checklist.txt
echo   ✅ requirements.txt >> deploy_checklist.txt
echo   ✅ README_HF.md >> deploy_checklist.txt
echo. >> deploy_checklist.txt
echo 应用代码: >> deploy_checklist.txt
echo   ✅ app/ >> deploy_checklist.txt
echo   ✅ data/ >> deploy_checklist.txt
echo   ✅ frontend/dist/ >> deploy_checklist.txt
echo   ✅ generated_images/ >> deploy_checklist.txt
echo. >> deploy_checklist.txt
echo 环境变量（需要在 HF Space Settings 中配置）: >> deploy_checklist.txt
echo   - ZHIPU_API_KEY （必需） >> deploy_checklist.txt
echo   - MINIMAX_API_KEY （可选） >> deploy_checklist.txt
echo   - MINIMAX_GROUP_ID （可选） >> deploy_checklist.txt
echo. >> deploy_checklist.txt
echo ✅ 清单已生成: deploy_checklist.txt
echo.

echo ============================================================
echo ✅ 部署准备完成！
echo ============================================================
echo.
echo 📋 下一步操作：
echo.
echo 1. 提交所有更改到 Git：
echo    git add .
echo    git commit -m "Fix: Add required files for HF deployment"
echo    git push origin main
echo.
echo 2. 在 Hugging Face Space 中同步：
echo    https://huggingface.co/spaces/kernel14/Nora
echo    Settings → Sync from GitHub → Sync now
echo.
echo 3. 配置环境变量：
echo    Settings → Variables and secrets
echo    添加 ZHIPU_API_KEY
echo.
echo 4. 等待构建完成（查看 Logs 标签页）
echo.
echo 📚 详细说明请查看: HUGGINGFACE_DEPLOY.md
echo ============================================================
pause
