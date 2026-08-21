@echo off
cd /d C:\Users\user\Documents\AllGasKlima-CRM

REM Ελεγχος αν τρεχει η πορτα 5001
netstat -ano | findstr "LISTENING" | findstr ":5001" >nul

if errorlevel 1 (
    REM Ξεκινα Flask μονο αν δεν τρεχει
    powershell -WindowStyle Hidden -Command "Start-Process python -ArgumentList 'backend\app.py' -WindowStyle Hidden"
    timeout /t 2 /nobreak >nul
)

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