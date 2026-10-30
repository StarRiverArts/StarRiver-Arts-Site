@echo off
cd /d "%~dp0"
python -X utf8 serve.py --open
if errorlevel 1 pause
