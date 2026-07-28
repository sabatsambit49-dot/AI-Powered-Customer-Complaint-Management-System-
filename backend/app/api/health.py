from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Pharma QMS Customer Complaint Management API",
        "version": "1.0.0"
    }
