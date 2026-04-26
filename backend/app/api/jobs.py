"""Jobs & Applications API Routes"""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_current_user
from app.db.session import get_db
from app.db.models import Application, ApplicationStatus, Job
from app.agents.pipeline import JOB_DATABASE

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("/search")
async def search_jobs(
    q: str = "",
    location: str = "",
    remote: bool | None = None,
    experience: str = "",
    page: int = 1,
    limit: int = 20,
):
    """Search jobs from database"""
    results = []
    for job in JOB_DATABASE:
        if q and q.lower() not in job["title"].lower() and q.lower() not in job["company"].lower():
            continue
        if location and location.lower() not in job["location"].lower():
            continue
        if remote is not None and job["remote"] != remote:
            continue
        results.append(job)

    start = (page - 1) * limit
    return {"jobs": results[start:start + limit], "total": len(results), "page": page}


@router.get("/{job_id}")
async def get_job(job_id: str):
    """Get single job details"""
    job = next((j for j in JOB_DATABASE if j["id"] == job_id), None)
    if not job:
        raise HTTPException(404, "Job not found")
    return job


# ===== APPLICATION TRACKING =====
app_router = APIRouter(prefix="/applications", tags=["Applications"])


class CreateApplication(BaseModel):
    job_id: str
    job_title: str
    company: str
    match_score: float = 0
    matched_skills: list = []
    notes: str = ""


class UpdateApplication(BaseModel):
    status: str | None = None
    notes: str | None = None
    interview_date: str | None = None


@app_router.post("")
async def create_application(
    req: CreateApplication,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Track a new job application"""
    # Check for existing job in DB or create one
    result = await db.execute(select(Job).where(Job.id == req.job_id))
    job = result.scalars().first()

    if not job:
        # Find from our database
        job_data = next((j for j in JOB_DATABASE if j["id"] == req.job_id), None)
        if job_data:
            job = Job(
                title=job_data["title"], company=job_data["company"],
                location=job_data["location"], remote=job_data.get("remote", False),
                salary_min=job_data.get("salary_min", 0), salary_max=job_data.get("salary_max", 0),
                salary_currency=job_data.get("currency", "USD"),
                skills_required=job_data.get("skills", []),
                apply_url=job_data.get("url", ""), source="internal",
            )
            db.add(job)
            await db.flush()
            await db.refresh(job)
        else:
            job = Job(title=req.job_title, company=req.company)
            db.add(job)
            await db.flush()
            await db.refresh(job)

    app = Application(
        user_id=current_user["id"], job_id=job.id,
        status=ApplicationStatus.APPLIED, match_score=req.match_score,
        matched_skills=req.matched_skills, notes=req.notes,
        applied_at=datetime.now(timezone.utc),
    )
    db.add(app)
    await db.flush()
    await db.refresh(app)

    return {
        "id": str(app.id), "job_id": str(app.job_id),
        "job_title": job.title, "company": job.company,
        "status": app.status.value, "match_score": app.match_score,
        "applied_at": app.applied_at.isoformat() if app.applied_at else None,
        "created_at": app.created_at.isoformat(),
    }


@app_router.get("")
async def list_applications(
    status: str | None = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all applications for current user"""
    query = select(Application).where(Application.user_id == current_user["id"])
    if status:
        query = query.where(Application.status == status)
    query = query.order_by(Application.created_at.desc())

    result = await db.execute(query)
    apps = result.scalars().all()

    items = []
    for app in apps:
        job_result = await db.execute(select(Job).where(Job.id == app.job_id))
        job = job_result.scalars().first()
        items.append({
            "id": str(app.id), "job_id": str(app.job_id),
            "job_title": job.title if job else "Unknown",
            "company": job.company if job else "Unknown",
            "location": job.location if job else "",
            "status": app.status.value, "match_score": app.match_score,
            "matched_skills": app.matched_skills, "notes": app.notes,
            "applied_at": app.applied_at.isoformat() if app.applied_at else None,
            "interview_date": app.interview_date.isoformat() if app.interview_date else None,
            "created_at": app.created_at.isoformat(),
        })
    return items


@app_router.patch("/{app_id}")
async def update_application(
    app_id: str, req: UpdateApplication,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update application status"""
    result = await db.execute(
        select(Application).where(Application.id == app_id, Application.user_id == current_user["id"])
    )
    app = result.scalars().first()
    if not app:
        raise HTTPException(404, "Application not found")

    if req.status:
        app.status = ApplicationStatus(req.status)
    if req.notes is not None:
        app.notes = req.notes
    if req.interview_date:
        app.interview_date = datetime.fromisoformat(req.interview_date)

    await db.flush()
    return {"id": str(app.id), "status": app.status.value, "updated": True}


@app_router.delete("/{app_id}")
async def delete_application(
    app_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an application"""
    result = await db.execute(
        select(Application).where(Application.id == app_id, Application.user_id == current_user["id"])
    )
    app = result.scalars().first()
    if not app:
        raise HTTPException(404, "Application not found")

    await db.delete(app)
    return {"deleted": True}


@app_router.get("/stats")
async def application_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get application statistics"""
    result = await db.execute(
        select(Application.status, func.count(Application.id))
        .where(Application.user_id == current_user["id"])
        .group_by(Application.status)
    )
    stats = {row[0].value: row[1] for row in result.all()}
    total = sum(stats.values())
    return {"total": total, **stats}
