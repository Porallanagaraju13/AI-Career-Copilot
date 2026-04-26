# 🚀 Deployment Guide

Full deployment instructions are in [DEPLOYMENT.md](./DEPLOYMENT.md).

## Quick Local Start

```bash
# Terminal 1 — Backend
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend  
cd frontend
npm install && npm run dev
```

Open **http://localhost:3000** → Sign up → Upload resume → Done!

## Environment Files

| File | Location | Template |
|------|----------|----------|
| Backend config | `backend/.env` | Copy from `.env.example` |
| Frontend config | `frontend/.env.local` | Copy from `.env.example` |

> The AI pipeline works **without any API keys** — it uses built-in rule-based analysis.
