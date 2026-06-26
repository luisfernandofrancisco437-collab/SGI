@echo off
setlocal
set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "SCRIPT=%~dp0CRM_BACKUP_LOCAL_server.js"
if not exist "%NODE_EXE%" (
  echo Node.js nao encontrado em:
  echo %NODE_EXE%
  echo.
  echo Instale o Node.js LTS ou ajuste o caminho do NODE_EXE neste arquivo.
  pause
  exit /b 1
)
if not exist "C:\CRM_BACKUPS" mkdir "C:\CRM_BACKUPS"
echo Iniciando backup automatico local do CRM...
echo Os arquivos serao salvos em C:\CRM_BACKUPS
"%NODE_EXE%" "%SCRIPT%"
pause
