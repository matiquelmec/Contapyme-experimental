@echo off
echo ================================================
echo   CONTAPYME - SOLUCION DEFINITIVA CHUNKS ERROR
echo ================================================
echo.

echo 🛑 PASO 1: Deteniendo todos los procesos Node...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo 🧹 PASO 2: Limpieza RADICAL...

REM Eliminar .next completamente
if exist ".next" (
    echo   ❌ Eliminando .next...
    rd /s /q ".next" 2>nul
    timeout /t 1 >nul
)

REM Eliminar cache de node_modules
if exist "node_modules\.cache" (
    echo   ❌ Eliminando node_modules cache...
    rd /s /q "node_modules\.cache" 2>nul
)

REM Eliminar todos los archivos de cache posibles
if exist "tsconfig.tsbuildinfo" del "tsconfig.tsbuildinfo" 2>nul
if exist ".eslintcache" del ".eslintcache" 2>nul

REM Limpiar cache npm agresivamente
echo   🧽 Limpiando cache npm...
npm cache clean --force 2>nul

echo.
echo 🔧 PASO 3: Configuración de emergencia...

REM Respaldar configuración actual
if exist "next.config.js" copy "next.config.js" "next.config.BACKUP.js" >nul

REM Usar configuración de emergencia
copy "next.config.EMERGENCY.js" "next.config.js" >nul

echo   ✅ Configuración de emergencia activada

echo.
echo 🚀 PASO 4: Instalación limpia y inicio...

REM Variables de entorno para estabilidad
set NODE_OPTIONS=--max-old-space-size=4096
set NEXT_TELEMETRY_DISABLED=1
set NODE_ENV=development

echo   📦 Verificando dependencias...
npm install --silent

echo.
echo   🔥 Iniciando servidor con configuración mínima...
echo   URL: http://localhost:3000
echo   Si funciona, presiona Ctrl+C para detener
echo.

npm run dev

echo.
echo 🔄 PASO 5: Restauración (opcional)...
echo ¿Quieres restaurar la configuración original? (S/N)
choice /c SN /n
if %errorlevel%==1 (
    if exist "next.config.BACKUP.js" copy "next.config.BACKUP.js" "next.config.js" >nul
    echo ✅ Configuración original restaurada
)

echo.
echo 👋 Proceso completado
pause