@echo off
cd /d "%~dp0"

start "AllGasKlima CRM Server" cmd /k python backend\app.py

timeout /t 2 /nobreak >nul

start "AllGasKlima Call Listener" cmd /k python backend\caller_listener.py

timeout /t 2 /nobreak >nul

start "" http://127.0.0.1:5000

exit