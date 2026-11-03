Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting LoopStream CRM Backend (Spring Boot on Port 8080)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

Set-Location -Path "$PSScriptRoot\backend"
.\mvnw.cmd spring-boot:run
