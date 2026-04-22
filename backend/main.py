from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

from database import get_db, init_db, User, Project, TeamMember, Task, Assignment
from auth import hash_password, verify_password, create_access_token, get_current_user
from matcher import match_tasks_to_members
from claude_service import generate_reasoning, generate_team_summary

load_dotenv()

app = FastAPI(title="HireRight API v2", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


# ─── Schemas ─────────────────────────────────────────────────────────────────

class RegisterSchema(BaseModel):
    username: str
    email: str
    password: str

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class MemberCreate(BaseModel):
    name: str
    skills: str
    weekly_hours_available: float = 40.0

class TaskCreate(BaseModel):
    title: str
    description: str
    required_skills: str
    estimated_hours: float
    deadline: Optional[str] = None
    priority: str = "medium"


# ─── Auth ─────────────────────────────────────────────────────────────────────

@app.post("/auth/register", status_code=201)
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken.")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "username": user.username}


@app.post("/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password.")

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "username": user.username}


@app.get("/auth/me")
def me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "username": current_user.username, "email": current_user.email}


# ─── Projects ─────────────────────────────────────────────────────────────────

@app.post("/projects", status_code=201)
def create_project(data: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = Project(name=data.name, description=data.description, owner_id=current_user.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@app.get("/projects")
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    projects = db.query(Project).filter(Project.owner_id == current_user.id).all()
    result = []
    for p in projects:
        result.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "created_at": p.created_at,
            "member_count": len(p.members),
            "task_count": len(p.tasks),
            "assigned_count": len([t for t in p.tasks if t.status == "assigned"])
        })
    return result

@app.get("/projects/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted."}


# ─── Members (scoped to project) ──────────────────────────────────────────────

def _check_project(project_id: int, user_id: int, db: Session):
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == user_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project

@app.post("/projects/{project_id}/members", status_code=201)
def add_member(project_id: int, data: MemberCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _check_project(project_id, current_user.id, db)
    member = TeamMember(**data.dict(), project_id=project_id)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

@app.get("/projects/{project_id}/members")
def list_members(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _check_project(project_id, current_user.id, db)
    return db.query(TeamMember).filter(TeamMember.project_id == project_id).all()

@app.delete("/projects/{project_id}/members/{member_id}")
def delete_member(project_id: int, member_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _check_project(project_id, current_user.id, db)
    member = db.query(TeamMember).filter(TeamMember.id == member_id, TeamMember.project_id == project_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")
    db.delete(member)
    db.commit()
    return {"message": "Deleted"}


# ─── Tasks (scoped to project) ────────────────────────────────────────────────

@app.post("/projects/{project_id}/tasks", status_code=201)
def add_task(project_id: int, data: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _check_project(project_id, current_user.id, db)
    task = Task(**data.dict(), project_id=project_id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@app.get("/projects/{project_id}/tasks")
def list_tasks(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _check_project(project_id, current_user.id, db)
    return db.query(Task).filter(Task.project_id == project_id).all()

@app.delete("/projects/{project_id}/tasks/{task_id}")
def delete_task(project_id: int, task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _check_project(project_id, current_user.id, db)
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    db.delete(task)
    db.commit()
    return {"message": "Deleted"}


# ─── Auto-Assign (scoped to project) ──────────────────────────────────────────

@app.post("/projects/{project_id}/assign")
def auto_assign(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _check_project(project_id, current_user.id, db)

    members = db.query(TeamMember).filter(TeamMember.project_id == project_id).all()
    tasks = db.query(Task).filter(Task.project_id == project_id, Task.status == "unassigned").all()

    if not members:
        raise HTTPException(status_code=400, detail="No team members found. Add members first.")
    if not tasks:
        raise HTTPException(status_code=400, detail="No unassigned tasks found.")

    member_dicts = [{"id": m.id, "name": m.name, "skills": m.skills, "weekly_hours_available": m.weekly_hours_available, "current_workload_hours": m.current_workload_hours} for m in members]
    task_dicts = [{"id": t.id, "title": t.title, "description": t.description, "required_skills": t.required_skills, "estimated_hours": t.estimated_hours, "priority": t.priority} for t in tasks]

    matches = match_tasks_to_members(task_dicts, member_dicts)

    db.query(Assignment).filter(Assignment.project_id == project_id).delete()

    saved = []
    for match in matches:
        reasoning = ""
        if match["member_id"]:
            task_obj = next(t for t in task_dicts if t["id"] == match["task_id"])
            member_obj = next(m for m in member_dicts if m["id"] == match["member_id"])
            reasoning = generate_reasoning(task_obj, member_obj, match["confidence_score"])

            db_member = db.query(TeamMember).filter(TeamMember.id == match["member_id"]).first()
            if db_member:
                db_member.current_workload_hours += match["estimated_hours"]

            db_task = db.query(Task).filter(Task.id == match["task_id"]).first()
            if db_task:
                db_task.status = "assigned"

        assignment = Assignment(
            project_id=project_id,
            task_id=match["task_id"],
            member_id=match["member_id"],
            task_title=match["task_title"],
            member_name=match["member_name"],
            confidence_score=match["confidence_score"],
            ai_reasoning=reasoning
        )
        db.add(assignment)
        saved.append(match)

    db.commit()
    summary = generate_team_summary(saved, member_dicts)

    return {
        "assignments": saved,
        "summary": summary,
        "total_tasks": len(matches),
        "assigned": sum(1 for m in matches if m["member_id"]),
        "unassigned": sum(1 for m in matches if not m["member_id"])
    }

@app.get("/projects/{project_id}/assignments")
def list_assignments(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _check_project(project_id, current_user.id, db)
    return db.query(Assignment).filter(Assignment.project_id == project_id).all()

@app.get("/projects/{project_id}/workload")
def workload(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _check_project(project_id, current_user.id, db)
    members = db.query(TeamMember).filter(TeamMember.project_id == project_id).all()
    return [{"name": m.name, "used": m.current_workload_hours, "available": m.weekly_hours_available, "free": max(0, m.weekly_hours_available - m.current_workload_hours), "utilization": round((m.current_workload_hours / m.weekly_hours_available) * 100, 1) if m.weekly_hours_available > 0 else 0} for m in members]

@app.post("/projects/{project_id}/reset")
def reset_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _check_project(project_id, current_user.id, db)
    for m in db.query(TeamMember).filter(TeamMember.project_id == project_id).all():
        m.current_workload_hours = 0.0
    for t in db.query(Task).filter(Task.project_id == project_id).all():
        t.status = "unassigned"
    db.query(Assignment).filter(Assignment.project_id == project_id).delete()
    db.commit()
    return {"message": "Project assignments reset."}

@app.get("/projects/{project_id}/seed-demo")
def seed_demo(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _check_project(project_id, current_user.id, db)

    db.query(Assignment).filter(Assignment.project_id == project_id).delete()
    db.query(Task).filter(Task.project_id == project_id).delete()
    db.query(TeamMember).filter(TeamMember.project_id == project_id).delete()

    members = [
        TeamMember(project_id=project_id, name="Priya Sharma", skills="Python, FastAPI, Machine Learning, REST APIs, scikit-learn", weekly_hours_available=40),
        TeamMember(project_id=project_id, name="Arjun Mehta", skills="React, JavaScript, TailwindCSS, UI/UX Design, Figma", weekly_hours_available=35),
        TeamMember(project_id=project_id, name="Sneha Rao", skills="Data Analysis, SQL, Excel, Tableau, Data Visualization", weekly_hours_available=40),
        TeamMember(project_id=project_id, name="Rahul Verma", skills="DevOps, Docker, AWS, CI/CD, Kubernetes, Linux", weekly_hours_available=30),
        TeamMember(project_id=project_id, name="Meera Joshi", skills="Content Writing, Marketing, SEO, Social Media, Copywriting", weekly_hours_available=40),
    ]
    tasks = [
        Task(project_id=project_id, title="Build ML Model for User Churn", description="Train a classification model to predict which users will churn", required_skills="Machine Learning, Python, scikit-learn", estimated_hours=12, priority="high"),
        Task(project_id=project_id, title="Design Landing Page", description="Create a modern responsive landing page for the product launch", required_skills="React, UI/UX Design, TailwindCSS", estimated_hours=8, priority="high"),
        Task(project_id=project_id, title="Setup CI/CD Pipeline", description="Configure GitHub Actions and deploy to AWS with Docker", required_skills="DevOps, Docker, AWS, CI/CD", estimated_hours=6, priority="medium"),
        Task(project_id=project_id, title="Write Product Blog Post", description="Write a 1500-word blog post about our product features for launch", required_skills="Content Writing, SEO, Marketing", estimated_hours=4, priority="medium"),
        Task(project_id=project_id, title="Build Analytics Dashboard", description="Create SQL queries and visualize sales data in Tableau", required_skills="SQL, Data Visualization, Data Analysis", estimated_hours=10, priority="high"),
        Task(project_id=project_id, title="REST API for User Auth", description="Build secure JWT-based authentication endpoints in FastAPI", required_skills="FastAPI, Python, REST APIs", estimated_hours=8, priority="high"),
    ]
    db.add_all(members)
    db.add_all(tasks)
    db.commit()
    return {"message": "Demo data seeded!"}
