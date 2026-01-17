@echo off
echo Starting SoulMate AI Development Environment...
echo.

REM Start backend in a new window
echo Starting Backend Server...
start "Backend Server" cmd /k "python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a bit for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in a new window
echo Starting Frontend Dev Server...
start "Frontend Dev Server" cmd /k "cd frontend && npm run dev"

echo.
echo Development servers starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to stop all servers...
pause > nul

REM Kill the processes
taskkill /FI "WindowTitle eq Backend Server*" /T /F
taskkill /FI "WindowTitle eq Frontend Dev Server*" /T /F
