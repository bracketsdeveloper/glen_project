# Mini Scheduling System

A small scheduling application where employees can be assigned to different jobs based on their role, availability, and time slot compatibility. 

This project is built using:
- **Backend:** Flask (Python)
- **Frontend:** React (Vite)
- **Data Storage:** Local JSON files (`employees.json`, `jobs.json`, `schedule.json`)

## Requirements
- Python 3.x
- Node.js (v18+ recommended)
- npm or yarn

## Setup & Running the Application

### 1. Backend (Flask)
The backend manages data strictly and enforces the logical constraints using flat JSON files found under `backend/data/`.

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. (Optional but recommended) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   python app.py
   ```
   *The Flask backend will typically run on `http://127.0.0.1:5000`.*

### 2. Frontend (React)
The frontend is a fast, responsive interface powered by React and Vite. It utilizes vanilla CSS to deliver a sleek UI.

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the necessary NPM dependencies:
   ```bash
   npm install
   ```
3. Start the development client:
   ```bash
   npm run dev
   ```
   *Vite will start the client, usually on `http://localhost:5173`. Open the provided URL to view the system.*

## Features & Implementation Checks
- **Employee Selection:** A beautiful list dropdown filtering active employees, combining Search by Name, Role filter (TCP, LCT, Supervisor), and Availability filter. 
- **Time Windows Visibility:** Times are clearly formatted and visible in the job selector.
- **Constraints Logic Check (Backend):**
  - **Rule 1 (No Double Booking):** Ensures an employee is not concurrently assigned to identical jobs.
  - **Rule 2 (No Overlapping Time Slots):** Validates and rejects incoming assignments if the start/end bounds overlap with an existing schedule for that particular employee. 
  - **Rule 3 (Availability Filtering):** Checks boolean `availability` properties to guarantee unavailability restricts job assignment natively at the API level.
- **Dynamic Feedback:** Graceful error messages mapping to overlap violations or availability bugs, coupled with optimistic rendering. 
- **Schedule Persistence:** Deleting and adding updates directly parse into the local JSON files to save state between runs.

## Important Notes & Decisions
- **Time Overlap:** We compute HH:MM representations string values directly translated into Python time structures to do cross-interval `<`/`>` matching cleanly. No arbitrary date extensions are assumed. 
- **System Indexing:** As there is no RDBMS auto-increment sequences, assigning jobs automatically produces epoch ms based unique IDs. 
- **Data Mutability:** To restore the exact app conditions, you can empty the backend's `schedule.json` back to standard brackets `[]`. No data seeders are needed!
