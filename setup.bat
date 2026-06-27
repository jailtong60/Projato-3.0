@echo off
REM Script para instalar dependências e rodar o servidor Projatto

echo.
echo ========================================
echo   Instalando dependências do projeto
echo ========================================
echo.

npm install

echo.
echo ========================================
echo   Dependências instaladas com sucesso!
echo ========================================
echo.
echo Iniciando servidor na porta 3000...
echo Acesse: http://localhost:5500
echo.

node server.js
