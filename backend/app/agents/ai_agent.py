"""
AI Career Copilot — Gemini-Powered AI Agent System
====================================================
A true AI agent that uses Google Gemini to analyze resumes with
high accuracy. Each function is a specialized agent call that
produces structured, intelligent results.

Architecture:
  1. Parse Agent   → Extract profile, skills, experience from raw text
  2. ATS Agent     → Score resume for ATS compatibility with reasoning
  3. Role Agent    → Detect best-fit career roles with confidence
  4. Job Agent     → Match & rank jobs from database
  5. Coach Agent   → Generate improvement tips + interview questions
"""
import json
import re
import os
import time
import traceback
from typing import Optional
from google import genai
from google.genai import types
from app.core.config import settings


# ──────────────────────────────────────────────────────────
# Gemini Client Factory
# ──────────────────────────────────────────────────────────
_client: Optional[genai.Client] = None


def get_client() -> genai.Client:
    """Get or create the Gemini API client."""
    global _client
    if _client is None:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set in .env")
        _client = genai.Client(api_key=api_key)
    return _client


def call_gemini(prompt: str, max_retries: int = 3) -> str:
    """Call Gemini with retry logic and return the text response."""
    client = get_client()
    model = settings.AI_MODEL or "gemini-2.0-flash"

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    max_output_tokens=4096,
                ),
            )
            return response.text or ""
        except Exception as e:
            print(f"[AI Agent] Gemini call failed (attempt {attempt + 1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff: 1s, 2s, 4s
            else:
                raise


def extract_json(text: str) -> dict | list:
    """Extract JSON from LLM response, handling markdown fences."""
    text = text.strip()
    # Remove ```json ... ``` wrapper
    m = re.search(r"```(?:json)?\s*\n?(.*?)\n?\s*```", text, re.DOTALL)
    if m:
        text = m.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find JSON object or array in the text
        for pattern in [r'\{.*\}', r'\[.*\]']:
            m = re.search(pattern, text, re.DOTALL)
            if m:
                try:
                    return json.loads(m.group(0))
                except json.JSONDecodeError:
                    continue
        return {}


# ──────────────────────────────────────────────────────────
# Agent 1: Resume Parser
# ──────────────────────────────────────────────────────────
PARSE_PROMPT = """You are an expert resume parser AI agent. Your job is to extract ALL structured information from this resume text with extreme accuracy.

RESUME TEXT:
---
{text}
---

Extract and return ONLY valid JSON with this EXACT structure:
{{
  "name": "Full Name of the candidate",
  "email": "email@example.com",
  "phone": "+1234567890",
  "linkedin": "https://linkedin.com/in/username",
  "github": "https://github.com/username",
  "website": "https://portfolio.com",
  "location": "City, State/Country",
  "skills": ["Skill1", "Skill2", "Skill3"],
  "experience_years": 3,
  "education": ["B.Tech in Computer Science from XYZ University", "..."],
  "sections": ["summary", "experience", "skills", "education", "projects"],
  "certifications": ["AWS Certified Solutions Architect", "..."],
  "projects": ["Project Name: brief description", "..."],
  "summary": "2-3 sentence professional summary of the candidate"
}}

CRITICAL RULES:
- skills: List EVERY technical skill, framework, language, tool, methodology, and relevant soft skill mentioned. Be thorough — check the entire resume including projects, experience descriptions, and certifications. Include both explicit mentions and implied skills.
- experience_years: Calculate from work experience date ranges. If dates show "2020-2023", that's 3 years. If "2020-Present", calculate from 2020 to now. If unclear, estimate from context. Use 0 only if truly fresh graduate with no work experience.
- education: Include degree, field of study, and institution name
- sections: List which standard resume sections actually exist in the text
- certifications: List any certifications, courses, or professional qualifications
- projects: List key projects with brief descriptions
- summary: Generate a professional summary based on the resume content
- If any info is truly missing, use empty string or empty list — NEVER fabricate contact info"""


def agent_parse_resume(text: str) -> dict:
    """Agent 1: Parse resume into structured data using Gemini."""
    prompt = PARSE_PROMPT.format(text=text[:10000])
    response = call_gemini(prompt)
    parsed = extract_json(response)

    if not isinstance(parsed, dict):
        parsed = {}

    return {
        "profile": {
            "name": parsed.get("name", "Unknown"),
            "email": parsed.get("email", ""),
            "phone": parsed.get("phone", ""),
            "linkedin": parsed.get("linkedin", ""),
            "github": parsed.get("github", ""),
            "website": parsed.get("website", ""),
            "location": parsed.get("location", ""),
        },
        "skills": parsed.get("skills", []),
        "experience_years": int(parsed.get("experience_years", 0)),
        "education": parsed.get("education", []),
        "sections": parsed.get("sections", []),
        "certifications": parsed.get("certifications", []),
        "projects": parsed.get("projects", []),
        "summary": parsed.get("summary", ""),
        "word_count": len(text.split()),
    }


# ──────────────────────────────────────────────────────────
# Agent 2: ATS Scorer
# ──────────────────────────────────────────────────────────
ATS_PROMPT = """You are an expert ATS (Applicant Tracking System) scoring AI agent. Analyze this resume data and provide a rigorous, detailed ATS compatibility assessment.

CANDIDATE PROFILE:
- Name: {name}
- Email: {email}
- Phone: {phone}
- LinkedIn: {linkedin}
- GitHub: {github}
- Location: {location}

SKILLS ({skill_count} found): {skills}

EXPERIENCE: {experience_years} years
EDUCATION: {education}
SECTIONS FOUND: {sections}
WORD COUNT: {word_count}
CERTIFICATIONS: {certifications}

FULL RESUME TEXT (for format analysis):
---
{resume_excerpt}
---

Score this resume on 6 criteria and return ONLY valid JSON:
{{
  "score": 72,
  "grade": "Good",
  "breakdown": {{
    "Contact Info": {{"score": 12, "max": 15, "details": "Has name, email, phone. Missing LinkedIn."}},
    "Skills": {{"score": 20, "max": 25, "count": 12, "details": "Good variety of technical skills."}},
    "Experience": {{"score": 16, "max": 20, "years": 3, "details": "Clear work history with quantifiable achievements."}},
    "Education": {{"score": 8, "max": 10, "details": "B.Tech degree listed with institution."}},
    "Sections": {{"score": 10, "max": 15, "found": ["experience", "skills", "education"], "details": "Missing summary section."}},
    "Format": {{"score": 6, "max": 15, "words": 450, "details": "Good length, uses bullet points."}}
  }},
  "suggestions": [
    "Add a professional summary section at the top",
    "Include more quantifiable achievements (numbers, percentages, impact)",
    "Add your LinkedIn profile URL",
    "Use more industry-standard keywords like 'Agile', 'CI/CD'"
  ],
  "missing_keywords": ["Docker", "CI/CD", "Agile", "REST API"],
  "strengths": ["Strong technical skill set", "Clear work experience section"],
  "overall_assessment": "This resume has a solid foundation but needs improvements in formatting and keyword optimization to pass most ATS systems."
}}

SCORING RULES:
- score: 0-100, MUST equal the sum of all breakdown scores
- grade: "Excellent" (80-100), "Good" (60-79), "Average" (40-59), "Needs Work" (0-39)
- Contact Info (0-15): name(5), email(5), phone(3), linkedin(2)
- Skills (0-25): quantity, relevance, industry-standard naming
- Experience (0-20): years, clarity, achievements, quantifiable results
- Education (0-10): degrees, relevance, institution quality
- Sections (0-15): presence of summary, experience, skills, education, projects
- Format (0-15): word count 200-1500, bullet points, clean formatting, proper length
- suggestions: 4-8 specific, actionable improvements (not generic)
- missing_keywords: important industry keywords NOT found in the resume
- strengths: 2-4 things the resume does well
- BE HONEST AND ACCURATE — don't inflate scores"""


def agent_score_ats(parsed_data: dict, raw_text: str) -> dict:
    """Agent 2: Score resume for ATS compatibility using Gemini."""
    profile = parsed_data["profile"]
    prompt = ATS_PROMPT.format(
        name=profile.get("name", ""),
        email=profile.get("email", ""),
        phone=profile.get("phone", ""),
        linkedin=profile.get("linkedin", ""),
        github=profile.get("github", ""),
        location=profile.get("location", ""),
        skills=", ".join(parsed_data.get("skills", [])[:40]),
        skill_count=len(parsed_data.get("skills", [])),
        experience_years=parsed_data.get("experience_years", 0),
        education=", ".join(parsed_data.get("education", [])),
        sections=", ".join(parsed_data.get("sections", [])),
        word_count=parsed_data.get("word_count", 0),
        certifications=", ".join(parsed_data.get("certifications", [])),
        resume_excerpt=raw_text[:3000],
    )

    response = call_gemini(prompt)
    ats = extract_json(response)

    if not isinstance(ats, dict) or "score" not in ats:
        ats = {
            "score": 50, "grade": "Average",
            "breakdown": {}, "suggestions": ["Could not fully analyze — please try again"],
            "missing_keywords": [], "strengths": [],
            "overall_assessment": "Partial analysis completed."
        }

    # Ensure grade matches score
    s = int(ats.get("score", 50))
    ats["score"] = max(0, min(s, 100))
    if "grade" not in ats:
        ats["grade"] = (
            "Excellent" if s >= 80 else
            "Good" if s >= 60 else
            "Average" if s >= 40 else
            "Needs Work"
        )

    return ats


# ──────────────────────────────────────────────────────────
# Agent 3: Role Detector
# ──────────────────────────────────────────────────────────
ROLE_PROMPT = """You are an expert career advisor AI agent. Based on this candidate's complete profile, detect the most suitable job roles they should pursue.

CANDIDATE PROFILE:
- Skills: {skills}
- Experience: {experience_years} years
- Education: {education}
- Certifications: {certifications}
- Summary: {summary}

RESUME EXCERPT (for context):
---
{excerpt}
---

Analyze the candidate's entire profile and return ONLY a valid JSON array of 4-8 best-fit roles:
[
  {{
    "role": "Full Stack Developer",
    "confidence": 85,
    "matched_skills": ["React", "Node.js", "Python", "MongoDB"],
    "emoji": "🌐",
    "color": "#8b5cf6",
    "reason": "Strong frontend and backend skills with full-stack project experience",
    "growth_tip": "Consider learning Kubernetes and system design for senior roles"
  }}
]

RULES:
- confidence: 15-100, based on how well the candidate's ACTUAL skills and experience match the role
- matched_skills: ONLY list skills the candidate actually has that are relevant to this role
- emoji: a relevant emoji that represents the role
- color: a distinct hex color for UI display
- reason: 1 sentence explaining why this role is a good fit
- growth_tip: 1 sentence suggesting what to learn next for this career path
- Sort by confidence descending (highest first)
- BE ACCURATE — only suggest roles that genuinely match their skill set
- Common roles to consider: Frontend Developer, Backend Developer, Full Stack Developer, Data Scientist, Data Analyst, Data Engineer, DevOps Engineer, Cloud Architect, Mobile Developer, ML Engineer, Java Developer, Python Developer, UI/UX Designer, QA Engineer, Project Manager, Cybersecurity Analyst, Blockchain Developer, SRE Engineer, Solutions Architect, Technical Lead"""


def agent_detect_roles(parsed_data: dict, raw_text: str) -> list:
    """Agent 3: Detect best-fit job roles using Gemini."""
    prompt = ROLE_PROMPT.format(
        skills=", ".join(parsed_data.get("skills", [])[:30]),
        experience_years=parsed_data.get("experience_years", 0),
        education=", ".join(parsed_data.get("education", [])),
        certifications=", ".join(parsed_data.get("certifications", [])),
        summary=parsed_data.get("summary", ""),
        excerpt=raw_text[:3000],
    )

    response = call_gemini(prompt)
    roles = extract_json(response)

    if isinstance(roles, dict):
        roles = roles.get("roles", [])
    if not isinstance(roles, list):
        roles = []

    # Validate and clean
    valid_roles = []
    for r in roles[:8]:
        if isinstance(r, dict) and "role" in r:
            valid_roles.append({
                "role": r.get("role", "Unknown"),
                "confidence": max(15, min(int(r.get("confidence", 50)), 100)),
                "matched_skills": r.get("matched_skills", []),
                "emoji": r.get("emoji", "💼"),
                "color": r.get("color", "#6366f1"),
                "reason": r.get("reason", ""),
                "growth_tip": r.get("growth_tip", ""),
            })

    return sorted(valid_roles, key=lambda x: x["confidence"], reverse=True)


# ──────────────────────────────────────────────────────────
# Agent 4: Job Matcher
# ──────────────────────────────────────────────────────────
from .pipeline import JOB_DATABASE


JOB_MATCH_PROMPT = """You are an expert job matching AI agent. Score how well each job matches this candidate's profile.

CANDIDATE PROFILE:
- Skills: {skills}
- Best-Fit Roles: {roles}
- Experience: {experience_years} years
- Education: {education}

AVAILABLE JOBS:
{job_list}

For EACH job, score the match (0-100) based on:
1. Skill overlap (how many required skills the candidate has)
2. Role alignment (does the job title match their detected roles?)
3. Experience fit (does their experience match the job's requirements?)
4. Overall career trajectory fit

Return ONLY a valid JSON array:
[
  {{
    "title": "Senior Frontend Developer",
    "company": "Google",
    "match_score": 85,
    "match_reason": "Strong React and TypeScript skills match 4 of 5 required skills"
  }}
]

RULES:
- Include ALL jobs from the list above
- Be honest with scores — don't inflate
- match_score: 0-100
- match_reason: Brief 1-sentence explanation
- Sort by match_score descending"""


def agent_match_jobs(parsed_data: dict, roles: list) -> list:
    """Agent 4: Match and rank jobs using Gemini."""
    # Build job list string
    job_list = "\n".join(
        f"- {j['title']} at {j['company']} ({j['location']}) "
        f"| Skills: {', '.join(j['skills'])} | Experience: {j['experience']} "
        f"| {'Remote' if j['remote'] else 'On-site'}"
        for j in JOB_DATABASE
    )

    role_names = [r["role"] for r in roles[:5]] if roles else ["General"]

    prompt = JOB_MATCH_PROMPT.format(
        skills=", ".join(parsed_data.get("skills", [])[:25]),
        roles=", ".join(role_names),
        experience_years=parsed_data.get("experience_years", 0),
        education=", ".join(parsed_data.get("education", [])),
        job_list=job_list,
    )

    response = call_gemini(prompt)
    scores_raw = extract_json(response)

    if isinstance(scores_raw, dict):
        scores_raw = scores_raw.get("jobs", scores_raw.get("matches", []))
    if not isinstance(scores_raw, list):
        scores_raw = []

    # Map LLM scores back to full job data
    score_map = {}
    reason_map = {}
    for s in scores_raw:
        if isinstance(s, dict):
            key = f"{s.get('title', '')}|{s.get('company', '')}".lower()
            score_map[key] = max(0, min(int(s.get("match_score", 0)), 100))
            reason_map[key] = s.get("match_reason", "")

    results = []
    user_skills = [s.lower() for s in parsed_data.get("skills", [])]

    for job in JOB_DATABASE:
        key = f"{job['title']}|{job['company']}".lower()
        match_score = score_map.get(key, 0)

        if match_score < 10:
            continue  # Skip very low matches

        job_skills = [s.lower() for s in job["skills"]]
        matched_skills = [s for s in job_skills if s in user_skills]

        results.append({
            **job,
            "match_score": match_score,
            "matched_skills": matched_skills,
            "match_reason": reason_map.get(key, ""),
        })

    return sorted(results, key=lambda j: j["match_score"], reverse=True)[:12]


# ──────────────────────────────────────────────────────────
# Agent 5: Career Coach
# ──────────────────────────────────────────────────────────
COACH_PROMPT = """You are an expert career coach AI agent. Based on this candidate's resume analysis, provide actionable career development guidance.

CANDIDATE:
- Name: {name}
- Skills: {skills}
- Experience: {experience_years} years
- Education: {education}
- Top Roles: {roles}
- ATS Score: {ats_score}/100 ({ats_grade})
- Key Weaknesses: {weaknesses}

Return ONLY valid JSON:
{{
  "resume_improvements": [
    {{
      "section": "Summary",
      "priority": "high",
      "current_issue": "No professional summary section",
      "suggestion": "Add a 2-3 sentence summary highlighting your key skills and experience",
      "example": "Results-driven Full Stack Developer with 3+ years of experience building scalable web applications using React, Node.js, and AWS..."
    }}
  ],
  "skill_gaps": [
    {{
      "skill": "Docker",
      "importance": "high",
      "reason": "Required by 80% of backend/DevOps roles",
      "learning_resource": "Docker official documentation + hands-on labs"
    }}
  ],
  "interview_questions": [
    {{
      "question": "Describe a challenging project and how you overcame technical obstacles.",
      "category": "behavioral",
      "tip": "Use the STAR method: Situation, Task, Action, Result"
    }}
  ],
  "career_roadmap": {{
    "current_level": "Mid-Level Developer",
    "next_target": "Senior Developer",
    "timeline": "12-18 months",
    "key_actions": [
      "Lead a team project end-to-end",
      "Learn system design patterns",
      "Get AWS Solutions Architect certification"
    ]
  }},
  "salary_insight": {{
    "estimated_range": "$80,000 - $120,000",
    "factors": "Based on 3 years experience with React/Node.js stack in the US market"
  }}
}}

RULES:
- resume_improvements: 3-6 specific, prioritized improvements with examples
- skill_gaps: 3-5 missing skills that would significantly boost their career
- interview_questions: 5-8 likely interview questions for their target roles (mix of technical and behavioral)
- career_roadmap: realistic next career step with timeline
- Be specific, actionable, and encouraging"""


def agent_career_coach(parsed_data: dict, ats_result: dict, roles: list) -> dict:
    """Agent 5: Generate career coaching insights using Gemini."""
    role_names = [r["role"] for r in roles[:3]] if roles else ["General"]
    weaknesses = ats_result.get("suggestions", [])[:5]

    prompt = COACH_PROMPT.format(
        name=parsed_data.get("profile", {}).get("name", "Candidate"),
        skills=", ".join(parsed_data.get("skills", [])[:25]),
        experience_years=parsed_data.get("experience_years", 0),
        education=", ".join(parsed_data.get("education", [])),
        roles=", ".join(role_names),
        ats_score=ats_result.get("score", 50),
        ats_grade=ats_result.get("grade", "Average"),
        weaknesses="; ".join(weaknesses),
    )

    response = call_gemini(prompt)
    coaching = extract_json(response)

    if not isinstance(coaching, dict):
        coaching = {}

    return {
        "resume_improvements": coaching.get("resume_improvements", []),
        "skill_gaps": coaching.get("skill_gaps", []),
        "interview_questions": coaching.get("interview_questions", []),
        "career_roadmap": coaching.get("career_roadmap", {}),
        "salary_insight": coaching.get("salary_insight", {}),
    }


# ──────────────────────────────────────────────────────────
# Full AI Agent Pipeline
# ──────────────────────────────────────────────────────────
def run_ai_agent_analysis(text: str) -> dict:
    """
    Execute the full 5-agent AI pipeline.

    Flow: Parse → ATS Score → Role Detection → Job Matching → Career Coaching
    Each agent uses Gemini for intelligent, accurate results.
    """
    print("[AI Agent] Starting full analysis pipeline...")
    start_time = time.time()

    # Agent 1: Parse Resume
    print("[AI Agent] Running Parse Agent...")
    parsed = agent_parse_resume(text)

    # Agent 2: ATS Scoring
    print("[AI Agent] Running ATS Scoring Agent...")
    ats = agent_score_ats(parsed, text)

    # Agent 3: Role Detection
    print("[AI Agent] Running Role Detection Agent...")
    roles = agent_detect_roles(parsed, text)

    # Agent 4: Job Matching
    print("[AI Agent] Running Job Matching Agent...")
    jobs = agent_match_jobs(parsed, roles)

    # Agent 5: Career Coaching
    print("[AI Agent] Running Career Coach Agent...")
    coaching = agent_career_coach(parsed, ats, roles)

    elapsed = time.time() - start_time
    print(f"[AI Agent] Pipeline completed in {elapsed:.1f}s")

    return {
        "profile": parsed["profile"],
        "skills": parsed["skills"],
        "experience_years": parsed["experience_years"],
        "education": parsed["education"],
        "sections": parsed["sections"],
        "word_count": parsed["word_count"],
        "certifications": parsed.get("certifications", []),
        "projects": parsed.get("projects", []),
        "summary": parsed.get("summary", ""),
        "ats": ats,
        "roles": roles,
        "jobs": jobs,
        "coaching": coaching,
        "engine": "gemini-ai-agent",
        "analysis_time": round(elapsed, 1),
    }
