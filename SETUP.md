# Development Setup Guide

This guide explains how to set up the **Nirixense SHM Platform** exactly as it is configured in this repository. The setup uses a hybrid approach: **Infrastructure (Database/Redis)** runs in Docker, while the **Apps (Backend/Frontend)** run natively on Windows for the best developer experience.

## Prerequisites

Ensure you have the following installed on your Windows machine:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Python 3.11+](https://www.python.org/downloads/)
- [Node.js 20+](https://nodejs.org/)

---

## Step 1: Clone the Repository
```bash
git clone <repository-url>
cd demo
```

## Step 2: Start Infrastructure (Docker)
The database and Redis must be running before starting the applications.
```bash
docker-compose up -d db redis
```
*Note: This will start PostgreSQL on port `5432` and Redis on port `6379`.*

## Step 3: Backend Setup
1. Open a terminal in the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   ```bash
   .\venv\Scripts\activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Return to the root directory:
   ```bash
   cd ..
   ```

## Step 4: Frontend Setup
1. Open a terminal in the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Return to the root directory:
   ```bash
   cd ..
   ```

## Step 5: Launch the Platform
Once the steps above are completed, you can use the provided automation scripts:

- **To START everything:** Build and run the Backend, Frontend, and Simulator in separate windows:
  ```cmd
  start_platform.bat
  ```
- **To STOP everything:** Kill the native processes and stop Docker containers:
  ```cmd
  stop_platform.bat
  ```

---

## Accessing the Platform
- **React Dashboard:** [http://localhost:5173](http://localhost:5173)
- **FastAPI Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Database:** `localhost:5432` (User: `nirixense`, Password: `nirixense_password`)

## Troubleshooting
- **Port Conflicts:** Ensure ports `5432`, `6379`, `8000`, and `5173` are not being used by other applications.
- **Docker Issues:** Make sure Docker Desktop is running before launching `start_platform.bat`.
- **Venv Issues:** The `.bat` script expects the virtual environment to be at `backend\venv`.
