@echo off
cd /d "%~dp0"
del /q preflight-out.txt 2>nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0m01b-preflight.ps1"
echo BATDONE> "%~dp0preflight-batdone.txt"
