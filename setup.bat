@echo off
echo Instalando dependencias...
call npm install

echo.
echo Verificando instalacion...
if %errorlevel% neq 0 (
    echo Error en la instalacion. Intentando limpiar cache...
    call npm cache clean --force
    call npm install
)

echo.
echo Iniciando servidor de desarrollo...
call npm run dev