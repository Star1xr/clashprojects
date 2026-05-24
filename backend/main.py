import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://clashprojects.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

# Email Settings
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")  # Your email (star1xx77ff@gmail.com)
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")  # Your App Password

async def send_support_email(name, email, message):
    if not SMTP_USER or not SMTP_PASSWORD:
        print("Email credentials missing - skipping email send.")
        return False
        
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = "star1xx77ff@gmail.com"
        msg['Subject'] = f"New Support Request from {name}"
        
        body = f"User Name: {name}\nUser Email: {email}\n\nMessage:\n{message}"
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

class AuthRequest(BaseModel):
    code: str

@app.post("/contact")
async def contact(
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(...),
    file: UploadFile = File(None)
):
    print(f"--- NEW SUPPORT REQUEST ---")
    print(f"Name: {name}")
    print(f"Email: {email}")
    print(f"Message: {message}")
    
    # Send Email Notification
    await send_support_email(name, email, message)
    
    if file:
        print(f"Attachment: {file.filename}")
        try:
            os.makedirs("support_requests", exist_ok=True)
            file_path = os.path.join("support_requests", file.filename)
            with open(file_path, "wb") as buffer:
                buffer.write(await file.read())
        except Exception as e:
            print(f"Could not save file locally: {e}")
            
    print(f"---------------------------")
    return {"status": "success", "message": "Request received!"}

@app.post("/authenticate")
async def authenticate(request: AuthRequest):
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="GitHub credentials not configured on server")

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
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to reach GitHub")
            
        data = response.json()
        
        if "error" in data:
            raise HTTPException(status_code=400, detail=data.get("error_description", data["error"]))
            
        return data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
