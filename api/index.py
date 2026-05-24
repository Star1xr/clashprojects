import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Relaxed CORS for production flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

GITLAB_CLIENT_ID = os.getenv("GITLAB_CLIENT_ID")
GITLAB_CLIENT_SECRET = os.getenv("GITLAB_CLIENT_SECRET")
GITLAB_REDIRECT_URI = os.getenv("GITLAB_REDIRECT_URI") # e.g. http://localhost:8000/api/auth/gitlab/callback
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Email Settings
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

async def send_support_email(name, email, message):
    if not SMTP_USER or not SMTP_PASSWORD:
        return False
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = "star1xx77ff@gmail.com"
        msg['Subject'] = f"New Support Request from {name}"
        msg.attach(MIMEText(f"User Name: {name}\nUser Email: {email}\n\nMessage:\n{message}", 'plain'))
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception:
        return False

class AuthRequest(BaseModel):
    code: str

# DUAL ROUTING: Handles both /api and direct hits
@app.post("/contact")
@app.post("/api/contact")
async def contact(
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(...),
    file: UploadFile = File(None)
):
    await send_support_email(name, email, message)
    return {"status": "success", "message": "Request received!"}

@app.post("/authenticate")
@app.post("/api/authenticate")
async def authenticate(request: AuthRequest):
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="GitHub credentials missing")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": request.code,
            },
        )
        return response.json()

# GitLab OAuth Routes
@app.get("/auth/gitlab/login")
@app.get("/api/auth/gitlab/login")
async def gitlab_login():
    if not GITLAB_CLIENT_ID or not GITLAB_REDIRECT_URI:
        raise HTTPException(status_code=500, detail="GitLab configuration missing")
    
    # scope: read_user (profile), api (repos/commits)
    url = f"https://gitlab.com/oauth/authorize?client_id={GITLAB_CLIENT_ID}&redirect_uri={GITLAB_REDIRECT_URI}&response_type=code&scope=read_user+api"
    return RedirectResponse(url)

@app.get("/auth/gitlab/callback")
@app.get("/api/auth/gitlab/callback")
async def gitlab_callback(code: str):
    if not GITLAB_CLIENT_ID or not GITLAB_CLIENT_SECRET or not GITLAB_REDIRECT_URI:
        raise HTTPException(status_code=500, detail="GitLab credentials missing")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://gitlab.com/oauth/token",
            data={
                "client_id": GITLAB_CLIENT_ID,
                "client_secret": GITLAB_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": GITLAB_REDIRECT_URI,
            },
        )
        data = response.json()
        
        if "access_token" not in data:
            return RedirectResponse(f"{FRONTEND_URL}/?error=gitlab_auth_failed")
            
        access_token = data["access_token"]
        # Redirect back to frontend with token and provider
        return RedirectResponse(f"{FRONTEND_URL}/?token={access_token}&provider=gitlab")

# Star Count Proxy: Uses Server-Side credentials to avoid rate limits
@app.get("/stars")
@app.get("/api/stars")
async def get_stars():
    async with httpx.AsyncClient() as client:
        # Use Basic Auth with Client ID and Secret to get 5000 requests/hour
        auth = None
        if GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET:
            auth = (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)
        
        response = await client.get(
            "https://api.github.com/repos/Star1xr/clashprojects",
            auth=auth
        )
        if response.status_code == 200:
            return {"stargazers_count": response.json().get("stargazers_count", 0)}
        else:
            return {"stargazers_count": "--", "error": response.text}

@app.get("/")
@app.get("/health")
@app.get("/api/health")
async def health():
    return {"status": "alive"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
