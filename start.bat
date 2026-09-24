@echo off
chcp 65001 > nul
set "PATH=%PATH%;C:\Program Files\nodejs"
echo ===================================================
echo   관심 뉴스 탑3 (Summary Article App)
echo ===================================================
echo.
echo 서버를 시작합니다...
echo 브라우저에서 http://localhost:3000 으로 접속하세요.
echo (종료하려면 Ctrl+C 를 누르세요)
echo.

npm run dev
pause
