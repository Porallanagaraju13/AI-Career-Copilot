"""AI Career Copilot Agent System — Resume Analysis Pipeline"""
import re
import json
from typing import Optional
from dataclasses import dataclass, field


# ===== SKILL DATABASE =====
TECH_SKILLS = {
    "languages": ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Dart", "Perl", "Lua", "Haskell", "Elixir"],
    "frontend": ["React", "Angular", "Vue", "Next.js", "Nuxt.js", "Svelte", "HTML", "CSS", "SASS", "LESS", "Tailwind", "Bootstrap", "jQuery", "Redux", "Zustand", "Material UI", "Chakra UI", "Styled Components"],
    "backend": ["Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", ".NET", "Rails", "Gin", "Fiber", "NestJS", "Koa", "Hono"],
    "database": ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase", "DynamoDB", "Elasticsearch", "SQL Server", "Oracle", "Cassandra", "Neo4j", "SQLite", "MariaDB", "CouchDB", "InfluxDB"],
    "cloud": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Ansible", "CloudFormation", "Pulumi", "Vercel", "Netlify", "Heroku", "DigitalOcean"],
    "devops": ["CI/CD", "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "ArgoCD", "Prometheus", "Grafana", "ELK Stack", "Datadog", "New Relic"],
    "ai_ml": ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy", "OpenCV", "Hugging Face", "LangChain", "LLM", "RAG"],
    "tools": ["Git", "Linux", "Jira", "Confluence", "Figma", "Sketch", "Photoshop", "VS Code", "IntelliJ", "Postman", "Swagger"],
    "concepts": ["REST API", "GraphQL", "Microservices", "Agile", "Scrum", "TDD", "BDD", "SOLID", "Design Patterns", "System Design", "Data Structures", "Algorithms", "DevOps", "SRE", "OAuth", "JWT"],
    "soft": ["Communication", "Leadership", "Problem Solving", "Team Management", "Project Management", "Critical Thinking", "Mentoring", "Collaboration", "Time Management", "Adaptability"]
}

ALL_SKILLS = []
for cat_skills in TECH_SKILLS.values():
    ALL_SKILLS.extend(cat_skills)


# ===== ROLE MAPPING =====
ROLE_DEFINITIONS = {
    "Frontend Developer": {
        "keywords": ["react", "angular", "vue", "next.js", "html", "css", "javascript", "typescript", "tailwind", "bootstrap", "ui/ux", "figma", "sass", "redux", "webpack", "responsive"],
        "emoji": "🎨", "color": "#3b82f6"
    },
    "Backend Developer": {
        "keywords": ["node.js", "express", "django", "flask", "spring boot", "fastapi", "java", "python", "go", "rest api", "graphql", "microservices", "database", "sql", "nosql"],
        "emoji": "⚙️", "color": "#10b981"
    },
    "Full Stack Developer": {
        "keywords": ["react", "node.js", "mongodb", "express", "javascript", "python", "html", "css", "rest api", "docker", "full stack", "mern", "mean"],
        "emoji": "🌐", "color": "#8b5cf6"
    },
    "Data Scientist": {
        "keywords": ["machine learning", "deep learning", "python", "tensorflow", "pytorch", "pandas", "numpy", "statistics", "nlp", "computer vision", "data science", "jupyter"],
        "emoji": "🧬", "color": "#ec4899"
    },
    "Data Analyst": {
        "keywords": ["sql", "excel", "power bi", "tableau", "data analysis", "statistics", "python", "r", "pandas", "visualization", "reporting", "etl"],
        "emoji": "📊", "color": "#f59e0b"
    },
    "DevOps Engineer": {
        "keywords": ["docker", "kubernetes", "aws", "azure", "gcp", "jenkins", "ci/cd", "terraform", "ansible", "linux", "git", "monitoring", "infrastructure"],
        "emoji": "🔧", "color": "#06b6d4"
    },
    "Cloud Architect": {
        "keywords": ["aws", "azure", "gcp", "terraform", "kubernetes", "docker", "microservices", "serverless", "cloud", "architecture", "scalability"],
        "emoji": "☁️", "color": "#6366f1"
    },
    "Mobile Developer": {
        "keywords": ["react native", "flutter", "swift", "kotlin", "android", "ios", "mobile", "dart", "xcode", "android studio"],
        "emoji": "📱", "color": "#14b8a6"
    },
    "ML Engineer": {
        "keywords": ["machine learning", "deep learning", "tensorflow", "pytorch", "mlops", "python", "model deployment", "training", "inference", "gpu"],
        "emoji": "🤖", "color": "#a855f7"
    },
    "Java Developer": {
        "keywords": ["java", "spring boot", "hibernate", "maven", "gradle", "microservices", "rest api", "sql", "jpa", "multithreading"],
        "emoji": "☕", "color": "#ef4444"
    },
    "Python Developer": {
        "keywords": ["python", "django", "flask", "fastapi", "pandas", "numpy", "automation", "scripting", "api", "celery"],
        "emoji": "🐍", "color": "#22c55e"
    },
    "Cybersecurity Analyst": {
        "keywords": ["cybersecurity", "penetration testing", "security", "firewall", "encryption", "siem", "vulnerability", "compliance", "owasp"],
        "emoji": "🛡️", "color": "#dc2626"
    },
    "UI/UX Designer": {
        "keywords": ["figma", "sketch", "photoshop", "illustrator", "ui/ux", "wireframe", "prototype", "user research", "design system", "interaction design"],
        "emoji": "🎭", "color": "#e879f9"
    },
    "Project Manager": {
        "keywords": ["project management", "agile", "scrum", "jira", "confluence", "leadership", "team management", "stakeholder", "roadmap", "sprint"],
        "emoji": "📋", "color": "#0ea5e9"
    },
    "QA Engineer": {
        "keywords": ["testing", "selenium", "automation", "qa", "test cases", "cypress", "playwright", "jest", "quality assurance", "regression"],
        "emoji": "✅", "color": "#84cc16"
    },
    "Blockchain Developer": {
        "keywords": ["blockchain", "solidity", "web3", "ethereum", "smart contracts", "defi", "nft", "crypto", "truffle", "hardhat"],
        "emoji": "⛓️", "color": "#f97316"
    },
}


# ===== RESUME PARSER AGENT =====
@dataclass
class ParsedResume:
    name: str = "Unknown"
    email: str = ""
    phone: str = ""
    linkedin: str = ""
    github: str = ""
    website: str = ""
    location: str = ""
    skills: list = field(default_factory=list)
    experience_years: int = 0
    education: list = field(default_factory=list)
    sections: list = field(default_factory=list)
    projects: str = ""
    raw_text: str = ""
    word_count: int = 0


def parse_resume(text: str) -> ParsedResume:
    """Agent 1: Parse resume text into structured data"""
    result = ParsedResume(raw_text=text, word_count=len(text.split()))
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    # Name (first non-empty line that looks like a name)
    for line in lines[:5]:
        if 2 < len(line) < 60 and not re.search(r'[@\d]', line) and re.match(r'^[A-Z]', line):
            result.name = line
            break

    # Contact info
    email_m = re.search(r'[\w.+-]+@[\w-]+\.[\w.]+', text)
    if email_m:
        result.email = email_m.group(0)

    phone_m = re.search(r'(\+?\d[\d\s\-().]{7,}\d)', text)
    if phone_m:
        result.phone = phone_m.group(0).strip()

    linkedin_m = re.search(r'linkedin\.com/in/[\w-]+', text, re.I)
    if linkedin_m:
        result.linkedin = f"https://{linkedin_m.group(0)}"

    github_m = re.search(r'github\.com/[\w-]+', text, re.I)
    if github_m:
        result.github = f"https://{github_m.group(0)}"

    # Skills detection
    text_lower = text.lower()
    result.skills = [s for s in ALL_SKILLS if s.lower() in text_lower]

    # Experience
    exp_patterns = [
        r'(\d+)\+?\s*years?\s*(of)?\s*(experience|exp)',
        r'(experience|exp)\s*:?\s*(\d+)\+?\s*years?',
    ]
    for p in exp_patterns:
        m = re.search(p, text, re.I)
        if m:
            result.experience_years = int(m.group(1) if m.group(1).isdigit() else m.group(2))
            break
    if not result.experience_years:
        year_matches = re.findall(r'20\d{2}\s*[-–]\s*(20\d{2}|present|current)', text, re.I)
        if year_matches:
            result.experience_years = min(len(year_matches) * 2, 20)

    # Education
    edu_kw = ['B.Tech', 'B.E.', 'B.Sc', 'M.Tech', 'M.Sc', 'MBA', 'PhD', 'Bachelor', 'Master', 'Doctorate',
              'B.A.', 'M.A.', 'BCA', 'MCA', 'B.Com', 'M.Com', 'Diploma', 'Associate']
    result.education = [e for e in edu_kw if e.lower() in text_lower]

    # Sections
    section_kw = ['education', 'experience', 'skills', 'projects', 'certifications', 'achievements',
                  'summary', 'objective', 'work history', 'publications', 'references', 'awards', 'interests']
    result.sections = [s for s in section_kw if s in text_lower]

    # Location
    loc_m = re.search(r'(?:location|address|city)\s*:?\s*([A-Z][a-zA-Z\s,]+)', text)
    if loc_m:
        result.location = loc_m.group(1).strip()[:100]

    return result


# ===== ATS SCORING AGENT =====
@dataclass
class ATSResult:
    score: int = 0
    grade: str = "Needs Work"
    suggestions: list = field(default_factory=list)
    breakdown: dict = field(default_factory=dict)
    missing_keywords: list = field(default_factory=list)


def calculate_ats_score(parsed: ParsedResume) -> ATSResult:
    """Agent 2: Calculate ATS compatibility score"""
    result = ATSResult()
    score = 0

    # Contact (15 pts)
    contact_score = 0
    if parsed.name != "Unknown": contact_score += 5
    else: result.suggestions.append("Add your full name at the top")
    if parsed.email: contact_score += 5
    else: result.suggestions.append("Include a professional email address")
    if parsed.phone: contact_score += 3
    else: result.suggestions.append("Add a phone number")
    if parsed.linkedin: contact_score += 2
    else: result.suggestions.append("Add your LinkedIn profile URL")
    result.breakdown["Contact Info"] = {"score": contact_score, "max": 15}
    score += contact_score

    # Skills (25 pts)
    skill_count = len(parsed.skills)
    skill_score = min(int(skill_count * 2.5), 25)
    if skill_count < 5:
        result.suggestions.append("Add more relevant skills (aim for 8-15 keywords)")
    result.breakdown["Skills"] = {"score": skill_score, "max": 25, "count": skill_count}
    score += skill_score

    # Experience (20 pts)
    exp_score = min(parsed.experience_years * 4, 20) if parsed.experience_years > 0 else 5
    if parsed.experience_years == 0:
        result.suggestions.append("Clearly mention years of experience")
    result.breakdown["Experience"] = {"score": int(exp_score), "max": 20, "years": parsed.experience_years}
    score += exp_score

    # Education (10 pts)
    edu_score = 10 if parsed.education else 0
    if not parsed.education:
        result.suggestions.append("Add your educational qualifications")
    result.breakdown["Education"] = {"score": edu_score, "max": 10}
    score += edu_score

    # Sections (15 pts)
    important = ['experience', 'skills', 'education', 'summary']
    found = [s for s in important if s in parsed.sections]
    section_score = min(len(found) * 4, 15)
    missing = [s for s in important if s not in parsed.sections]
    if missing:
        result.suggestions.append(f"Add missing sections: {', '.join(missing)}")
    result.breakdown["Sections"] = {"score": section_score, "max": 15, "found": parsed.sections}
    score += section_score

    # Format (15 pts)
    fmt_score = 0
    if 200 <= parsed.word_count <= 1500: fmt_score += 5
    elif parsed.word_count < 200: result.suggestions.append("Resume too short — add more details")
    else: result.suggestions.append("Resume too long — aim for 1-2 pages")

    if any(c in parsed.raw_text for c in ['•', '●', '◦', '▪']): fmt_score += 5
    else: result.suggestions.append("Use bullet points for better readability")

    avg_line = len(parsed.raw_text) / max(len(parsed.raw_text.split('\n')), 1)
    if avg_line < 120: fmt_score += 5
    else: result.suggestions.append("Keep lines concise")
    result.breakdown["Format"] = {"score": fmt_score, "max": 15, "words": parsed.word_count}
    score += fmt_score

    result.score = min(score, 100)
    if result.score >= 80: result.grade = "Excellent"
    elif result.score >= 60: result.grade = "Good"
    elif result.score >= 40: result.grade = "Average"

    # Missing keywords
    common_missing = ["REST API", "Agile", "CI/CD", "Git", "Docker", "Cloud"]
    result.missing_keywords = [k for k in common_missing if k.lower() not in parsed.raw_text.lower()]

    return result


# ===== ROLE DETECTION AGENT =====
@dataclass
class DetectedRole:
    role: str = ""
    confidence: int = 0
    matched_skills: list = field(default_factory=list)
    emoji: str = "💼"
    color: str = "#6366f1"


def detect_roles(parsed: ParsedResume) -> list[DetectedRole]:
    """Agent 3: Detect suitable job roles from resume"""
    skills_lower = [s.lower() for s in parsed.skills]
    text_lower = parsed.raw_text.lower()
    results = []

    for role, config in ROLE_DEFINITIONS.items():
        matched = [k for k in config["keywords"] if k in skills_lower or k in text_lower]
        if not matched:
            continue
        confidence = min(int((len(matched) / len(config["keywords"])) * 100), 100)
        if confidence >= 15:
            results.append(DetectedRole(
                role=role, confidence=confidence, matched_skills=matched,
                emoji=config["emoji"], color=config["color"]
            ))

    return sorted(results, key=lambda r: r.confidence, reverse=True)[:8]


# ===== JOB MATCHING AGENT =====
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


def match_jobs(parsed: ParsedResume, roles: list[DetectedRole]) -> list[dict]:
    """Agent 4: Match and rank jobs based on skills and roles"""
    user_skills = [s.lower() for s in parsed.skills]
    role_names = [r.role.lower() for r in roles]

    results = []
    for job in JOB_DATABASE:
        job_skills = [s.lower() for s in job["skills"]]
        matched = [s for s in job_skills if s in user_skills]
        skill_match = (len(matched) / len(job_skills) * 100) if job_skills else 0

        title_lower = job["title"].lower()
        role_boost = 30 if any(r.split()[0] in title_lower for r in role_names) else 0

        match_score = min(int(skill_match * 0.7 + role_boost), 100)
        if match_score >= 15:
            results.append({**job, "match_score": match_score, "matched_skills": matched})

    return sorted(results, key=lambda j: j["match_score"], reverse=True)[:12]


# ===== FULL ANALYSIS PIPELINE =====
def _run_rule_based(text: str) -> dict:
    """Fallback: rule-based analysis (no API key needed)"""
    parsed = parse_resume(text)
    ats = calculate_ats_score(parsed)
    roles = detect_roles(parsed)
    jobs = match_jobs(parsed, roles)

    return {
        "profile": {
            "name": parsed.name, "email": parsed.email, "phone": parsed.phone,
            "linkedin": parsed.linkedin, "github": parsed.github,
            "location": parsed.location
        },
        "skills": parsed.skills,
        "experience_years": parsed.experience_years,
        "education": parsed.education,
        "sections": parsed.sections,
        "word_count": parsed.word_count,
        "ats": {
            "score": ats.score, "grade": ats.grade,
            "suggestions": ats.suggestions, "breakdown": ats.breakdown,
            "missing_keywords": ats.missing_keywords
        },
        "roles": [{"role": r.role, "confidence": r.confidence, "matched_skills": r.matched_skills,
                    "emoji": r.emoji, "color": r.color} for r in roles],
        "jobs": jobs,
        "engine": "rule-based",
    }


def run_full_analysis(text: str) -> dict:
    """Run the AI agent pipeline — LangGraph if API key available, else rule-based."""
    from app.core.config import settings

    if settings.GEMINI_API_KEY or settings.OPENAI_API_KEY:
        try:
            from app.agents.graph import run_langgraph_analysis
            result = run_langgraph_analysis(text)
            result["engine"] = "langgraph"
            return result
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"[Pipeline] LangGraph failed ({e}), falling back to rule-based")
            return _run_rule_based(text)
    else:
        return _run_rule_based(text)
