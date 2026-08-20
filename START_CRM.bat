@echo off
cd /d C:\Users\user\Documents\AllGasKlima-CRM

REM Ξεκινά τον Flask server κρυφά
powershell -WindowStyle Hidden -Command ^
    "Start-Process python -ArgumentList 'backend\app.py' -WindowStyle Hidden"

timeout /t 2 /nobreak >nul

REM Ξεκινά τον Call Listener κρυφά
powershell -WindowStyle Hidden -Command ^
    "Start-Process python -ArgumentList 'backend\caller_listener.py' -WindowStyle Hidden"

timeout /t 2 /nobreak >nul

REM Ανοίγει μόνο το CRM
start "" "http://127.0.0.1:5001"

exit