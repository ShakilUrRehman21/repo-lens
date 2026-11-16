@echo off
title RepoLens - localhost:3004
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)
echo Starting RepoLens on http://localhost:3004
start "" cmd /c "timeout /t 10 /nobreak >nul && start http://localhost:3004"
call npm run dev -- -p 3004
pause
