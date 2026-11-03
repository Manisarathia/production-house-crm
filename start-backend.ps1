Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting LoopStream CRM Backend (Spring Boot on Port 8080)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

# Attempt to start MySQL if stopped
Start-Service -Name "MySQL80" -ErrorAction SilentlyContinue
Start-Service -Name "mysql" -ErrorAction SilentlyContinue

$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

Set-Location -Path "$PSScriptRoot\backend"
.\mvnw.cmd spring-boot:run
