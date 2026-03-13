@echo off
echo Starting Nirixense SHM Platform...

echo 1. Starting Database and Redis via Docker...
docker-compose up -d db redis
timeout /t 3 /nobreak >nul

echo 2. Starting FastAPI Backend...
start "Nirixense Backend" cmd /k "cd backend && set PYTHONPATH=.&& set DATABASE_URL=postgresql://nirixense:nirixense_password@localhost:5432/nirixense_db&& set REDIS_URL=redis://localhost:6379/0&& .\venv\Scripts\python -m uvicorn app.main:app --port 8000"

echo 3. Starting React Frontend...
start "Nirixense Frontend" cmd /k "cd frontend && npm run dev"

echo 4. Starting Node Data Simulator...
timeout /t 5 /nobreak >nul
start "Nirixense Simulator" cmd /k "cd backend && set PYTHONPATH=.&& .\venv\Scripts\python simulator.py"

echo =========================================
echo Platform Launched!
echo.
echo Backend API : http://localhost:8000
echo React UI    : http://localhost:5173
echo =========================================
echo.
echo To STOP the platform, run stop_platform.bat
pause
