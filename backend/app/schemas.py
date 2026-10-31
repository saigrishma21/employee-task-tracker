from datetime import date
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class EmployeeCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    department: str = Field(min_length=2, max_length=100)

class EmployeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    department: str

class TaskCreate(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    description: str = ""
    priority: Literal["Low", "Medium", "High"] = "Medium"
    due_date: date
    employee_id: int

class TaskStatusUpdate(BaseModel):
    status: Literal["Pending", "In Progress", "Completed"]

class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    priority: str
    due_date: date
    status: str
    employee_id: int
    employee_name: str

class DashboardOut(BaseModel):
    total_employees: int
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
