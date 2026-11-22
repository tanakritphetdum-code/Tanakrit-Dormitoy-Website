@echo off
chcp 65001 >nul
echo ========================================================
echo   Tanakrit Dormitory System - Push to GitHub
echo ========================================================
echo.
set "PATH=C:\Program Files\Git\cmd;%PATH%"

echo Checking Git status...
git status
echo.
echo Adding and committing changes...
git add -A
git commit -m "Update utility rates, remove KPlogin, and improve system" 2>nul
echo.
echo Pushing to GitHub (origin main)...
git push origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo   [SUCCESS] Updated to GitHub successfully!
    echo   Repository: https://github.com/tanakritphetdum-code/Tanakrit-Dormitoy-Website
    echo ========================================================
) else (
    echo ========================================================
    echo   [NOTICE] If browser window opened, please click Sign in.
    echo ========================================================
)
echo.
pause
