@echo off
cd /d "c:\Users\Keerthipriya\OneDrive\Desktop\TicketIQ"

rem Install front‑end dependencies
npm install

rem Set up Python virtual environment
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt

rem Start back‑end in a new terminal window
start "backend" cmd /c "python app.py"

rem Run front‑end (web) in current terminal
npm run dev
