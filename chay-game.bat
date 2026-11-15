@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
title Pho Minh - Game khu pho
cd /d "%~dp0"
echo PHO MINH - Dang mo game, vui long giu cua so nay.
echo.
if not exist "%~dp0runtime\node.exe" goto missing_runtime
if not exist "%~dp0dist\index.html" goto missing_game
if not exist "%~dp0scripts\play-game.cjs" goto missing_game
"%~dp0runtime\node.exe" "%~dp0scripts\play-game.cjs" --open
set "PHO_EXIT=%ERRORLEVEL%"
echo.
echo Pho Minh: http://localhost:4179/
echo Neu chua mo duoc, xem launcher.log trong thu muc game.
echo Nhan phim bat ky de dong cua so nay.
pause >nul
exit /b %PHO_EXIT%
:missing_runtime
echo [LOI] Thieu runtime\node.exe. Hay giai nen TOAN BO goi ZIP moi.
echo Khong chay file bat bat ngay ben trong cua so xem ZIP.
pause
exit /b 1
:missing_game
echo [LOI] Thieu file game. Hay giai nen TOAN BO goi ZIP moi.
pause
exit /b 1
