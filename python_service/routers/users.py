from fastapi import APIRouter, Depends
from models import User
from auth import RequireAuth

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

@router.get("/me", response_model=User)
async def get_current_user_profile(user: User = RequireAuth):
    """
    Get the current logged-in user's profile.
    """
    return user
