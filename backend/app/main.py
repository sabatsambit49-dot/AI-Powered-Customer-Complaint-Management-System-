from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.router import api_router
from app.models.complaint import Complaint, ChatMessage
from app.models.user import User
from app.services.seed import seed_demo_users

# Create database tables automatically
Base.metadata.create_all(bind=engine)
seed_demo_users()

app = FastAPI(
    title="AI-Powered Customer Complaint Management System",
    description="Pharma Quality Assurance (API & FDF) Complaint Intake & AI Triage Assistant",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "message": "Pharma QMS Customer Complaint API running",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
