@echo off
echo ====================================
echo     CONTAPYME - SERVIDOR DESARROLLO
echo ====================================
echo.

echo 🧹 PASO 1: Limpiando cache completamente...
if exist ".next" (
    echo   - Eliminando .next...
    rd /s /q ".next" 2>nul
)
if exist "node_modules\.cache" (
    echo   - Eliminando cache de node_modules...
    rd /s /q "node_modules\.cache" 2>nul
)
if exist "tsconfig.tsbuildinfo" (
    echo   - Eliminando tsconfig cache...
    del "tsconfig.tsbuildinfo" 2>nul
)

echo   - Limpiando cache npm...
npm cache clean --force 2>nul

echo.
echo ✅ Cache limpiado completamente

echo.
echo 🚀 PASO 2: Iniciando servidor de desarrollo...
echo   URL: http://localhost:3000 (o puerto disponible)
echo   Presiona Ctrl+C para detener
echo.

REM Configurar variables de entorno para evitar problemas
set NODE_OPTIONS=--max-old-space-size=4096
set NEXT_TELEMETRY_DISABLED=1

REM Iniciar servidor
npm run dev

echo.
echo 👋 Servidor detenido
pause