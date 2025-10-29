# Webserver (Flask) for University Room Booking System

## Description
This is the backend server for the University Room Booking System.  
It is built with **Python Flask** and serves API endpoints that the React frontend can communicate with.

---

## Setup

1. **Create virtual environment:**

Enter the webserver folder in the terminal

Ect: *C:\Users\user\DES424_University_Booking_System\webserver>*

Create the virtual environment:
`python -m venv venv`

2. **Activate virtual environment:**

- Windows CMD: `venv\Scripts\activate.bat`
- PowerShell: `.\venv\Scripts\Activate.ps1`
- macOS/Linux: `source venv/bin/activate`

3. **Install dependencies:**

*(Optional) update pip library:* 
`python -m pip install --upgrade pip`

The *requirements.txt* file is already prepared, so simply run:

`pip install -r requirements.txt`

4. **Run the server:**

`python webserver.py`