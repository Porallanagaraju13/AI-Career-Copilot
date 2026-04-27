from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.models import User, Resume, Job, Application, UserRole
from app.core.security import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])

async def get_admin_user(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == current_user["id"]))
    user = result.scalars().first()
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user

@router.get("/stats")
async def get_stats(admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    # Aggregate counts
    users_count = await db.scalar(select(func.count()).select_from(User))
    resumes_count = await db.scalar(select(func.count()).select_from(Resume))
    jobs_count = await db.scalar(select(func.count()).select_from(Job))
    applications_count = await db.scalar(select(func.count()).select_from(Application))

    # Get latest signups
    recent_users_result = await db.execute(select(User).order_by(User.created_at.desc()).limit(5))
    recent_users = recent_users_result.scalars().all()

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
                "plan": u.plan
            } for u in recent_users
        ]
    }
