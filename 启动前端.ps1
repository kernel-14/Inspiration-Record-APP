Write-Host "========================================" -ForegroundColor Cyan
Write-Host "启动前端开发服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location frontend

Write-Host "正在启动 Vite 开发服务器..." -ForegroundColor Yellow
Write-Host ""
Write-Host "启动成功后，访问: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run dev

Read-Host "按 Enter 键退出"
