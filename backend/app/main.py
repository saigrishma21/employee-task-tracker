import os
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from .database import Base, engine, get_db
from . import models, schemas

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Employee Task Tracker API", version="1.0.0", description="API for employee and task management")
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(CORSMiddleware, allow_origins=[x.strip() for x in origins], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/", tags=["Health"])
def root():
    return {"message": "Employee Task Tracker API is running", "docs": "/docs"}

@app.get("/api/employees", response_model=list[schemas.EmployeeOut], tags=["Employees"])
def list_employees(search: str | None = Query(default=None), db: Session = Depends(get_db)):
    query = db.query(models.Employee)
    if search:
        query = query.filter(models.Employee.name.ilike(f"%{search}%"))
    return query.order_by(models.Employee.name.asc()).all()

@app.post("/api/employees", response_model=schemas.EmployeeOut, status_code=201, tags=["Employees"])
def create_employee(payload: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    employee = models.Employee(**payload.model_dump())
    db.add(employee)
    try:
        db.commit()
        db.refresh(employee)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="An employee with this email already exists")
    return employee

@app.delete("/api/employees/{employee_id}", status_code=204, tags=["Employees"])
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.get(models.Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(employee)
    db.commit()

@app.get("/api/tasks", response_model=list[schemas.TaskOut], tags=["Tasks"])
def list_tasks(status: str | None = Query(default=None), employee_id: int | None = Query(default=None), db: Session = Depends(get_db)):
    query = db.query(models.Task).options(joinedload(models.Task.employee))
    if status:
        if status not in {"Pending", "In Progress", "Completed"}:
            raise HTTPException(status_code=400, detail="Invalid task status")
        query = query.filter(models.Task.status == status)
    if employee_id:
        query = query.filter(models.Task.employee_id == employee_id)
    tasks = query.order_by(models.Task.due_date.asc(), models.Task.id.desc()).all()
    return [schemas.TaskOut(id=t.id, title=t.title, description=t.description, priority=t.priority, due_date=t.due_date, status=t.status, employee_id=t.employee_id, employee_name=t.employee.name) for t in tasks]

@app.post("/api/tasks", response_model=schemas.TaskOut, status_code=201, tags=["Tasks"])
def create_task(payload: schemas.TaskCreate, db: Session = Depends(get_db)):
    if not db.get(models.Employee, payload.employee_id):
        raise HTTPException(status_code=404, detail="Assigned employee not found")
    task = models.Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return schemas.TaskOut(id=task.id, title=task.title, description=task.description, priority=task.priority, due_date=task.due_date, status=task.status, employee_id=task.employee_id, employee_name=task.employee.name)

@app.patch("/api/tasks/{task_id}/status", response_model=schemas.TaskOut, tags=["Tasks"])
def update_task_status(task_id: int, payload: schemas.TaskStatusUpdate, db: Session = Depends(get_db)):
    task = db.query(models.Task).options(joinedload(models.Task.employee)).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = payload.status
    db.commit()
    db.refresh(task)
    return schemas.TaskOut(id=task.id, title=task.title, description=task.description, priority=task.priority, due_date=task.due_date, status=task.status, employee_id=task.employee_id, employee_name=task.employee.name)

@app.get("/api/dashboard", response_model=schemas.DashboardOut, tags=["Dashboard"])
def dashboard(db: Session = Depends(get_db)):
    return schemas.DashboardOut(
        total_employees=db.query(func.count(models.Employee.id)).scalar() or 0,
        total_tasks=db.query(func.count(models.Task.id)).scalar() or 0,
        completed_tasks=db.query(func.count(models.Task.id)).filter(models.Task.status == "Completed").scalar() or 0,
        pending_tasks=db.query(func.count(models.Task.id)).filter(models.Task.status == "Pending").scalar() or 0,
    )
