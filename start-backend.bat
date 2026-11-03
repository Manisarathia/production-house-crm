@echo off
echo ========================================================
echo Starting LoopStream CRM Backend (Spring Boot on Port 8080)
echo ========================================================

set "JAVA_HOME=C:\Program Files\Java\jdk-23"
set "PATH=%JAVA_HOME%\bin;%PATH%"

cd /d "%~dp0backend"
call .\mvnw.cmd spring-boot:run
pause
