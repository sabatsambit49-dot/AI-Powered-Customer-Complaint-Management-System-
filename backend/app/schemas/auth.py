from pydantic import BaseModel
from datetime import datetime

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    full_name: str
    role: str

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True
