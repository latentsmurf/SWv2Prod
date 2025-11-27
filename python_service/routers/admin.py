from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

from database import get_db
from database import get_db
from models import User, Log, ModerationItem, PricingConfig, AIProviderConfig
from auth import RequireAdmin
from security import encrypt_value, decrypt_value

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[RequireAdmin]
)

@router.get("/health")
async def admin_health_check():
    """
    Simple health check for admin services.
    """
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@router.get("/users", response_model=List[User])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    List all users.
    """
    users = await db.get_collection("users").find().skip(skip).limit(limit).to_list(length=limit)
    return users

@router.post("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Update a user's role.
    """
    if role not in ["user", "admin", "support", "suspended"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    result = await db.get_collection("users").update_one(
        {"_id": user_id},
        {"$set": {"role": role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"status": "success", "message": f"User role updated to {role}"}

@router.post("/users/{user_id}/credits")
async def adjust_user_credits(
    user_id: str,
    amount: int,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Adjust a user's credit balance (add or subtract).
    """
    result = await db.get_collection("users").update_one(
        {"_id": user_id},
        {"$inc": {"credits_balance": amount}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"status": "success", "message": f"Credits adjusted by {amount}"}

@router.get("/projects")
async def list_all_projects(
    skip: int = 0,
    limit: int = 100,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    List all projects across all users.
    """
    projects = await db.get_collection("projects").find().skip(skip).limit(limit).to_list(length=limit)
    return projects

@router.get("/assets")
async def list_all_assets(
    skip: int = 0,
    limit: int = 100,
    type: str = None,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    List all assets across all users.
    """
    query = {}
    if type:
        query["type"] = type
        
    assets = await db.get_collection("assets").find(query).skip(skip).limit(limit).to_list(length=limit)
    return assets

@router.get("/health/services")
async def check_services_health():
    """
    Check health of all external services.
    """
    # Mock checks for now
    services = [
        {"name": "OpenAI", "status": "healthy", "latency": 120},
        {"name": "Replicate", "status": "healthy", "latency": 240},
        {"name": "ElevenLabs", "status": "healthy", "latency": 150},
        {"name": "Google Vertex", "status": "healthy", "latency": 80},
        {"name": "Supabase DB", "status": "healthy", "latency": 45},
        {"name": "GCS Storage", "status": "healthy", "latency": 60},
    ]
    return {"services": services, "timestamp": datetime.utcnow()}

@router.get("/logs", response_model=List[Log])
async def list_logs(
    skip: int = 0,
    limit: int = 100,
    level: str = None,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    query = {}
    if level:
        query["level"] = level
    logs = await db.get_collection("logs").find(query).sort("timestamp", -1).skip(skip).limit(limit).to_list(length=limit)
    return logs

@router.get("/moderation", response_model=List[ModerationItem])
async def list_moderation_queue(
    status: str = "pending",
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    items = await db.get_collection("moderation_queue").find({"status": status}).to_list(length=100)
    return items

@router.post("/moderation/{item_id}/{action}")
async def moderate_item(
    item_id: str,
    action: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    result = await db.get_collection("moderation_queue").update_one(
        {"_id": item_id},
        {"$set": {"status": "approved" if action == "approve" else "rejected"}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
        
    return {"status": "success", "message": f"Item {action}ed"}

@router.get("/pricing", response_model=PricingConfig)
async def get_pricing_config(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    config = await db.get_collection("pricing_config").find_one()
    if not config:
        return PricingConfig()
    return config

@router.post("/pricing")
async def update_pricing_config(
    config: PricingConfig,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    await db.get_collection("pricing_config").replace_one({}, config.dict(by_alias=True), upsert=True)
    return {"status": "success", "message": "Pricing config updated"}

@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    result = await db.get_collection("projects").delete_one({"_id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"status": "success", "message": "Project deleted"}

@router.post("/users/{user_id}/suspend")
async def suspend_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    result = await db.get_collection("users").update_one(
        {"_id": user_id},
        {"$set": {"role": "suspended"}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"status": "success", "message": "User suspended"}

@router.get("/ai", response_model=List[AIProviderConfig])
async def list_ai_configs(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    configs = await db.get_collection("ai_configs").find().to_list(length=100)
    # Decrypt keys for display (or mask them)
    # For security, we'll mask them here, only showing last 4 chars if present
    for config in configs:
        if config.get("api_key"):
            decrypted = decrypt_value(config["api_key"])
            if decrypted:
                config["api_key"] = f"sk-...{decrypted[-4:]}" if len(decrypted) > 4 else "******"
            else:
                config["api_key"] = None
    return configs

@router.post("/ai")
async def update_ai_config(
    config: AIProviderConfig,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Encrypt key before saving if it's provided and not masked
    if config.api_key and not config.api_key.startswith("sk-..."):
        config.api_key = encrypt_value(config.api_key)
    elif config.api_key and config.api_key.startswith("sk-..."):
        # If it's masked, it means the user didn't change it. 
        # We need to fetch the existing one to preserve the real key.
        existing = await db.get_collection("ai_configs").find_one({"provider_id": config.provider_id})
        if existing:
            config.api_key = existing.get("api_key")

    await db.get_collection("ai_configs").replace_one(
        {"provider_id": config.provider_id}, 
        config.dict(by_alias=True), 
        upsert=True
    )
    return {"status": "success", "message": f"Config for {config.provider_id} updated"}
