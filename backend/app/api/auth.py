"""Authentication API Routes"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.db.session import get_db
from app.db.models import User, OTP
from datetime import datetime, timedelta, timezone
import random
import os
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter(prefix="/auth", tags=["Authentication"])


class OTPRequest(BaseModel):
    email: str


class OTPVerify(BaseModel):
    email: str
    otp_code: str


class GoogleAuthRequest(BaseModel):
    token: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    location: str | None = None
    headline: str | None = None
    bio: str | None = None
    skills: list | None = None
    preferred_roles: list | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    experience_years: int | None = None
    open_to_remote: bool | None = None


def user_to_dict(user: User) -> dict:
    return {
        "id": str(user.id), "email": user.email, "full_name": user.full_name,
        "avatar_url": user.avatar_url, "role": user.role.value,
        "phone": user.phone, "location": user.location,
        "headline": user.headline, "bio": user.bio,
        "skills": user.skills, "preferred_roles": user.preferred_roles,
        "salary_min": user.salary_min, "salary_max": user.salary_max,
        "experience_years": user.experience_years, "open_to_remote": user.open_to_remote,
        "plan": user.plan,
    }


@router.post("/request-otp")
async def request_otp(req: OTPRequest, db: AsyncSession = Depends(get_db)):
    # Generate 6 digit OTP
    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    # Check if OTP exists for email
    result = await db.execute(select(OTP).where(OTP.email == req.email))
    existing_otp = result.scalars().first()

    if existing_otp:
        existing_otp.otp_code = otp_code
        existing_otp.expires_at = expires_at
    else:
        new_otp = OTP(email=req.email, otp_code=otp_code, expires_at=expires_at)
        db.add(new_otp)

    await db.commit()

    # MOCK EMAIL SENDING: In a production app, use SendGrid/AWS SES/SMTP here
    print(f"\\n--- MOCK EMAIL ---")
    print(f"To: {req.email}")
    print(f"Subject: Your Login Code")
    print(f"Body: Your OTP code is: {otp_code}")
    print(f"------------------\\n")

    return {"message": "OTP sent successfully to your email"}


@router.post("/verify-otp", response_model=AuthResponse)
async def verify_otp(req: OTPVerify, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OTP).where(OTP.email == req.email))
    otp_record = result.scalars().first()

    if not otp_record or otp_record.otp_code != req.otp_code:
        raise HTTPException(400, "Invalid OTP")

    if otp_record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(400, "OTP has expired")

    # Valid OTP - delete it
    await db.delete(otp_record)

    # Check if user exists
    user_result = await db.execute(select(User).where(User.email == req.email))
    user = user_result.scalars().first()

    if not user:
        # Create new user
        user = User(email=req.email, full_name=req.email.split("@")[0])
        db.add(user)
        await db.flush()
        await db.refresh(user)

    await db.commit()

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role.value})
    return AuthResponse(access_token=token, user=user_to_dict(user))


@router.post("/google", response_model=AuthResponse)
async def google_auth(req: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    try:
        # Verify the Google JWT token
        client_id = os.getenv("GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID")
        # To avoid failure in dev if client_id is dummy, we would normally use it.
        idinfo = id_token.verify_oauth2_token(req.token, google_requests.Request(), client_id)

        email = idinfo.get("email")
        full_name = idinfo.get("name", "")
        avatar_url = idinfo.get("picture", "")

        # Check if user exists
        user_result = await db.execute(select(User).where(User.email == email))
        user = user_result.scalars().first()

        if not user:
            # Create user
            user = User(email=email, full_name=full_name, avatar_url=avatar_url)
            db.add(user)
            await db.flush()
            await db.refresh(user)

        await db.commit()

        token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role.value})
        return AuthResponse(access_token=token, user=user_to_dict(user))

    except ValueError:
        raise HTTPException(401, "Invalid Google token")


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == current_user["id"]))
    user = result.scalars().first()
    if not user:
        raise HTTPException(404, "User not found")
    return user_to_dict(user)


@router.patch("/me")
async def update_me(req: UserUpdate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == current_user["id"]))
    user = result.scalars().first()
    if not user:
        raise HTTPException(404, "User not found")

    for field, value in req.model_dump(exclude_none=True).items():
        setattr(user, field, value)

    await db.flush()
    await db.refresh(user)
    return user_to_dict(user)
