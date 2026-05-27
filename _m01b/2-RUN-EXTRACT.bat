@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0m01b-extract.ps1"
echo BATDONE> "%~dp0extract-batdone.txt"
