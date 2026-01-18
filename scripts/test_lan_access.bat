@echo off
chcp 65001 >nul
echo ============================================================
echo 🔍 局域网访问测试工具
echo ============================================================
echo.

echo [1/4] 检查后端服务...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 后端服务正常运行
) else (
    echo ❌ 后端服务未运行或无法访问
    echo    请先运行: python scripts/start_local.py
    pause
    exit /b 1
)
echo.

echo [2/4] 获取本机 IP 地址...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    set IP=!IP: =!
    echo 📍 本机 IP: !IP!
    goto :found_ip
)
:found_ip
echo.

echo [3/4] 测试 API 端点...
echo.
echo 测试 /health:
curl -s http://localhost:8000/health
echo.
echo.
echo 测试 /api/status:
curl -s http://localhost:8000/api/status
echo.
echo.

echo [4/4] 检查防火墙状态...
netsh advfirewall show allprofiles state | findstr "状态\|State"
echo.

echo ============================================================
echo 📋 测试总结
echo ============================================================
echo.
echo ✅ 如果上面的测试都成功，请在其他设备上访问：
echo    http://!IP!:8000/
echo.
echo 🔍 如果其他设备无法访问，请访问诊断页面：
echo    http://!IP!:8000/test-connection.html
echo.
echo 📚 详细排查步骤请参考：
echo    docs/局域网访问快速修复.md
echo.
echo ============================================================
pause
