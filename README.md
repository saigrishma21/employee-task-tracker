# Employee Task Tracker

A full-stack employee and task management application built with React, FastAPI, SQLAlchemy and PostgreSQL. It implements the requirements in the supplied practical assignment.

## Features
- Dashboard: employee count, task count, completed count, pending count and completion progress.
- Employees: create, list, search and delete employees. Email addresses are unique.
- Tasks: create tasks with title, description, priority and due date; assign each task to an employee; list tasks with employee names; filter by status; update status.
- Persistent PostgreSQL storage, API validation, useful HTTP errors and Swagger documentation.

## Requirements
- Python 3.10+
- Node.js 18+
- Docker Desktop (recommended for PostgreSQL), or an existing PostgreSQL 14+ database.

## Run locally

### 1. Start PostgreSQL
From the project root:

```bash
docker compose up -d db
```

This creates database `task_tracker` on `localhost:5432` with user/password `postgres`/`postgres` for local development.

### 2. Start the FastAPI backend
Open a terminal:

```bash
cd backend
python -m venv venv
# Windows PowerShell: .\venv\Scripts\Activate.ps1
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env  # Windows; on macOS/Linux use: cp .env.example .env
uvicorn app.main:app --reload
```

API: http://localhost:8000  
Swagger UI: http://localhost:8000/docs

If your PostgreSQL credentials differ, edit `DATABASE_URL` in `backend/.env`.

### 3. Start the React frontend
In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173).

If the API is hosted somewhere else, create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:8000/api
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dashboard` | Dashboard counts |
| GET | `/api/employees` | List employees; optional `?search=name` |
| POST | `/api/employees` | Create employee |
| DELETE | `/api/employees/{id}` | Delete employee and their assigned tasks |
| GET | `/api/tasks` | List tasks; optional `?status=Pending` or `?employee_id=1` |
| POST | `/api/tasks` | Create and assign a task |
| PATCH | `/api/tasks/{id}/status` | Update task status |

## Database design
- `employees`: `id` primary key, `name`, unique `email`, `department`, `created_at`.
- `tasks`: `id` primary key, `title`, `description`, `priority`, `due_date`, `status`, `employee_id` foreign key, `created_at`.
- Relationship: one employee can own many tasks. Deleting an employee deletes their tasks (also reflected in the ORM relationship).

Tables are created automatically on backend startup. For a production deployment, use Alembic migrations rather than `create_all`.

## Demo walkthrough
1. Open Dashboard and show the summary cards.
2. Go to Employees → Add employee; create two employees in different departments.
3. Go to Tasks → Create task; create tasks with different priorities and assign them to those employees.
4. Show assigned employee names and due dates in the task table.
5. Change a task from Pending → In Progress → Completed.
6. Return to Dashboard and show that the totals and completed/pending counts update from PostgreSQL records.
7. Open `/docs` and demonstrate the endpoints and request/response schemas.

## Notes
- This is a local practical-assignment implementation, not a production-hardened deployment. Add authentication/authorization, migrations, audit logging, pagination and stronger operational security before production use.
- Employee deletion intentionally removes that employee's tasks to preserve referential integrity; the UI confirms this before deletion.
