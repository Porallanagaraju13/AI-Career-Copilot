"""Resume Analysis API Routes"""
import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.db.models import Resume
from app.agents.pipeline import run_full_analysis

router = APIRouter(prefix="/resume", tags=["Resume"])


async def extract_text_from_file(file: UploadFile) -> str:
    """Extract text from uploaded PDF or DOCX"""
    content = await file.read()
    filename = file.filename or ""

    if filename.lower().endswith(".pdf"):
        import PyPDF2
        import io
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    elif filename.lower().endswith(".docx"):
        import docx
        import io
        doc = docx.Document(io.BytesIO(content))
        text = "\n".join(p.text for p in doc.paragraphs)
    else:
        raise HTTPException(400, "Only PDF and DOCX files are supported")

    if len(text.strip()) < 20:
        raise HTTPException(400, "Could not extract text. Ensure the file is not image-based.")

    return text


@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload and analyze a resume"""
    text = await extract_text_from_file(file)
    analysis = run_full_analysis(text)

    # Save to DB
    resume = Resume(
        user_id=current_user["id"],
        filename=file.filename or "resume",
        file_size=file.size or 0,
        raw_text=text,
        parsed_data=analysis["profile"],
        skills_detected=analysis["skills"],
        experience_years=analysis["experience_years"],
        education=analysis["education"],
        sections_found=analysis["sections"],
        ats_score=analysis["ats"]["score"],
        ats_breakdown=analysis["ats"]["breakdown"],
        ats_suggestions=analysis["ats"]["suggestions"],
        missing_keywords=analysis["ats"]["missing_keywords"],
        detected_roles=analysis["roles"],
        is_primary=True,
    )
    db.add(resume)
    await db.flush()
    await db.refresh(resume)

    return {
        "resume_id": str(resume.id),
        **analysis
    }


@router.post("/analyze-guest")
async def analyze_resume_guest(file: UploadFile = File(...)):
    """Analyze resume without auth (limited)"""
    text = await extract_text_from_file(file)
    analysis = run_full_analysis(text)
    return analysis


@router.get("/history")
async def get_resume_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all resumes for current user"""
    result = await db.execute(
        select(Resume).where(Resume.user_id == current_user["id"]).order_by(Resume.created_at.desc())
    )
    resumes = result.scalars().all()
    return [{
        "id": str(r.id), "filename": r.filename, "ats_score": r.ats_score,
        "skills_count": len(r.skills_detected or []),
        "roles": r.detected_roles, "created_at": r.created_at.isoformat(),
    } for r in resumes]


@router.get("/{resume_id}")
async def get_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific resume analysis"""
    result = await db.execute(select(Resume).where(Resume.id == resume_id, Resume.user_id == current_user["id"]))
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(404, "Resume not found")

    return {
        "id": str(resume.id), "filename": resume.filename,
        "profile": resume.parsed_data, "skills": resume.skills_detected,
        "experience_years": resume.experience_years, "education": resume.education,
        "ats": {"score": resume.ats_score, "breakdown": resume.ats_breakdown,
                "suggestions": resume.ats_suggestions, "missing_keywords": resume.missing_keywords},
        "roles": resume.detected_roles, "created_at": resume.created_at.isoformat(),
    }
