import asyncio
import sys
import os

# Add the current directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select
from app.db.session import async_session
from app.db.models import User, UserRole

async def make_admin(email: str):
    async with async_session() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        
        if not user:
            print(f"Error: User with email {email} not found.")
            return

        user.role = UserRole.ADMIN
        await db.commit()
        print(f"Success: {email} is now an Admin!")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    asyncio.run(make_admin(email))
