import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, APIRouter
from fastapi.middleware.cors import CORSMiddleware
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

# Email Settings
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

async def send_support_email(name, email, message):
    if not SMTP_USER or not SMTP_PASSWORD:
        print("Email credentials missing.")
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
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

# We use a router with /api prefix to match vercel.json routePrefix
api_router = APIRouter(prefix="/api")

class AuthRequest(BaseModel):
    code: str

@api_router.post("/contact")
async def contact(
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(...),
    file: UploadFile = File(None)
):
    print(f"Contact request received: {name} <{email}>")
    await send_support_email(name, email, message)
    return {"status": "success", "message": "Request received!"}

@api_router.post("/authenticate")
async def authenticate(request: AuthRequest):
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        print("GITHUB_CLIENT_ID:", GITHUB_CLIENT_ID)
        print("GITHUB_CLIENT_SECRET exists:", bool(GITHUB_CLIENT_SECRET))
        raise HTTPException(status_code=500, detail="GitHub credentials missing on server")

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
        data = response.json()
        if "error" in data:
            raise HTTPException(status_code=400, detail=data.get("error_description", data["error"]))
        return data

# Handle both /api and non-api paths for compatibility
app.include_router(api_router)

# Root check for debugging
@app.get("/health")
async def health():
    return {"status": "ok", "environment": os.getenv("VERCEL_ENV", "local")}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
