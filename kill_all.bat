@echo off
echo =========================================
echo Shutting down Bystander Privacy App Stack...
echo =========================================

echo Closing Ollama AI window...
taskkill /FI "WINDOWTITLE eq Ollama AI - Llama 3*" /T /F > nul 2>&1

echo Closing Backend Server window...
taskkill /FI "WINDOWTITLE eq Bystander Backend Server*" /T /F > nul 2>&1

echo Closing React Frontend window...
taskkill /FI "WINDOWTITLE eq Bystander React Client*" /T /F > nul 2>&1

echo Closing Device Simulator window...
taskkill /FI "WINDOWTITLE eq IoT Device Simulator*" /T /F > nul 2>&1

echo.
echo =========================================
echo All Bystander windows and services have been closed!
echo =========================================

echo (If you still have ghost Node processes running, you can press any key to force kill ALL node.exe processes, or close this window now to skip).
pause

echo Force killing all Node processes...
taskkill /F /IM node.exe /T
echo Done.
pause
