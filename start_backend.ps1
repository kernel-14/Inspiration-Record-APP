# Start backend server
$process = Start-Process python -ArgumentList "-m","uvicorn","app.main:app","--host","0.0.0.0","--port","8000" -PassThru -NoNewWindow
Write-Host "Backend server started with PID: $($process.Id)"
Write-Host "Access at: http://localhost:8000"
