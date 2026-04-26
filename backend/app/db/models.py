"""Database Models — SQLAlchemy ORM"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, DateTime, ForeignKey, JSON, Enum as SAEnum, TypeDecorator, CHAR
from sqlalchemy.orm import DeclarativeBase, relationship
import enum


class GUID(TypeDecorator):
    """Platform-independent GUID type. Uses CHAR(36) for SQLite, native UUID for PostgreSQL."""
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            from sqlalchemy.dialects.postgresql import UUID as PG_UUID
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return value
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if not isinstance(value, uuid.UUID):
            return uuid.UUID(str(value))
        return value


class Base(DeclarativeBase):
    pass


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class ApplicationStatus(str, enum.Enum):
    SAVED = "saved"
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEW = "interview"
    OFFER = "offer"
    REJECTED = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), default="")
    avatar_url = Column(String(500), default="")
    role = Column(SAEnum(UserRole), default=UserRole.USER)
    is_active = Column(Boolean, default=True)

    # Profile
    phone = Column(String(20), default="")
    location = Column(String(255), default="")
    headline = Column(String(500), default="")
    bio = Column(Text, default="")
    skills = Column(JSON, default=list)
    preferred_roles = Column(JSON, default=list)
    salary_min = Column(Integer, default=0)
    salary_max = Column(Integer, default=0)
    experience_years = Column(Integer, default=0)
    open_to_remote = Column(Boolean, default=True)

    # Subscription
    plan = Column(String(50), default="free")
    stripe_customer_id = Column(String(255), default="")
    stripe_subscription_id = Column(String(255), default="")

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(500), nullable=False)
    file_url = Column(String(1000), default="")
    file_size = Column(Integer, default=0)

    # Parsed data
    raw_text = Column(Text, default="")
    parsed_data = Column(JSON, default=dict)  # name, email, phone, education, etc.
    skills_detected = Column(JSON, default=list)
    experience_years = Column(Integer, default=0)
    education = Column(JSON, default=list)
    sections_found = Column(JSON, default=list)

    # ATS Analysis
    ats_score = Column(Float, default=0)
    ats_breakdown = Column(JSON, default=dict)
    ats_suggestions = Column(JSON, default=list)
    missing_keywords = Column(JSON, default=list)

    # AI Results
    detected_roles = Column(JSON, default=list)
    rewrite_suggestions = Column(JSON, default=list)
    improved_text = Column(Text, default="")

    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="resumes")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    company = Column(String(255), nullable=False)
    company_logo = Column(String(1000), default="")
    location = Column(String(255), default="")
    job_type = Column(String(50), default="full-time")  # full-time, part-time, contract, internship
    remote = Column(Boolean, default=False)
    salary_min = Column(Integer, default=0)
    salary_max = Column(Integer, default=0)
    salary_currency = Column(String(10), default="USD")
    experience_min = Column(Integer, default=0)
    experience_max = Column(Integer, default=0)
    description = Column(Text, default="")
    requirements = Column(JSON, default=list)
    skills_required = Column(JSON, default=list)
    apply_url = Column(String(1000), default="")
    source = Column(String(100), default="internal")
    posted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)

    applications = relationship("Application", back_populates="job")


class Application(Base):
    __tablename__ = "applications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(GUID(), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(GUID(), ForeignKey("resumes.id"), nullable=True)

    status = Column(SAEnum(ApplicationStatus), default=ApplicationStatus.SAVED)
    match_score = Column(Float, default=0)
    matched_skills = Column(JSON, default=list)
    notes = Column(Text, default="")
    applied_at = Column(DateTime(timezone=True), nullable=True)
    interview_date = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_title = Column(String(500), default="")
    company = Column(String(255), default="")
    questions = Column(JSON, default=list)
    answers = Column(JSON, default=list)
    feedback = Column(JSON, default=list)
    overall_score = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
