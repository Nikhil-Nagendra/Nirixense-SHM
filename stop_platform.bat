@echo off
echo Stopping Nirixense SHM Platform...

echo 1. Stopping Windows Native Processes...
taskkill /f /im "Nirixense Backend" /t 2>nul
taskkill /f /im "Nirixense Frontend" /t 2>nul
taskkill /f /im "Nirixense Simulator" /t 2>nul
taskkill /f /im node.exe 2>nul
taskkill /f /im python.exe 2>nul

echo 2. Stopping Docker Containers...
docker-compose stop db redis

echo =========================================
echo Platform Successfully Stopped!
echo =========================================
pause
