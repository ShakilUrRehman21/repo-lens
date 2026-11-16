@echo off
title RepoLens - localhost:3004
cd /d "%~dp0"
set NEED_INSTALL=
if not exist node_modules\.bin\next.cmd set NEED_INSTALL=1
if not exist node_modules\framer-motion set NEED_INSTALL=1
if defined NEED_INSTALL (
  echo Installing dependencies, this can take a few minutes...
  call npm install
  if errorlevel 1 (
    echo npm install failed. See the messages above.
    pause
    exit /b 1
  )
)
echo Starting RepoLens on http://localhost:3004
start "" cmd /c "timeout /t 10 /nobreak >nul && start http://localhost:3004"
call npm run dev -- -p 3004
pause
