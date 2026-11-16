@echo off
chcp 65001 >nul
echo ========================================================
echo   Tanakrit Dormitory System - Push v1.0.3 to GitHub
echo ========================================================
echo.
set "PATH=C:\Users\tanakrit\.local\git\cmd;C:\Users\tanakrit\.local\gcm;C:\Users\tanakrit\.local\gh\bin;%PATH%"

echo Checking Git status...
git status
echo.
echo Pushing commit and tags (v1.0.3) to GitHub...
git push origin main --tags

echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo   [SUCCESS] Updated to GitHub successfully!
    echo   Repository: https://github.com/tanakritphetdum-code/Tanakrit-Dormitoy-Website
    echo ========================================================
) else (
    echo ========================================================
    echo   [NOTICE] If browser window opened, please click Sign in.
    echo   Or run: gh auth login
    echo ========================================================
)
echo.
pause
