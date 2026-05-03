@echo off
setlocal
chcp 65001 >nul

set "ROOT=%~dp0"
cd /d "%ROOT%"

echo ==========================================
echo Dahla Local Environment Setup
echo Root: %ROOT%
echo ==========================================
echo.

where dotnet >nul 2>nul
if errorlevel 1 (
    echo [ERROR] dotnet SDK was not found.
    echo Install .NET 8 SDK on this machine first.
    echo Suggested command if internet is available:
    echo   winget install Microsoft.DotNet.SDK.8
    goto :error
)
echo [OK] dotnet found.

where node >nul 2>nul
if errorlevel 1 (
    echo [WARN] Node.js was not found.
    echo Attempting to install Node.js LTS with winget...
    where winget >nul 2>nul
    if errorlevel 1 (
        echo [ERROR] winget is not available.
        echo Install Node.js LTS manually, then rerun this script.
        goto :error
    )
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    if errorlevel 1 (
        echo [ERROR] Node.js installation failed.
        echo Install Node.js LTS manually, reopen terminal, then rerun this script.
        goto :error
    )
) else (
    echo [OK] node found.
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm.cmd was not found.
    echo Reopen the terminal and rerun this script after Node.js installation.
    goto :error
)
echo [OK] npm found.

where sqllocaldb >nul 2>nul
if errorlevel 1 (
    echo [ERROR] SQL LocalDB was not found.
    echo Install SQL Server Express LocalDB or Visual Studio data tools, then rerun.
    goto :error
)
echo [OK] SQL LocalDB found.

echo.
echo [1/5] Trusting local HTTPS dev certificate...
dotnet dev-certs https --trust
if errorlevel 1 (
    echo [WARN] Could not trust HTTPS dev certificate automatically.
    echo You may need to trust it manually.
) else (
    echo [OK] HTTPS dev certificate is ready.
)

echo.
echo [2/5] Starting LocalDB instance...
sqllocaldb start MSSQLLocalDB >nul 2>nul
echo [OK] LocalDB instance checked.

echo.
echo [3/5] Installing Newman dependencies...
pushd "%ROOT%ci"
call npm.cmd install --no-audit
if errorlevel 1 (
    popd
    echo [ERROR] npm install failed.
    goto :error
)
popd
echo [OK] Newman dependencies installed.

echo.
echo [4/5] Creating local smoke database...
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%ci\setup-localdb.ps1"
if errorlevel 1 (
    echo [ERROR] LocalDB smoke schema setup failed.
    goto :error
)
echo [OK] Local smoke database is ready.

echo.
echo [5/5] Environment summary...
for /f %%i in ('dotnet --version') do set "DOTNET_VER=%%i"
for /f %%i in ('node -v') do set "NODE_VER=%%i"
for /f %%i in ('npm.cmd -v') do set "NPM_VER=%%i"
echo   dotnet: %DOTNET_VER%
echo   node  : %NODE_VER%
echo   npm   : %NPM_VER%
echo   LocalDB instance: MSSQLLocalDB
echo.
echo Setup completed.
echo Next steps:
echo   1. Run .\run-local-smoke.bat
echo   2. Or start frontend with: cd frontend ^&^& python -m http.server 8080
exit /b 0

:error
echo.
echo Setup failed.
exit /b 1
