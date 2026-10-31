# Employee Task Tracker

A full-stack web application built to manage employees, assign tasks, track task progress, and monitor overall productivity through a centralized dashboard.

The application provides employee management, task assignment, status tracking, and dashboard statistics using a React frontend, FastAPI backend, and PostgreSQL database.

## Features

### Employee Management
- Add employees with name, email, and department.
- View the list of registered employees.
- Delete employee records.
- Search employees by name.

### Task Management
- Create tasks with title, description, priority, and due date.
- Assign tasks to employees.
- View tasks along with their assigned employee details.
- Update task status:
  - Pending
  - In Progress
  - Completed
- Filter and track tasks based on their status.

### Dashboard
- View the total number of employees.
- Monitor the total number of tasks.
- Track completed tasks.
- Monitor pending tasks.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML, CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| API Documentation | Swagger UI |
| API Communication | REST APIs |
| Development Tools | VS Code, Git, GitHub, Docker |

## Project Architecture

```text
employee-task-tracker/
│
├── backend/
│   ├── app/
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Application Workflow

1. The user opens the React application.
2. The frontend sends HTTP requests to the FastAPI backend.
3. FastAPI processes the requests and communicates with PostgreSQL.
4. Employee and task information is stored and retrieved from the database.
5. The frontend displays updated employee records, task details, and dashboard statistics.

## Installation and Setup

### Prerequisites

Make sure the following tools are installed:

- Python 3.12+
- Node.js and npm
- Docker Desktop
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/employee-task-tracker.git
cd employee-task-tracker
```

### 2. Start PostgreSQL Using Docker

```bash
docker compose up -d
```

### 3. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory and configure your database connection:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@127.0.0.1:5433/task_tracker
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

### 4. Access Swagger API Documentation

Open the following URL in your browser:

```text
http://127.0.0.1:8000/docs
```

Swagger UI allows you to explore and test the backend API endpoints.

### 5. Configure the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## API Functionality

The backend provides REST API endpoints for managing employees, tasks, and dashboard information.

| Method | Endpoint | Functionality |
|---|---|---|
| GET | `/api/employees` | Retrieve employees |
| POST | `/api/employees` | Add a new employee |
| DELETE | `/api/employees/{id}` | Delete an employee |
| GET | `/api/tasks` | Retrieve tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/{id}/status` | Update task status |
| GET | `/api/dashboard` | Retrieve dashboard statistics |

*Refer to Swagger UI for the exact request parameters and response formats.*

## Key Learning Outcomes

Through this project, I gained practical experience in:

- Building RESTful APIs using FastAPI.
- Developing frontend interfaces using React.
- Connecting a Python backend with a PostgreSQL database.
- Performing CRUD operations.
- Implementing employee and task management workflows.
- Integrating frontend and backend using HTTP requests.
- Testing API endpoints using Swagger UI.
- Managing project dependencies and environment variables.
- Using Docker for database setup.
- Managing source code using Git and GitHub.

## Future Enhancements

- User authentication and role-based access control.
- Employee-specific task dashboards.
- Task deadline notifications.
- Task priority-based filtering.
- Improved dashboard analytics.
- Cloud deployment.

## Sai Grishma

**Computer Science & Engineering Graduate**



---

If you find this project useful, feel free to ⭐ the repository.
