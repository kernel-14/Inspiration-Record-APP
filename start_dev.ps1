# PowerShell 启动脚本
Write-Host "Starting SoulMate AI Development Environment..." -ForegroundColor Cyan
Write-Host ""

# 检查后端依赖
Write-Host "Checking backend dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "venv")) {
    Write-Host "Virtual environment not found. Please run: python -m venv venv" -ForegroundColor Red
}

# 检查前端依赖
Write-Host "Checking frontend dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "Frontend dependencies not found. Installing..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Green
Write-Host ""

# 启动后端
Write-Host "Starting Backend Server on http://localhost:8000" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

# 等待后端启动
Start-Sleep -Seconds 3

# 启动前端
Write-Host "Starting Frontend Dev Server on http://localhost:5173" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "Development servers starting..." -ForegroundColor Green
Write-Host "Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the servers" -ForegroundColor Yellow
