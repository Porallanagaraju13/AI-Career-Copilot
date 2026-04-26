# 🧭 AI Career Copilot

AI-powered resume screening, ATS scoring, role detection, and job matching platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, Framer Motion |
| **Backend** | FastAPI, SQLAlchemy, SQLite (dev) / PostgreSQL (prod) |
| **Auth** | JWT (python-jose + passlib/bcrypt) |
| **Resume Parsing** | PyPDF2 + python-docx |
| **AI Pipeline** | 4-agent system: Parser → ATS Scorer → Role Detector → Job Matcher |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/ai-career-copilot.git
cd ai-career-copilot

# 2. Backend
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
cp ../.env.example .env        # Edit SECRET_KEY
python -m uvicorn main:app --reload --port 8000

# 3. Frontend (new terminal)
cd frontend
npm install
cp ../.env.example .env.local  # Keep NEXT_PUBLIC_API_URL
npm run dev
```

Open **http://localhost:3000** → Sign up → Upload resume → Get results.

## Project Structure

```
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── app/
│   │   ├── api/                # REST endpoints (auth, resume, jobs)
│   │   ├── agents/pipeline.py  # 4-agent AI analysis system
│   │   ├── core/config.py      # Environment configuration
│   │   ├── core/security.py    # JWT + password hashing
│   │   └── db/                 # SQLAlchemy models + session
│   └── requirements.txt
├── frontend/
│   ├── src/app/                # Next.js pages
│   │   ├── page.tsx            # Landing page
│   │   ├── login/              # Auth pages
│   │   ├── signup/
│   │   └── dashboard/          # Protected dashboard pages
│   ├── src/lib/utils.ts        # API client + helpers
│   └── package.json
└── .env.example                # Template for all env vars
```

## License

MIT
