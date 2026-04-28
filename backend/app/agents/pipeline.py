"""AI Career Copilot — Analysis Pipeline Orchestrator

Routes analysis through the Gemini AI Agent (primary) or falls
back to a basic rule-based engine if no API key is configured.
"""
import re
import traceback
from dataclasses import dataclass, field


# ===== JOB DATABASE =====
# Shared across agents — realistic job listings for matching
JOB_DATABASE = [
    {"id": "j1", "title": "Senior Frontend Developer", "company": "Google", "location": "Bangalore, IN", "salary_min": 2500000, "salary_max": 4000000, "currency": "INR", "remote": False, "experience": "3-5 years", "skills": ["react", "javascript", "typescript", "css", "html"], "url": "https://careers.google.com", "logo": "https://logo.clearbit.com/google.com", "posted": "2 days ago", "type": "full-time"},
    {"id": "j2", "title": "React Developer", "company": "Microsoft", "location": "Hyderabad, IN", "salary_min": 1800000, "salary_max": 3000000, "currency": "INR", "remote": False, "experience": "2-4 years", "skills": ["react", "node.js", "typescript"], "url": "https://careers.microsoft.com", "logo": "https://logo.clearbit.com/microsoft.com", "posted": "1 day ago", "type": "full-time"},
    {"id": "j3", "title": "Full Stack Engineer", "company": "Amazon", "location": "Remote", "salary_min": 120000, "salary_max": 180000, "currency": "USD", "remote": True, "experience": "3-6 years", "skills": ["react", "node.js", "aws", "python"], "url": "https://amazon.jobs", "logo": "https://logo.clearbit.com/amazon.com", "posted": "3 days ago", "type": "full-time"},
    {"id": "j4", "title": "Backend Developer", "company": "Netflix", "location": "Remote", "salary_min": 150000, "salary_max": 220000, "currency": "USD", "remote": True, "experience": "4-7 years", "skills": ["java", "python", "microservices", "aws"], "url": "https://jobs.netflix.com", "logo": "https://logo.clearbit.com/netflix.com", "posted": "5 days ago", "type": "full-time"},
    {"id": "j5", "title": "Data Scientist", "company": "Meta", "location": "Menlo Park, US", "salary_min": 140000, "salary_max": 200000, "currency": "USD", "remote": False, "experience": "3-5 years", "skills": ["python", "machine learning", "tensorflow", "sql"], "url": "https://metacareers.com", "logo": "https://logo.clearbit.com/meta.com", "posted": "1 day ago", "type": "full-time"},
    {"id": "j6", "title": "Data Analyst", "company": "Flipkart", "location": "Bangalore, IN", "salary_min": 1200000, "salary_max": 2000000, "currency": "INR", "remote": False, "experience": "1-3 years", "skills": ["sql", "python", "excel", "power bi"], "url": "https://flipkartcareers.com", "logo": "https://logo.clearbit.com/flipkart.com", "posted": "4 days ago", "type": "full-time"},
    {"id": "j7", "title": "DevOps Engineer", "company": "Uber", "location": "San Francisco, US", "salary_min": 130000, "salary_max": 190000, "currency": "USD", "remote": False, "experience": "3-5 years", "skills": ["docker", "kubernetes", "aws", "terraform"], "url": "https://uber.com/careers", "logo": "https://logo.clearbit.com/uber.com", "posted": "2 days ago", "type": "full-time"},
    {"id": "j8", "title": "Cloud Solutions Architect", "company": "AWS", "location": "Remote", "salary_min": 140000, "salary_max": 210000, "currency": "USD", "remote": True, "experience": "5-8 years", "skills": ["aws", "terraform", "docker", "kubernetes"], "url": "https://amazon.jobs/aws", "logo": "https://logo.clearbit.com/aws.amazon.com", "posted": "6 days ago", "type": "full-time"},
    {"id": "j9", "title": "Mobile Developer", "company": "Spotify", "location": "Stockholm, SE", "salary_min": 60000, "salary_max": 90000, "currency": "EUR", "remote": False, "experience": "2-4 years", "skills": ["react native", "kotlin", "swift", "javascript"], "url": "https://lifeatspotify.com", "logo": "https://logo.clearbit.com/spotify.com", "posted": "3 days ago", "type": "full-time"},
    {"id": "j10", "title": "Python Developer", "company": "Stripe", "location": "Remote", "salary_min": 130000, "salary_max": 180000, "currency": "USD", "remote": True, "experience": "3-5 years", "skills": ["python", "django", "flask", "postgresql"], "url": "https://stripe.com/jobs", "logo": "https://logo.clearbit.com/stripe.com", "posted": "1 day ago", "type": "full-time"},
    {"id": "j11", "title": "UI/UX Designer", "company": "Apple", "location": "Cupertino, US", "salary_min": 120000, "salary_max": 170000, "currency": "USD", "remote": False, "experience": "3-6 years", "skills": ["figma", "sketch", "photoshop", "ui/ux"], "url": "https://apple.com/careers", "logo": "https://logo.clearbit.com/apple.com", "posted": "4 days ago", "type": "full-time"},
    {"id": "j12", "title": "Java Developer", "company": "Goldman Sachs", "location": "Bangalore, IN", "salary_min": 2000000, "salary_max": 3500000, "currency": "INR", "remote": False, "experience": "2-5 years", "skills": ["java", "spring boot", "microservices", "sql"], "url": "https://goldmansachs.com/careers", "logo": "https://logo.clearbit.com/goldmansachs.com", "posted": "2 days ago", "type": "full-time"},
    {"id": "j13", "title": "ML Engineer", "company": "OpenAI", "location": "San Francisco, US", "salary_min": 180000, "salary_max": 300000, "currency": "USD", "remote": False, "experience": "4-7 years", "skills": ["python", "tensorflow", "pytorch", "deep learning"], "url": "https://openai.com/careers", "logo": "https://logo.clearbit.com/openai.com", "posted": "1 day ago", "type": "full-time"},
    {"id": "j14", "title": "QA Automation Engineer", "company": "Salesforce", "location": "Hyderabad, IN", "salary_min": 1500000, "salary_max": 2500000, "currency": "INR", "remote": False, "experience": "2-4 years", "skills": ["selenium", "java", "testing", "automation"], "url": "https://salesforce.com/careers", "logo": "https://logo.clearbit.com/salesforce.com", "posted": "5 days ago", "type": "full-time"},
    {"id": "j15", "title": "Blockchain Developer", "company": "Coinbase", "location": "Remote", "salary_min": 150000, "salary_max": 250000, "currency": "USD", "remote": True, "experience": "3-5 years", "skills": ["solidity", "blockchain", "web3", "javascript"], "url": "https://coinbase.com/careers", "logo": "https://logo.clearbit.com/coinbase.com", "posted": "3 days ago", "type": "full-time"},
    {"id": "j16", "title": "SRE Engineer", "company": "LinkedIn", "location": "Bangalore, IN", "salary_min": 2500000, "salary_max": 4000000, "currency": "INR", "remote": False, "experience": "3-6 years", "skills": ["kubernetes", "docker", "linux", "aws", "monitoring"], "url": "https://careers.linkedin.com", "logo": "https://logo.clearbit.com/linkedin.com", "posted": "1 day ago", "type": "full-time"},
    {"id": "j17", "title": "Product Manager", "company": "Atlassian", "location": "Sydney, AU", "salary_min": 120000, "salary_max": 170000, "currency": "AUD", "remote": True, "experience": "5-8 years", "skills": ["project management", "agile", "scrum", "jira", "roadmap"], "url": "https://atlassian.com/careers", "logo": "https://logo.clearbit.com/atlassian.com", "posted": "4 days ago", "type": "full-time"},
    {"id": "j18", "title": "React Native Developer", "company": "Airbnb", "location": "Remote", "salary_min": 130000, "salary_max": 185000, "currency": "USD", "remote": True, "experience": "3-5 years", "skills": ["react native", "javascript", "typescript", "ios", "android"], "url": "https://airbnb.com/careers", "logo": "https://logo.clearbit.com/airbnb.com", "posted": "2 days ago", "type": "full-time"},
    {"id": "j19", "title": "Cybersecurity Engineer", "company": "CrowdStrike", "location": "Remote", "salary_min": 110000, "salary_max": 160000, "currency": "USD", "remote": True, "experience": "2-5 years", "skills": ["cybersecurity", "security", "penetration testing", "siem"], "url": "https://crowdstrike.com/careers", "logo": "https://logo.clearbit.com/crowdstrike.com", "posted": "6 days ago", "type": "full-time"},
    {"id": "j20", "title": "Database Administrator", "company": "Oracle", "location": "Hyderabad, IN", "salary_min": 1500000, "salary_max": 2500000, "currency": "INR", "remote": False, "experience": "3-5 years", "skills": ["oracle", "sql", "postgresql", "database"], "url": "https://oracle.com/careers", "logo": "https://logo.clearbit.com/oracle.com", "posted": "3 days ago", "type": "full-time"},
]


# ===== EMERGENCY RULE-BASED FALLBACK =====
# Only used if Gemini API is completely unavailable

TECH_SKILLS = {
    "languages": ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Dart", "Perl", "Lua", "Haskell", "Elixir"],
    "frontend": ["React", "Angular", "Vue", "Next.js", "Nuxt.js", "Svelte", "HTML", "CSS", "SASS", "LESS", "Tailwind", "Bootstrap", "jQuery", "Redux", "Zustand", "Material UI", "Chakra UI"],
    "backend": ["Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", ".NET", "Rails", "Gin", "Fiber", "NestJS", "Koa", "Hono"],
    "database": ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase", "DynamoDB", "Elasticsearch", "SQL Server", "Oracle", "Cassandra", "Neo4j", "SQLite", "MariaDB"],
    "cloud": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Ansible", "CloudFormation", "Vercel", "Netlify", "Heroku"],
    "devops": ["CI/CD", "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "ArgoCD", "Prometheus", "Grafana", "Datadog"],
    "ai_ml": ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy", "OpenCV", "Hugging Face", "LangChain", "LLM", "RAG"],
    "tools": ["Git", "Linux", "Jira", "Confluence", "Figma", "Sketch", "Postman", "Swagger"],
    "concepts": ["REST API", "GraphQL", "Microservices", "Agile", "Scrum", "TDD", "SOLID", "Design Patterns", "System Design", "DevOps", "OAuth", "JWT"],
    "soft": ["Communication", "Leadership", "Problem Solving", "Team Management", "Project Management", "Mentoring", "Collaboration"]
}

ALL_SKILLS = []
for cat_skills in TECH_SKILLS.values():
    ALL_SKILLS.extend(cat_skills)

ROLE_DEFINITIONS = {
    "Frontend Developer": {"keywords": ["react", "angular", "vue", "next.js", "html", "css", "javascript", "typescript", "tailwind"], "emoji": "🎨", "color": "#3b82f6"},
    "Backend Developer": {"keywords": ["node.js", "express", "django", "flask", "spring boot", "fastapi", "java", "python", "rest api", "graphql", "microservices"], "emoji": "⚙️", "color": "#10b981"},
    "Full Stack Developer": {"keywords": ["react", "node.js", "mongodb", "express", "javascript", "python", "html", "css", "rest api", "docker"], "emoji": "🌐", "color": "#8b5cf6"},
    "Data Scientist": {"keywords": ["machine learning", "deep learning", "python", "tensorflow", "pytorch", "pandas", "numpy", "nlp", "computer vision"], "emoji": "🧬", "color": "#ec4899"},
    "DevOps Engineer": {"keywords": ["docker", "kubernetes", "aws", "azure", "gcp", "jenkins", "ci/cd", "terraform", "ansible", "linux"], "emoji": "🔧", "color": "#06b6d4"},
    "Mobile Developer": {"keywords": ["react native", "flutter", "swift", "kotlin", "android", "ios", "mobile", "dart"], "emoji": "📱", "color": "#14b8a6"},
    "ML Engineer": {"keywords": ["machine learning", "deep learning", "tensorflow", "pytorch", "mlops", "python"], "emoji": "🤖", "color": "#a855f7"},
    "Python Developer": {"keywords": ["python", "django", "flask", "fastapi", "pandas", "numpy", "automation"], "emoji": "🐍", "color": "#22c55e"},
}


def _run_rule_based_fallback(text: str) -> dict:
    """Emergency fallback: rule-based analysis (no API needed)."""
    text_lower = text.lower()
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    word_count = len(text.split())

    # Parse basics
    name = "Unknown"
    for line in lines[:5]:
        if 2 < len(line) < 60 and not re.search(r'[@\d]', line) and re.match(r'^[A-Z]', line):
            name = line
            break

    email_m = re.search(r'[\w.+-]+@[\w-]+\.[\w.]+', text)
    phone_m = re.search(r'(\+?\d[\d\s\-().]{7,}\d)', text)
    linkedin_m = re.search(r'linkedin\.com/in/[\w-]+', text, re.I)
    github_m = re.search(r'github\.com/[\w-]+', text, re.I)

    skills = [s for s in ALL_SKILLS if s.lower() in text_lower]

    # Experience
    exp_years = 0
    for p in [r'(\d+)\+?\s*years?\s*(of)?\s*(experience|exp)', r'(experience|exp)\s*:?\s*(\d+)\+?\s*years?']:
        m = re.search(p, text, re.I)
        if m:
            exp_years = int(m.group(1) if m.group(1).isdigit() else m.group(2))
            break

    # Education
    edu_kw = ['B.Tech', 'B.E.', 'B.Sc', 'M.Tech', 'M.Sc', 'MBA', 'PhD', 'Bachelor', 'Master', 'BCA', 'MCA']
    education = [e for e in edu_kw if e.lower() in text_lower]

    # Sections
    section_kw = ['education', 'experience', 'skills', 'projects', 'certifications', 'summary', 'objective']
    sections = [s for s in section_kw if s in text_lower]

    # ATS Score
    score = 0
    if name != "Unknown": score += 5
    if email_m: score += 5
    if phone_m: score += 3
    if linkedin_m: score += 2
    score += min(len(skills) * 2, 25)
    score += min(exp_years * 4, 20) if exp_years > 0 else 5
    score += 10 if education else 0
    score += min(len([s for s in ['experience', 'skills', 'education', 'summary'] if s in sections]) * 4, 15)
    if 200 <= word_count <= 1500: score += 5
    score = min(score, 100)

    grade = "Excellent" if score >= 80 else "Good" if score >= 60 else "Average" if score >= 40 else "Needs Work"

    # Roles
    roles = []
    for role, config in ROLE_DEFINITIONS.items():
        matched = [k for k in config["keywords"] if k in text_lower]
        if matched:
            confidence = min(int((len(matched) / len(config["keywords"])) * 100), 100)
            if confidence >= 15:
                roles.append({"role": role, "confidence": confidence, "matched_skills": matched,
                             "emoji": config["emoji"], "color": config["color"]})
    roles.sort(key=lambda r: r["confidence"], reverse=True)

    # Jobs
    user_skills_lower = [s.lower() for s in skills]
    jobs = []
    for job in JOB_DATABASE:
        job_skills = [s.lower() for s in job["skills"]]
        matched = [s for s in job_skills if s in user_skills_lower]
        if matched:
            match_score = min(int(len(matched) / len(job_skills) * 100), 100)
            jobs.append({**job, "match_score": match_score, "matched_skills": matched})
    jobs.sort(key=lambda j: j["match_score"], reverse=True)

    return {
        "profile": {
            "name": name, "email": email_m.group(0) if email_m else "",
            "phone": phone_m.group(0).strip() if phone_m else "",
            "linkedin": f"https://{linkedin_m.group(0)}" if linkedin_m else "",
            "github": f"https://{github_m.group(0)}" if github_m else "",
            "location": "", "website": "",
        },
        "skills": skills, "experience_years": exp_years, "education": education,
        "sections": sections, "word_count": word_count,
        "ats": {"score": score, "grade": grade, "breakdown": {}, "suggestions": ["Set GEMINI_API_KEY for full AI analysis"], "missing_keywords": []},
        "roles": roles[:8], "jobs": jobs[:12],
        "coaching": {},
        "engine": "rule-based-fallback",
    }


# ===== MAIN PIPELINE ENTRY POINT =====
def run_full_analysis(text: str) -> dict:
    """Run the full resume analysis pipeline.

    Primary:  Gemini AI Agent (5 specialized agents)
    Fallback: Rule-based engine (if no API key or API failure)
    """
    from app.core.config import settings

    if settings.GEMINI_API_KEY:
        try:
            from app.agents.ai_agent import run_ai_agent_analysis
            return run_ai_agent_analysis(text)
        except Exception as e:
            traceback.print_exc()
            print(f"[Pipeline] AI Agent failed ({e}), falling back to rule-based")
            return _run_rule_based_fallback(text)
    else:
        print("[Pipeline] No GEMINI_API_KEY set — using rule-based fallback")
        return _run_rule_based_fallback(text)
