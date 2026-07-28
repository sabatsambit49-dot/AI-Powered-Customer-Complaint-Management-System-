from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password

def seed_demo_users():
    """Seed initial demo employee accounts for portfolio submission."""
    db: Session = SessionLocal()
    try:
        demo_accounts = [
            {
                "username": "qa_reviewer",
                "password": "pharma_demo_reviewer_123",
                "full_name": "Elena Rostova",
                "role": "QA Lead Reviewer"
            },
            {
                "username": "qa_manager",
                "password": "pharma_demo_manager_123",
                "full_name": "Marcus Vance",
                "role": "QA Systems Manager"
            }
        ]

        for acc in demo_accounts:
            existing = db.query(User).filter(User.username == acc["username"]).first()
            if not existing:
                user = User(
                    username=acc["username"],
                    hashed_password=hash_password(acc["password"]),
                    full_name=acc["full_name"],
                    role=acc["role"]
                )
                db.add(user)
        db.commit()
    except Exception as e:
        print(f"Error seeding demo users: {e}")
        db.rollback()
    finally:
        db.close()
