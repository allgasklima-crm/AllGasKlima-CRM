@echo off
cd /d C:\Users\user\Documents\AllGasKlima-CRM

REM Κλεισιμο παλιου Flask server στην πορτα 5001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr "LISTENING" ^| findstr ":5001"') do (
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 1 /nobreak >nul

REM Εκκινηση νεου Flask server
powershell -WindowStyle Hidden -Command "Start-Process python -ArgumentList 'backend\app.py' -WindowStyle Hidden"

timeout /t 2 /nobreak >nul

REM Ελεγχος αν τρεχει η αναγνωριση κλησεων
powershell -Command "$p = Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'python.exe' -and $_.CommandLine -like '*caller_listener.py*' }; if ($p) { exit 0 } else { exit 1 }"

if errorlevel 1 (
    REM Ξεκινα Caller Listener μονο αν δεν τρεχει
    powershell -WindowStyle Hidden -Command "Start-Process python -ArgumentList 'backend\caller_listener.py' -WindowStyle Hidden"
)

timeout /t 2 /nobreak >nul

REM Ανοιγει το CRM
start "" "http://127.0.0.1:5001"

exit