@echo off
echo =========================================
echo Starting Bystander Privacy App Stack...
echo =========================================

:: 1. Start Ollama (Llama 3) in a new window
echo [1/4] Starting local AI model (Ollama)...
start "Ollama AI - Llama 3" cmd /c "echo Starting Ollama... && ollama run llama3"

:: Wait 3 seconds for Ollama to spin up
timeout /t 3 /nobreak > nul

:: 2. Start the Node.js Server in a new window
echo [2/4] Starting Node.js Hub Server...
start "Bystander Backend Server" cmd /k "cd server && npm run start"

:: Wait 2 seconds for server to bind to ports
timeout /t 2 /nobreak > nul

:: 3. Start the React Client in a new window
echo [3/4] Starting React Frontend...
start "Bystander React Client" cmd /k "npx vite --port=4000"

:: 4. Start the IoT Device Simulator in a new window
echo [4/4] Starting Device Simulator...
start "IoT Device Simulator" cmd /k "cd server && echo Welcome to the Simulator! Please enter the pairing code from the app: && node simulator.js"

echo.
echo =========================================
echo All services launched in separate windows!
echo =========================================
pause
