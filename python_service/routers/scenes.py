"""
Scene and Shot management routes for SceneWeaver.
Includes scene CRUD, shot breakdown, and batch generation.
"""

import uuid
import asyncio
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth import get_current_user, RequireAuth
from database import get_db
from models import Scene, Shot, ShotPromptData, BatchGenerationJob, User

router = APIRouter(prefix="/api/projects/{project_id}", tags=["scenes"])

# --- Coverage Presets Configuration ---
COVERAGE_PRESETS = {
    "minimal": {
        "id": "minimal",
        "name": "Minimal",
        "description": "Quick coverage with essential shots only",
        "shot_count": (3, 5),
        "shot_types": ["wide", "medium", "close_up"]
    },
    "standard": {
        "id": "standard",
        "name": "Standard",
        "description": "Classic film coverage with master, mediums, and close-ups",
        "shot_count": (5, 8),
        "shot_types": ["establishing", "master", "medium", "close_up", "over_the_shoulder", "two_shot"]
    },
    "heavy": {
        "id": "heavy",
        "name": "Heavy",
        "description": "Comprehensive coverage with multiple angles and inserts",
        "shot_count": (8, 15),
        "shot_types": ["establishing", "master", "medium", "medium_close_up", "close_up", 
                      "extreme_close_up", "over_the_shoulder", "two_shot", "insert", "cutaway"]
    },
    "commercial": {
        "id": "commercial",
        "name": "Commercial",
        "description": "Fast-paced coverage optimized for ads",
        "shot_count": (10, 20),
        "shot_types": ["wide", "medium", "close_up", "extreme_close_up", "insert", "cutaway", "tracking", "dolly"]
    },
    "documentary": {
        "id": "documentary",
        "name": "Documentary",
        "description": "Observational style with handheld feel",
        "shot_count": (6, 12),
        "shot_types": ["wide", "medium", "close_up", "handheld", "tracking", "cutaway"]
    }
}

SHOT_TYPE_PROMPTS = {
    "wide": "Wide shot showing the entire scene and environment",
    "establishing": "Establishing shot setting up the location and context",
    "master": "Master shot covering the entire action",
    "medium": "Medium shot framing subject from waist up",
    "medium_close_up": "Medium close-up framing subject from chest up",
    "close_up": "Close-up focusing on face or specific detail",
    "extreme_close_up": "Extreme close-up with very tight framing",
    "over_the_shoulder": "Over-the-shoulder shot from behind one character",
    "two_shot": "Two shot framing two characters together",
    "insert": "Insert shot of an object or detail",
    "cutaway": "Cutaway shot of something outside the main action",
    "pov": "Point of view shot showing what a character sees",
    "drone": "Drone/aerial shot from high angle",
    "tracking": "Tracking shot moving alongside subject",
    "dolly": "Dolly shot moving toward or away from subject",
    "handheld": "Handheld shot with natural, documentary-style movement"
}


# --- Request/Response Models ---
class SceneCreateRequest(BaseModel):
    slug_line: str = ""
    script_text: str
    synopsis: Optional[str] = None
    order_index: Optional[int] = None
    linked_cast_ids: List[str] = []
    linked_location_id: Optional[str] = None
    linked_wardrobe_ids: List[str] = []
    linked_prop_ids: List[str] = []
    coverage_preset: str = "standard"
    style_mode: str = "storyboard"
    style_preset_id: Optional[str] = None
    characters: List[str] = []


class SceneUpdateRequest(BaseModel):
    slug_line: Optional[str] = None
    script_text: Optional[str] = None
    synopsis: Optional[str] = None
    order_index: Optional[int] = None
    linked_cast_ids: Optional[List[str]] = None
    linked_location_id: Optional[str] = None
    linked_wardrobe_ids: Optional[List[str]] = None
    linked_prop_ids: Optional[List[str]] = None
    coverage_preset: Optional[str] = None
    style_mode: Optional[str] = None
    style_preset_id: Optional[str] = None
    characters: Optional[List[str]] = None


class ShotCreateRequest(BaseModel):
    prompt: str
    shot_type: str = "medium"
    shot_number: int = 0
    description: Optional[str] = None
    duration: float = 3.0
    notes: Optional[str] = None
    camera_movement: Optional[str] = None
    linked_cast_ids: List[str] = []
    linked_prop_ids: List[str] = []


class BatchGenerateRequest(BaseModel):
    shot_ids: List[str] = []
    scene_ids: List[str] = []
    style_mode: str = "storyboard"
    style_preset_id: Optional[str] = None


class BreakdownRequest(BaseModel):
    scene_text: str
    coverage_preset: str = "standard"
    linked_cast_ids: List[str] = []
    linked_location_id: Optional[str] = None
    style_mode: str = "storyboard"


# --- Scene Endpoints ---
@router.get("/scenes")
async def get_scenes(
    project_id: str,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all scenes for a project"""
    # Verify project access
    project = await db.get_collection("projects").find_one({
        "$or": [{"_id": project_id}, {"id": project_id}],
        "user_id": user.id
    })
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    scenes = await db.get_collection("scenes").find(
        {"project_id": project_id}
    ).sort("order_index", 1).to_list(length=100)
    
    # Convert _id to id for frontend compatibility
    for scene in scenes:
        scene["id"] = str(scene.pop("_id", scene.get("id")))
    
    return scenes


@router.post("/scenes")
async def create_scene(
    project_id: str,
    request: SceneCreateRequest,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new scene"""
    # Verify project access
    project = await db.get_collection("projects").find_one({
        "$or": [{"_id": project_id}, {"id": project_id}],
        "user_id": user.id
    })
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get next order_index if not provided
    order_index = request.order_index
    if order_index is None:
        last_scene = await db.get_collection("scenes").find_one(
            {"project_id": project_id},
            sort=[("order_index", -1)]
        )
        order_index = (last_scene.get("order_index", 0) + 1) if last_scene else 0
    
    # Extract slug_line from script_text if not provided
    slug_line = request.slug_line
    if not slug_line and request.script_text:
        first_line = request.script_text.strip().split('\n')[0]
        if first_line.upper().startswith(('INT.', 'EXT.', 'INT/EXT')):
            slug_line = first_line
    
    scene_data = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "order_index": order_index,
        "slug_line": slug_line,
        "script_text": request.script_text,
        "synopsis": request.synopsis,
        "linked_cast_ids": request.linked_cast_ids,
        "linked_location_id": request.linked_location_id,
        "linked_wardrobe_ids": request.linked_wardrobe_ids,
        "linked_prop_ids": request.linked_prop_ids,
        "coverage_preset": request.coverage_preset,
        "style_mode": request.style_mode,
        "style_preset_id": request.style_preset_id,
        "characters": request.characters,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.get_collection("scenes").insert_one(scene_data)
    scene_data.pop("_id", None)
    
    return scene_data


@router.get("/scenes/{scene_id}")
async def get_scene(
    project_id: str,
    scene_id: str,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get a single scene"""
    scene = await db.get_collection("scenes").find_one({
        "$or": [{"_id": scene_id}, {"id": scene_id}],
        "project_id": project_id
    })
    
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    scene["id"] = str(scene.pop("_id", scene.get("id")))
    return scene


@router.put("/scenes/{scene_id}")
async def update_scene(
    project_id: str,
    scene_id: str,
    request: SceneUpdateRequest,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update a scene"""
    # Build update dict, excluding None values
    update_data = {k: v for k, v in request.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    if not update_data:
        return {"status": "no_changes"}
    
    result = await db.get_collection("scenes").update_one(
        {"$or": [{"_id": scene_id}, {"id": scene_id}], "project_id": project_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # Return updated scene
    scene = await db.get_collection("scenes").find_one({
        "$or": [{"_id": scene_id}, {"id": scene_id}],
        "project_id": project_id
    })
    scene["id"] = str(scene.pop("_id", scene.get("id")))
    
    return scene


@router.delete("/scenes/{scene_id}")
async def delete_scene(
    project_id: str,
    scene_id: str,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete a scene and its shots"""
    # Delete associated shots
    await db.get_collection("shots").delete_many({"scene_id": scene_id})
    
    # Delete scene
    result = await db.get_collection("scenes").delete_one({
        "$or": [{"_id": scene_id}, {"id": scene_id}],
        "project_id": project_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    return {"status": "success"}


# --- Shot Endpoints ---
@router.get("/scenes/{scene_id}/shots")
async def get_scene_shots(
    project_id: str,
    scene_id: str,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all shots for a scene"""
    shots = await db.get_collection("shots").find({
        "scene_id": scene_id,
        "project_id": project_id
    }).sort("shot_number", 1).to_list(length=500)
    
    for shot in shots:
        shot["id"] = str(shot.pop("_id", shot.get("id")))
        # Normalize status for frontend
        if shot.get("status") == "done":
            shot["status"] = "completed"
        # Add prompt from prompt_data if missing
        if "prompt" not in shot and "prompt_data" in shot:
            shot["prompt"] = shot["prompt_data"].get("prompt", "")
    
    return shots


@router.post("/scenes/{scene_id}/shots")
async def create_shot(
    project_id: str,
    scene_id: str,
    request: ShotCreateRequest,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new shot"""
    shot_data = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "scene_id": scene_id,
        "status": "pending",
        "prompt_data": {"prompt": request.prompt},
        "prompt": request.prompt,
        "shot_type": request.shot_type,
        "shot_number": request.shot_number,
        "description": request.description,
        "duration": request.duration,
        "notes": request.notes,
        "camera_movement": request.camera_movement,
        "linked_cast_ids": request.linked_cast_ids,
        "linked_prop_ids": request.linked_prop_ids,
        "created_at": datetime.utcnow()
    }
    
    await db.get_collection("shots").insert_one(shot_data)
    shot_data.pop("_id", None)
    
    return shot_data


# --- Enhanced Shot Breakdown ---
@router.post("/scenes/{scene_id}/breakdown")
async def breakdown_scene(
    project_id: str,
    scene_id: str,
    request: BreakdownRequest,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Generate shot breakdown for a scene using coverage presets"""
    
    # Get coverage preset configuration
    preset = COVERAGE_PRESETS.get(request.coverage_preset, COVERAGE_PRESETS["standard"])
    min_shots, max_shots = preset["shot_count"]
    shot_types = preset["shot_types"]
    
    # Get scene if it exists
    scene = await db.get_collection("scenes").find_one({
        "$or": [{"_id": scene_id}, {"id": scene_id}],
        "project_id": project_id
    })
    
    # If scene doesn't exist, create it
    if not scene:
        scene = {
            "id": scene_id,
            "project_id": project_id,
            "order_index": 0,
            "slug_line": request.scene_text.split('\n')[0][:50] if request.scene_text else "",
            "script_text": request.scene_text,
            "linked_cast_ids": request.linked_cast_ids,
            "linked_location_id": request.linked_location_id,
            "coverage_preset": request.coverage_preset,
            "style_mode": request.style_mode,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.get_collection("scenes").insert_one(scene)
    
    # Fetch linked assets for prompt building
    cast_assets = []
    if request.linked_cast_ids:
        cast_assets = await db.get_collection("assets").find({
            "id": {"$in": request.linked_cast_ids}
        }).to_list(length=20)
    
    location_asset = None
    if request.linked_location_id:
        location_asset = await db.get_collection("assets").find_one({
            "id": request.linked_location_id
        })
    
    # Generate shots based on coverage preset
    shots_to_insert = []
    
    # Determine number of shots based on scene length
    scene_length = len(request.scene_text) if request.scene_text else 100
    num_shots = min(max_shots, max(min_shots, scene_length // 200))
    
    # Select shot types for this breakdown
    selected_types = shot_types[:num_shots] if len(shot_types) >= num_shots else (
        shot_types * (num_shots // len(shot_types) + 1)
    )[:num_shots]
    
    # Style modifier
    style_modifier = "storyboard style, line art, grayscale, pencil sketch" if request.style_mode == "storyboard" else "cinematic, photorealistic, dramatic lighting, film grain, 35mm"
    
    for i, shot_type in enumerate(selected_types):
        # Build prompt
        prompt_parts = [SHOT_TYPE_PROMPTS.get(shot_type, "Medium shot")]
        
        # Add location context
        if location_asset:
            loc_desc = location_asset.get("definition", {}).get("description") or location_asset.get("name", "")
            prompt_parts.append(f"Location: {loc_desc}")
        
        # Add cast context (first few cast members)
        if cast_assets:
            cast_desc = ", ".join([c.get("name", "") for c in cast_assets[:2]])
            prompt_parts.append(f"Characters: {cast_desc}")
        
        # Add scene context
        if request.scene_text:
            # Extract relevant snippet
            snippet = request.scene_text[:200].replace('\n', ' ')
            prompt_parts.append(f"Scene: {snippet}...")
        
        # Add style
        prompt_parts.append(style_modifier)
        
        prompt = ". ".join(prompt_parts)
        
        shot_data = {
            "id": str(uuid.uuid4()),
            "project_id": project_id,
            "scene_id": scene_id,
            "status": "pending",
            "prompt_data": {"prompt": prompt},
            "prompt": prompt,
            "shot_type": shot_type,
            "shot_number": i + 1,
            "description": SHOT_TYPE_PROMPTS.get(shot_type, ""),
            "duration": 3.0,
            "linked_cast_ids": request.linked_cast_ids,
            "created_at": datetime.utcnow()
        }
        shots_to_insert.append(shot_data)
    
    # Delete existing shots for this scene (regenerating)
    await db.get_collection("shots").delete_many({
        "scene_id": scene_id,
        "project_id": project_id
    })
    
    # Insert new shots
    if shots_to_insert:
        await db.get_collection("shots").insert_many(shots_to_insert)
    
    # Clean up for response
    for shot in shots_to_insert:
        shot.pop("_id", None)
    
    return {
        "status": "success",
        "scene_id": scene_id,
        "shot_count": len(shots_to_insert),
        "shots": shots_to_insert
    }


# --- Batch Generation ---
@router.get("/batch-progress")
async def get_batch_progress(
    project_id: str,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get batch generation progress for a project"""
    job = await db.get_collection("batch_jobs").find_one({
        "project_id": project_id
    }, sort=[("created_at", -1)])
    
    if not job:
        return {
            "total": 0,
            "completed": 0,
            "failed": 0,
            "status": "idle"
        }
    
    return {
        "total": job.get("total", 0),
        "completed": job.get("completed", 0),
        "failed": job.get("failed", 0),
        "current_shot_id": job.get("current_shot_id"),
        "status": job.get("status", "idle")
    }


# Separate router for non-project-scoped endpoints
batch_router = APIRouter(prefix="/api/generate", tags=["generation"])

@batch_router.post("/batch")
async def start_batch_generation(
    request: BatchGenerateRequest,
    background_tasks: BackgroundTasks,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Start batch generation for multiple shots"""
    
    project_id = request.scene_ids[0].split("_")[0] if request.scene_ids else None
    
    # Get shots to process
    shot_ids = request.shot_ids
    
    if request.scene_ids and not shot_ids:
        # Get all pending shots from specified scenes
        shots = await db.get_collection("shots").find({
            "scene_id": {"$in": request.scene_ids},
            "status": {"$in": ["pending", "failed"]}
        }).to_list(length=500)
        shot_ids = [s.get("id") or str(s.get("_id")) for s in shots]
    
    if not shot_ids:
        raise HTTPException(status_code=400, detail="No shots to generate")
    
    # Infer project_id from first shot if not available
    if not project_id:
        first_shot = await db.get_collection("shots").find_one({"id": shot_ids[0]})
        project_id = first_shot.get("project_id") if first_shot else None
    
    # Create batch job record
    job_data = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "shot_ids": shot_ids,
        "total": len(shot_ids),
        "completed": 0,
        "failed": 0,
        "status": "running",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.get_collection("batch_jobs").insert_one(job_data)
    
    # Start background processing
    background_tasks.add_task(
        process_batch_generation,
        job_data["id"],
        shot_ids,
        request.style_mode,
        request.style_preset_id
    )
    
    return {
        "status": "started",
        "job_id": job_data["id"],
        "total": len(shot_ids)
    }


async def process_batch_generation(
    job_id: str,
    shot_ids: List[str],
    style_mode: str,
    style_preset_id: Optional[str]
):
    """Background task to process batch generation"""
    from database import get_db_sync
    from SceneWeaverClient import SceneWeaverClient
    from StorageManager import StorageManager
    
    db = get_db_sync()
    client = SceneWeaverClient()
    storage = StorageManager()
    
    completed = 0
    failed = 0
    
    for shot_id in shot_ids:
        try:
            # Update current shot
            await db.get_collection("batch_jobs").update_one(
                {"id": job_id},
                {"$set": {"current_shot_id": shot_id, "updated_at": datetime.utcnow()}}
            )
            
            # Get shot
            shot = await db.get_collection("shots").find_one({"id": shot_id})
            if not shot:
                failed += 1
                continue
            
            # Update shot status
            await db.get_collection("shots").update_one(
                {"id": shot_id},
                {"$set": {"status": "processing"}}
            )
            
            # Generate image
            prompt = shot.get("prompt") or shot.get("prompt_data", {}).get("prompt", "")
            
            try:
                local_path = client.generate_storyboard(prompt, style_mode)
                
                # Upload to GCS
                gcs_path = f"shots/{shot.get('project_id')}/{shot_id}.jpg"
                with open(local_path, "rb") as f:
                    storage.upload_file(f, gcs_path)
                
                public_url = storage.generate_signed_url(gcs_path)
                
                # Update shot
                await db.get_collection("shots").update_one(
                    {"id": shot_id},
                    {"$set": {
                        "status": "completed",
                        "gcs_path": gcs_path,
                        "proxy_path": public_url,
                        "urls": {"high_res": gcs_path, "proxy": public_url}
                    }}
                )
                
                completed += 1
                
            except Exception as e:
                print(f"Error generating shot {shot_id}: {e}")
                await db.get_collection("shots").update_one(
                    {"id": shot_id},
                    {"$set": {"status": "failed"}}
                )
                failed += 1
            
            # Update job progress
            await db.get_collection("batch_jobs").update_one(
                {"id": job_id},
                {"$set": {
                    "completed": completed,
                    "failed": failed,
                    "updated_at": datetime.utcnow()
                }}
            )
            
            # Small delay to avoid rate limiting
            await asyncio.sleep(1)
            
        except Exception as e:
            print(f"Error processing shot {shot_id}: {e}")
            failed += 1
    
    # Mark job as complete
    final_status = "completed" if failed == 0 else ("failed" if completed == 0 else "completed")
    await db.get_collection("batch_jobs").update_one(
        {"id": job_id},
        {"$set": {
            "status": final_status,
            "completed": completed,
            "failed": failed,
            "current_shot_id": None,
            "updated_at": datetime.utcnow()
        }}
    )
