"""
LangGraph Multi-Agent Pipeline for Resume Analysis
====================================================
4-node graph: parse → score → detect_roles → match_jobs

Each node is an LLM-powered agent that processes the shared state.
"""
import json
import re
import os
from typing import TypedDict, Annotated, Any
from langgraph.graph import StateGraph, END


# ──────────────────────────────────────────────
# State Schema
# ──────────────────────────────────────────────
class AgentState(TypedDict):
    raw_text: str
    profile: dict
    skills: list[str]
    experience_years: int
    education: list[str]
    sections: list[str]
    word_count: int
    ats: dict
    roles: list[dict]
    jobs: list[dict]


# ──────────────────────────────────────────────
# LLM Factory
# ──────────────────────────────────────────────
def get_llm():
    """Create the LLM based on environment configuration."""
    from app.core.config import settings

    if settings.GEMINI_API_KEY:
        os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=settings.AI_MODEL if "gemini" in settings.AI_MODEL else "gemini-2.0-flash",
            temperature=0.1,
        )
    elif settings.OPENAI_API_KEY:
        os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=settings.AI_MODEL if "gpt" in settings.AI_MODEL else "gpt-4o-mini",
            temperature=0.1,
        )
    else:
        raise RuntimeError("No AI API key configured. Set GEMINI_API_KEY or OPENAI_API_KEY in .env")


def safe_parse_json(text: str) -> dict:
    """Extract JSON from LLM response, handling markdown fences."""
    text = text.strip()
    # Remove ```json ... ``` wrapper
    m = re.search(r"```(?:json)?\s*\n?(.*?)\n?\s*```", text, re.DOTALL)
    if m:
        text = m.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {}


# ──────────────────────────────────────────────
# Node 1: Resume Parser Agent
# ──────────────────────────────────────────────
PARSE_PROMPT = """You are a resume parsing expert. Extract structured information from this resume text.

RESUME TEXT:
---
{text}
---

Return ONLY valid JSON with this exact structure:
{{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "linkedin": "https://linkedin.com/in/...",
  "github": "https://github.com/...",
  "location": "City, Country",
  "skills": ["Skill1", "Skill2", ...],
  "experience_years": 3,
  "education": ["B.Tech Computer Science", "..."],
  "sections": ["summary", "experience", "skills", "education", "projects"],
  "projects_summary": "Brief summary of key projects"
}}

Rules:
- skills: list ALL technical skills, tools, frameworks, languages, and soft skills mentioned
- experience_years: estimate from date ranges; if unclear, use 0
- education: list degree names with field
- sections: list which standard resume sections exist
- If info is missing, use empty string or empty list"""


def parse_resume_node(state: AgentState) -> dict:
    """Agent 1: Parse resume into structured data using LLM."""
    llm = get_llm()
    prompt = PARSE_PROMPT.format(text=state["raw_text"][:8000])
    response = llm.invoke(prompt)
    parsed = safe_parse_json(response.content)

    return {
        "profile": {
            "name": parsed.get("name", "Unknown"),
            "email": parsed.get("email", ""),
            "phone": parsed.get("phone", ""),
            "linkedin": parsed.get("linkedin", ""),
            "github": parsed.get("github", ""),
            "location": parsed.get("location", ""),
        },
        "skills": parsed.get("skills", []),
        "experience_years": parsed.get("experience_years", 0),
        "education": parsed.get("education", []),
        "sections": parsed.get("sections", []),
        "word_count": len(state["raw_text"].split()),
    }


# ──────────────────────────────────────────────
# Node 2: ATS Scoring Agent
# ──────────────────────────────────────────────
ATS_PROMPT = """You are an ATS (Applicant Tracking System) scoring expert.

Analyze this resume data and provide a detailed ATS compatibility score.

PROFILE: {profile}
SKILLS ({skill_count}): {skills}
EXPERIENCE: {experience_years} years
EDUCATION: {education}
SECTIONS FOUND: {sections}
WORD COUNT: {word_count}

Score the resume on these 6 criteria (return exact JSON):
{{
  "score": 72,
  "grade": "Good",
  "breakdown": {{
    "Contact Info": {{"score": 12, "max": 15}},
    "Skills": {{"score": 20, "max": 25}},
    "Experience": {{"score": 16, "max": 20}},
    "Education": {{"score": 8, "max": 10}},
    "Sections": {{"score": 10, "max": 15}},
    "Format": {{"score": 6, "max": 15}}
  }},
  "suggestions": [
    "Add a professional summary section",
    "Include more quantifiable achievements"
  ],
  "missing_keywords": ["Docker", "CI/CD", "Agile"]
}}

Rules:
- score: 0-100, sum of all breakdown scores
- grade: "Excellent" (80+), "Good" (60-79), "Average" (40-59), "Needs Work" (<40)
- Contact Info (15pts): name, email, phone, linkedin, github
- Skills (25pts): quantity and relevance of skills
- Experience (20pts): years and clarity
- Education (10pts): degrees listed
- Sections (15pts): has summary, experience, skills, education, projects
- Format (15pts): word count 200-1500, bullet points, concise lines
- suggestions: 3-6 actionable improvements
- missing_keywords: common keywords NOT found in skills"""


def score_ats_node(state: AgentState) -> dict:
    """Agent 2: Score resume for ATS compatibility using LLM."""
    llm = get_llm()
    prompt = ATS_PROMPT.format(
        profile=json.dumps(state["profile"]),
        skills=", ".join(state["skills"][:30]),
        skill_count=len(state["skills"]),
        experience_years=state["experience_years"],
        education=", ".join(state["education"]),
        sections=", ".join(state["sections"]),
        word_count=state["word_count"],
    )
    response = llm.invoke(prompt)
    ats = safe_parse_json(response.content)

    # Ensure valid structure
    if "score" not in ats:
        ats = {"score": 50, "grade": "Average", "breakdown": {}, "suggestions": [], "missing_keywords": []}
    if "grade" not in ats:
        s = ats["score"]
        ats["grade"] = "Excellent" if s >= 80 else "Good" if s >= 60 else "Average" if s >= 40 else "Needs Work"

    return {"ats": ats}


# ──────────────────────────────────────────────
# Node 3: Role Detection Agent
# ──────────────────────────────────────────────
ROLE_PROMPT = """You are a career advisor AI. Based on these resume skills and experience, detect the best-fit job roles.

SKILLS: {skills}
EXPERIENCE: {experience_years} years
EDUCATION: {education}
RESUME EXCERPT: {excerpt}

Return ONLY valid JSON — an array of 4-8 matching roles:
[
  {{
    "role": "Full Stack Developer",
    "confidence": 85,
    "matched_skills": ["React", "Node.js", "Python"],
    "emoji": "🌐",
    "color": "#8b5cf6"
  }}
]

Rules:
- confidence: 15-100, based on how well skills match the role
- matched_skills: the specific skills that match this role
- emoji: a relevant emoji for the role
- color: a hex color for UI display
- Sort by confidence descending
- Common roles: Frontend Developer, Backend Developer, Full Stack Developer, Data Scientist, Data Analyst, DevOps Engineer, Cloud Architect, Mobile Developer, ML Engineer, Java Developer, Python Developer, UI/UX Designer, QA Engineer, Project Manager, Cybersecurity Analyst"""


def detect_roles_node(state: AgentState) -> dict:
    """Agent 3: Detect best-fit job roles using LLM."""
    llm = get_llm()
    prompt = ROLE_PROMPT.format(
        skills=", ".join(state["skills"][:25]),
        experience_years=state["experience_years"],
        education=", ".join(state["education"]),
        excerpt=state["raw_text"][:2000],
    )
    response = llm.invoke(prompt)
    roles = safe_parse_json(response.content) if response.content.strip().startswith("[") else []

    if not roles:
        # Try parsing as object with roles key
        parsed = safe_parse_json(response.content)
        roles = parsed.get("roles", []) if isinstance(parsed, dict) else []

    # Validate structure
    valid_roles = []
    for r in roles[:8]:
        if isinstance(r, dict) and "role" in r:
            valid_roles.append({
                "role": r.get("role", "Unknown"),
                "confidence": min(max(int(r.get("confidence", 50)), 15), 100),
                "matched_skills": r.get("matched_skills", []),
                "emoji": r.get("emoji", "💼"),
                "color": r.get("color", "#6366f1"),
            })

    return {"roles": sorted(valid_roles, key=lambda x: x["confidence"], reverse=True)}


# ──────────────────────────────────────────────
# Node 4: Job Matching Agent
# ──────────────────────────────────────────────
from .pipeline import JOB_DATABASE  # reuse the job database


def match_jobs_node(state: AgentState) -> dict:
    """Agent 4: Match jobs from database using LLM-scored relevance."""
    llm = get_llm()
    user_skills = [s.lower() for s in state["skills"]]
    role_names = [r["role"].lower() for r in state["roles"]]

    # Pre-filter: only send relevant jobs to LLM
    candidates = []
    for job in JOB_DATABASE:
        job_skills = [s.lower() for s in job["skills"]]
        matched = [s for s in job_skills if s in user_skills]
        title_lower = job["title"].lower()
        role_boost = any(r.split()[0] in title_lower for r in role_names)
        if matched or role_boost:
            candidates.append({**job, "_matched": matched, "_boost": role_boost})

    if not candidates:
        return {"jobs": []}

    # Ask LLM to score and rank
    job_summaries = "\n".join(
        f"- {j['title']} at {j['company']} ({j['location']}) — skills: {', '.join(j['skills'])}"
        for j in candidates[:15]
    )

    prompt = f"""You are a job matching expert. Score how well each job matches this candidate.

CANDIDATE SKILLS: {', '.join(state['skills'][:20])}
CANDIDATE ROLES: {', '.join(r['role'] for r in state['roles'][:5])}
EXPERIENCE: {state['experience_years']} years

JOBS:
{job_summaries}

Return ONLY a JSON array with match scores (0-100) for each job:
[{{"title": "Job Title", "company": "Company", "match_score": 85}}]

Score based on: skill overlap, role alignment, experience fit."""

    response = llm.invoke(prompt)
    scores_raw = safe_parse_json(response.content) if response.content.strip().startswith("[") else []

    if not scores_raw:
        parsed = safe_parse_json(response.content)
        scores_raw = parsed.get("jobs", parsed.get("matches", [])) if isinstance(parsed, dict) else []

    # Merge LLM scores back into job data
    score_map = {}
    for s in scores_raw:
        if isinstance(s, dict):
            key = f"{s.get('title', '')}|{s.get('company', '')}".lower()
            score_map[key] = min(max(int(s.get("match_score", 50)), 10), 100)

    results = []
    for job in candidates:
        key = f"{job['title']}|{job['company']}".lower()
        match_score = score_map.get(key, 50)
        results.append({
            **{k: v for k, v in job.items() if not k.startswith("_")},
            "match_score": match_score,
            "matched_skills": job.get("_matched", []),
        })

    return {"jobs": sorted(results, key=lambda j: j["match_score"], reverse=True)[:12]}


# ──────────────────────────────────────────────
# Build the LangGraph
# ──────────────────────────────────────────────
def build_graph() -> StateGraph:
    """Construct the 4-agent LangGraph pipeline."""
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("parse_resume", parse_resume_node)
    graph.add_node("score_ats", score_ats_node)
    graph.add_node("detect_roles", detect_roles_node)
    graph.add_node("match_jobs", match_jobs_node)

    # Define edges: linear flow
    graph.set_entry_point("parse_resume")
    graph.add_edge("parse_resume", "score_ats")
    graph.add_edge("score_ats", "detect_roles")
    graph.add_edge("detect_roles", "match_jobs")
    graph.add_edge("match_jobs", END)

    return graph.compile()


# Compiled graph (singleton)
_compiled_graph = None


def get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph


def run_langgraph_analysis(text: str) -> dict:
    """Execute the full LangGraph pipeline and return results."""
    graph = get_graph()

    initial_state: AgentState = {
        "raw_text": text,
        "profile": {},
        "skills": [],
        "experience_years": 0,
        "education": [],
        "sections": [],
        "word_count": 0,
        "ats": {},
        "roles": [],
        "jobs": [],
    }

    result = graph.invoke(initial_state)

    return {
        "profile": result["profile"],
        "skills": result["skills"],
        "experience_years": result["experience_years"],
        "education": result["education"],
        "sections": result["sections"],
        "word_count": result["word_count"],
        "ats": result["ats"],
        "roles": result["roles"],
        "jobs": result["jobs"],
    }
