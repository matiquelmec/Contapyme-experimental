@echo off
echo 🧹 Limpiando cache de desarrollo...

REM Eliminar .next
if exist ".next" (
    echo Eliminando .next...
    rd /s /q ".next"
)

REM Eliminar cache de node_modules
if exist "node_modules\.cache" (
    echo Eliminando cache de node_modules...
    rd /s /q "node_modules\.cache"
)

REM Limpiar cache de npm
echo Limpiando cache de npm...
npm cache clean --force

REM Eliminar tsconfig.tsbuildinfo
if exist "tsconfig.tsbuildinfo" (
    del "tsconfig.tsbuildinfo"
)

REM Eliminar cache de Next.js en temp
if exist "%TEMP%\.next" (
    rd /s /q "%TEMP%\.next"
)

echo ✅ Cache limpiado completamente
echo 🚀 Iniciando servidor de desarrollo...

REM Iniciar con puerto específico y sin cache
set NODE_OPTIONS=--max-old-space-size=4096
npm run dev