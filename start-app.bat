@echo off
echo Starting Backend Server...
cd server
start "Backend Server" cmd /c "npx ts-node src/index.ts"
cd ..
echo Starting Frontend...
start "Frontend" cmd /c "npm run dev"
echo Application started!
