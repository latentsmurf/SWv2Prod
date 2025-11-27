import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests
from database import get_db
from models import User
from motor.motor_asyncio import AsyncIOMotorDatabase

# Security Scheme
security = HTTPBearer()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> User:
    """
    Verifies the Google ID Token and returns the User object.
    Syncs the user to MongoDB if they don't exist.
    """
    token = credentials.credentials
    
    try:
        # Verify the token
        id_info = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        
        # Extract info
        google_sub = id_info.get("sub")
        email = id_info.get("email")
        
        if not google_sub or not email:
            raise ValueError("Invalid token payload")
            
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Sync User Logic
    users_collection = db.get_collection("users")
    
    # Check if user exists
    user_doc = await users_collection.find_one({"_id": google_sub})
    
    if not user_doc:
        # Create new user
        new_user = User(id=google_sub, email=email, credits_balance=10) # 10 free credits
        await users_collection.insert_one(new_user.model_dump(by_alias=True))
        return new_user
    
    return User(**user_doc)

# Alias for easy use in endpoints
RequireAuth = Depends(get_current_user)

def get_admin_user(user: User = RequireAuth) -> User:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return user

RequireAdmin = Depends(get_admin_user)
