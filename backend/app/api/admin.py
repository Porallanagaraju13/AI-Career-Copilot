from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.models import User, Resume, Job, Application, UserRole
from app.core.security import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])

from pydantic import BaseModel
from fastapi import Header

class AdminLogin(BaseModel):
    username: str
    password: str

async def verify_admin_token(authorization: str = Header(None)):
    if not authorization or authorization != "Bearer admin-secure-token-xyz789":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin token")
    return True

@router.post("/login")
async def admin_login(credentials: AdminLogin):
    if credentials.username == "Nagaraju13" and credentials.password == "Poralla@13":
        return {"token": "admin-secure-token-xyz789"}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

@router.get("/stats")
async def get_stats(is_admin: bool = Depends(verify_admin_token), db: AsyncSession = Depends(get_db)):
    # Aggregate counts
    users_count = await db.scalar(select(func.count()).select_from(User))
    resumes_count = await db.scalar(select(func.count()).select_from(Resume))
    jobs_count = await db.scalar(select(func.count()).select_from(Job))
    applications_count = await db.scalar(select(func.count()).select_from(Application))

    # Get latest signups (User Logins)
    recent_users_result = await db.execute(select(User).order_by(User.created_at.desc()).limit(15))
    recent_users = recent_users_result.scalars().all()

    # Get recent resumes (Real-time analysis)
    recent_resumes_result = await db.execute(
        select(Resume, User.email)
        .join(User, Resume.user_id == User.id)
        .order_by(Resume.created_at.desc())
        .limit(10)
    )
    
    recent_resumes = []
    for resume, user_email in recent_resumes_result.all():
        recent_resumes.append({
            "id": str(resume.id),
            "filename": resume.filename,
            "user_email": user_email,
            "ats_score": resume.ats_score,
            "created_at": resume.created_at.isoformat() if resume.created_at else None
        })

    return {
        "counts": {
            "users": users_count or 0,
            "resumes": resumes_count or 0,
            "jobs": jobs_count or 0,
            "applications": applications_count or 0
        },
        "recent_users": [
            {
                "id": str(u.id),
                "email": u.email,
                "full_name": u.full_name,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "last_active": u.updated_at.isoformat() if u.updated_at else None,
                "plan": u.plan
            } for u in recent_users
        ],
        "recent_resumes": recent_resumes
    }
