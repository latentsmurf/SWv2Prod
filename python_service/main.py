import os
import json
import uuid
import shutil
import base64
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Request, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import stripe
from motor.motor_asyncio import AsyncIOMotorDatabase

# Stripe Config
stripe.api_key = os.getenv("STRIPE_API_KEY")
endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

# Import Auth and Database
from auth import get_current_user, RequireAuth
from database import get_db, get_vector_search_pipeline
from StorageManager import StorageManager
from SceneWeaverClient import SceneWeaverClient
from VideoProcessor import VideoProcessor

app = FastAPI()

# Import Routers
from routers import admin, users
from routers.scenes import router as scenes_router, batch_router
from routers.exports import router as exports_router

app.include_router(admin.router)
app.include_router(users.router)
app.include_router(scenes_router)
app.include_router(batch_router)
app.include_router(exports_router)

# Initialize Services
storage_manager = StorageManager()
nano_client = SceneWeaverClient() # Assuming this was used too
video_processor = VideoProcessor()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class GenerateShotRequest(BaseModel):
    scene_id: str
    user_prompt: str
    aspect_ratio: str = "16:9"
    linked_asset_ids: List[str] = []

class GenerateAssetRequest(BaseModel):
    project_id: str
    type: str # 'cast', 'prop', 'location', 'wardrobe'
    prompt: str
    name: str
    definition: dict = {}

class TimelineClip(BaseModel):
    shot_id: str
    duration: float
    prompt: str
class ExportRequest(BaseModel):
    project_id: str
    editor_state: Dict[str, Any] # Assumed Saboteur Editor JSON structure

class RepairShotRequest(BaseModel):
    shot_id: str
    mask_base64: str
    prompt: str

class GenerateSFXRequest(BaseModel):
    prompt: str

class GhostwriteRequest(BaseModel):
    selected_text: str
    instruction: str
    context: str = ""

class BreakdownRequest(BaseModel):
    project_id: str
    scene_text: str

class LipSyncRequest(BaseModel):
    video_asset_id: str
    audio_asset_id: str
    project_id: str

@app.post("/api/process/lipsync")
async def process_lipsync(
    request: LipSyncRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if not storage_manager:
        raise HTTPException(status_code=503, detail="Services not fully configured")

    try:
        # 1. Fetch Assets
        video_data = await db.get_collection("assets").find_one({"id": request.video_asset_id})
        audio_data = await db.get_collection("assets").find_one({"id": request.audio_asset_id})
        
        if not video_data:
            # Try fetching from shots
            video_data = await db.get_collection("shots").find_one({"id": request.video_asset_id})
            
        if not video_data:
             raise HTTPException(status_code=404, detail="Video asset not found")
             
        video_gcs_path = video_data.get("gcs_path")

        if not audio_data:
             # Try fetching from shots? Or just fail?
             # Assuming audio is an asset for now.
             raise HTTPException(status_code=404, detail="Audio asset not found")
        
        audio_gcs_path = audio_data.get("gcs_path")

        # 2. Download Files
        os.makedirs("temp_process", exist_ok=True)
        local_video_path = f"temp_process/{request.video_asset_id}.mp4"
        local_audio_path = f"temp_process/{request.audio_asset_id}.mp3" # Assuming mp3
        
        storage_manager.download_file(video_gcs_path, local_video_path)
        storage_manager.download_file(audio_gcs_path, local_audio_path)

        # 3. Process LipSync
        synced_path = nano_client.sync_lips(local_video_path, local_audio_path)

        # 4. Upload Result
        result_uuid = str(uuid.uuid4())
        result_gcs_path = f"assets/synced/{result_uuid}.mp4"
        
        with open(synced_path, "rb") as f:
            storage_manager.upload_file(f, result_gcs_path)
            
        # 5. Create New Asset Record (as a Shot)
        new_shot_data = {
            "id": str(uuid.uuid4()),
            "project_id": request.project_id,
            "scene_id": video_data.get("scene_id"),
            "prompt": f"LipSync: {video_data.get('prompt', 'Unknown')}",
            "gcs_path": result_gcs_path,
            "proxy_path": result_gcs_path,
            "status": "ready",
            "created_at": datetime.utcnow()
        }
        
        await db.get_collection("shots").insert_one(new_shot_data)
        
        # Remove _id for response
        new_shot_data.pop("_id", None)

        # 6. Cleanup
        if os.path.exists(local_video_path): os.remove(local_video_path)
        if os.path.exists(local_audio_path): os.remove(local_audio_path)
        if os.path.exists(synced_path): os.remove(synced_path)

        return {"status": "success", "asset": new_shot_data}

    except Exception as e:
        print(f"Error in process_lipsync: {e}")
        raise HTTPException(status_code=500, detail=str(e))
async def generate_asset(
    request: GenerateAssetRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if not storage_manager:
        raise HTTPException(status_code=503, detail="Services not fully configured")

    try:
        # 1. Generate Asset (Image) locally
        local_asset_path = nano_client.generate_asset(
            type=request.type,
            prompt=request.prompt
        )

        # 2. Upload to GCS
        asset_uuid = str(uuid.uuid4())
        gcs_path = f"assets/{request.type}/{asset_uuid}.jpg"
        
        with open(local_asset_path, "rb") as f:
            storage_manager.upload_file(f, gcs_path)
            
        # 3. Generate Signed URL
        public_url = storage_manager.generate_signed_url(gcs_path)

        # 4. Insert into Assets table
        asset_data = {
            "id": str(uuid.uuid4()),
            "project_id": request.project_id,
            "type": request.type,
            "name": request.name,
            "gcs_path": gcs_path,
            "public_url": public_url,
            "definition": request.definition,
            "created_at": datetime.utcnow()
        }
        
        await db.get_collection("assets").insert_one(asset_data)
        
        # Remove _id
        asset_data.pop("_id", None)

        # 5. Cleanup
        if os.path.exists(local_asset_path):
            os.remove(local_asset_path)

        return {"status": "success", "data": [asset_data]}

    except Exception as e:
        print(f"Error in generate_asset: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/export/resolve")
async def export_resolve(
    request: ExportRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if not storage_manager:
        raise HTTPException(status_code=503, detail="Storage service not configured")

    export_id = str(uuid.uuid4())
    export_dir = f"exports/{export_id}"
    media_dir = f"{export_dir}/media"
    os.makedirs(media_dir, exist_ok=True)

    try:
        # 1. Process Clips from Editor State
        fcpxml_clips = []
        
        # Assumed Structure: { "tracks": [ { "id": "...", "clips": [ { ... } ] } ] }
        tracks = request.editor_state.get("tracks", [])
        
        processed_clips_map = {} # Map clip_id to resource_id
        
        for track_index, track in enumerate(tracks):
            clips = track.get("clips", [])
            for clip in clips:
                clip_id = clip.get("id")
                shot_id = clip.get("metadata", {}).get("shot_id")
                source_url = clip.get("source")
                
                # Determine GCS path
                gcs_path = None
                if shot_id:
                     shot_data = await db.get_collection("shots").find_one({"id": shot_id})
                     if shot_data:
                         gcs_path = shot_data.get("gcs_path")
                
                if not gcs_path:
                    print(f"Could not resolve high-res for clip {clip_id}, skipping download.")
                    continue

                filename = f"clip_{clip_id}.mp4"
                local_raw_path = f"{media_dir}/raw_{filename}"
                local_conformed_path = f"{media_dir}/{filename}"

                # Download
                storage_manager.download_file(gcs_path, local_raw_path)

                # Conform
                if os.path.exists(local_raw_path):
                     if os.path.getsize(local_raw_path) > 1024:
                         video_processor.conform_framerate(local_raw_path, local_conformed_path)
                     else:
                         shutil.copy(local_raw_path, local_conformed_path)
                
                # Remove raw
                if os.path.exists(local_raw_path):
                    os.remove(local_raw_path)

                # Register Resource
                resource_id = f"r{len(fcpxml_clips) + 1}"
                duration_seconds = clip.get("duration", 0)
                duration_frames = int(duration_seconds * 24)
                
                fcpxml_clips.append({
                    "id": resource_id,
                    "name": filename,
                    "path": f"./media/{filename}",
                    "duration": duration_seconds,
                    "duration_frames": duration_frames,
                    "track_index": track_index,
                    "start": clip.get("start", 0),
                    "offset": clip.get("offset", 0)
                })
                
                processed_clips_map[clip_id] = resource_id

        # 2. Generate FCPXML
        # Group by track
        tracks_data = {}
        for c in fcpxml_clips:
            t_idx = c["track_index"]
            if t_idx not in tracks_data:
                tracks_data[t_idx] = []
            tracks_data[t_idx].append(c)
            
        # Sort clips by start time
        for t_idx in tracks_data:
            tracks_data[t_idx].sort(key=lambda x: x["start"])

        # Build Resources XML
        resources_xml = ""
        for c in fcpxml_clips:
            resources_xml += f'<asset id="{c["id"]}" name="{c["name"]}" uid="{uuid.uuid4()}" src="file://localhost/{c["path"]}" start="0s" duration="{c["duration"]}s" hasVideo="1" format="r1" />\n'

        # Build Sequence XML
        # Assuming Track 0 is the spine.
        spine_xml = ""
        
        current_time = 0
        if 0 in tracks_data:
            for c in tracks_data[0]:
                gap_duration = c["start"] - current_time
                if gap_duration > 0.01: # Tolerance
                    gap_frames = int(gap_duration * 24)
                    spine_xml += f'<gap name="Gap" offset="{current_time}s" duration="{gap_duration}s" start="0s"/>\n'
                
                spine_xml += f'<asset-clip name="{c["name"]}" ref="{c["id"]}" offset="{c["start"]}s" duration="{c["duration"]}s" start="{c["offset"]}s" />\n'
                current_time = c["start"] + c["duration"]

        fcpxml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
    <resources>
        <format id="r1" name="FFVideoFormat1080p2398" frameDuration="1001/24000s" width="1920" height="1080" colorSpace="1-1-1 (Rec. 709)"/>
        {resources_xml}
    </resources>
    <library>
        <event name="SceneWeaver Export">
            <project name="Export_{export_id}">
                <sequence format="r1">
                    <spine>
                        {spine_xml}
                    </spine>
                </sequence>
            </project>
        </event>
    </library>
</fcpxml>
"""
        with open(f"{export_dir}/project.fcpxml", "w") as f:
            f.write(fcpxml_content)

        # 3. Zip
        shutil.make_archive(export_dir, 'zip', export_dir)
        zip_path = f"{export_dir}.zip"
        
        # 4. Upload Zip to GCS
        gcs_zip_path = f"exports/{export_id}.zip"
        with open(zip_path, "rb") as f:
            storage_manager.upload_file(f, gcs_zip_path)
            
        download_url = storage_manager.generate_signed_url(gcs_zip_path)

        # Cleanup
        shutil.rmtree(export_dir)
        if os.path.exists(zip_path):
            os.remove(zip_path)

        return {"status": "success", "download_url": download_url}

    except Exception as e:
        print(f"Error in export_resolve: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/repair/shot")
async def repair_shot(
    request: RepairShotRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if not storage_manager:
        raise HTTPException(status_code=503, detail="Services not fully configured")

    try:
        # 1. Fetch Shot
        shot = await db.get_collection("shots").find_one({"id": request.shot_id})
        if not shot:
            raise HTTPException(status_code=404, detail="Shot not found")

        # 2. Download Original Shot
        original_gcs_path = shot["gcs_path"]
        local_original_path = f"temp_shots/{request.shot_id}_original.mp4"
        os.makedirs("temp_shots", exist_ok=True)
        storage_manager.download_file(original_gcs_path, local_original_path)

        # 3. Save Mask
        mask_data = base64.b64decode(request.mask_base64.split(',')[1])
        local_mask_path = f"temp_shots/{request.shot_id}_mask.png"
        with open(local_mask_path, "wb") as f:
            f.write(mask_data)

        # 4. In-paint
        local_repaired_path = nano_client.inpaint_shot(local_original_path, local_mask_path, request.prompt)

        # 5. Create Proxy
        local_proxy_path = local_repaired_path.replace(".mp4", "_proxy.mp4")
        video_processor.create_proxy(local_repaired_path, local_proxy_path)

        # 6. Upload (Overwrite or New Version? Let's overwrite for "Repair")
        # In a real system, we might want versioning.
        storage_manager.upload_file(open(local_repaired_path, "rb"), original_gcs_path)
        storage_manager.upload_file(open(local_proxy_path, "rb"), shot["proxy_path"])

        # 7. Cleanup
        os.remove(local_original_path)
        os.remove(local_mask_path)
        os.remove(local_repaired_path)
        os.remove(local_proxy_path)

        return {"status": "success", "message": "Shot repaired successfully"}

    except Exception as e:
        print(f"Error in repair_shot: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate/sfx")
async def generate_sfx(request: GenerateSFXRequest): # We need user context here, ideally via auth token or project_id
    # For prototype, we'll assume a default user or pass a user_id in request. 
    # Let's update the request model to include user_id for now, or just skip credit check for SFX if user_id is missing.
    # But to be consistent, let's assume we pass a project_id or user_id.
    # I'll skip credit check for SFX in this step to avoid breaking the previous signature without updating frontend, 
    # OR I can update the frontend to pass user_id. 
    # Let's assume we trust the user for SFX for now or add a TODO.
    # actually, let's just add a mock check if we had user_id.
    
    if not storage_manager:
        raise HTTPException(status_code=503, detail="Storage service not configured")
    
    # Mock Credit Check (Cost: 2) - skipped as we don't have user_id in request yet
    
    try:
        # 1. Generate SFX locally
        local_sfx_path = nano_client.generate_sfx(request.prompt)

        # 2. Upload to GCS
        sfx_uuid = str(uuid.uuid4())
        gcs_path = f"sfx/{sfx_uuid}.mp3"
        
        with open(local_sfx_path, "rb") as f:
            storage_manager.upload_file(f, gcs_path)
            
        # 3. Generate Signed URL
        public_url = storage_manager.generate_signed_url(gcs_path)

        # 4. Cleanup
        if os.path.exists(local_sfx_path):
            os.remove(local_sfx_path)

        return {"status": "success", "url": public_url, "name": request.prompt}

    except Exception as e:
        print(f"Error in generate_sfx: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/script/ghostwrite")
async def ghostwrite(request: GhostwriteRequest):
    try:
        # Mock Credit Check (Cost: 1)
        # In real app: check and deduct credits
        
        generated_text = nano_client.generate_text(request.selected_text, request.instruction, request.context)
        return {"status": "success", "text": generated_text}

    except Exception as e:
        print(f"Error in ghostwrite: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/script/breakdown")
async def breakdown_scene(
    request: BreakdownRequest,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        # 1. Breakdown Scene via AI
        shots_data = nano_client.breakdown_scene(request.scene_text)
        
        # 2. Create Scene Record
        # Extract title from first line
        title = request.scene_text.split('\n')[0][:50]
        
        new_scene = Scene(
            id=str(uuid.uuid4()),
            project_id=request.project_id,
            order_index=0, # Needs logic to determine order
            script_text=request.scene_text
        )
        
        await db.get_collection("scenes").insert_one(new_scene.model_dump(by_alias=True))
        scene_id = new_scene.id

        # 3. Insert Shots
        shots_to_insert = []
        for shot in shots_data:
            new_shot = Shot(
                id=str(uuid.uuid4()),
                scene_id=scene_id,
                project_id=request.project_id,
                status="queued",
                prompt_data=ShotPromptData(prompt=shot["prompt"])
            )
            shots_to_insert.append(new_shot.model_dump(by_alias=True))
            
        if shots_to_insert:
            await db.get_collection("shots").insert_many(shots_to_insert)

        return {"status": "success", "shot_count": len(shots_to_insert), "scene_id": scene_id}

    except Exception as e:
        print(f"Error in breakdown_scene: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/script/import-pdf")
async def import_pdf(file: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily
        filename = f"upload_{uuid.uuid4()}.pdf"
        file_path = os.path.abspath(os.path.join("temp_assets", filename))
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Parse PDF
        json_content = nano_client.parse_pdf_script(file_path)
        
        # Cleanup
        os.remove(file_path)
        
        return {"status": "success", "content": json_content}

    except Exception as e:
        print(f"Error in import_pdf: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, endpoint_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        client_reference_id = session.get('client_reference_id') # Should be user_id
        amount_total = session.get('amount_total') # e.g. 1000 cents = $10

        if client_reference_id:
            # Calculate credits (e.g. 1 cent = 1 credit, or $10 = 100 credits)
            # Let's say $10 (1000 cents) = 100 credits. So credits = amount_total / 10
            credits_to_add = int(amount_total / 10)
            
            # Update Profile
            # We need to fetch current balance first or use an RPC call to increment
            # MongoDB $inc operator is perfect for this
            result = await db.get_collection("profiles").update_one(
                {"id": client_reference_id},
                {"$inc": {"credits_balance": credits_to_add}}
            )
            
            if result.matched_count > 0:
                print(f"Added {credits_to_add} credits to user {client_reference_id}")
            else:
                print(f"User {client_reference_id} not found for credit update")

    return {"status": "success"}

# ... (Previous endpoints)

# --- CRUD Endpoints for Frontend Migration ---

@app.get("/api/projects")
async def get_projects(
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    projects = await db.get_collection("projects").find({"user_id": user.id}).to_list(length=100)
    return projects

class ProjectCreateRequest(BaseModel):
    name: str
    genre: str
    style_preset_id: Optional[str] = None
    status: str = "pre-production"

@app.post("/api/projects")
async def create_project(
    project: ProjectCreateRequest,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    new_project = Project(
        id=str(uuid.uuid4()),
        user_id=user.id,
        name=project.name,
        genre=project.genre,
        style_preset_id=project.style_preset_id,
        status=project.status,
        created_at=datetime.utcnow()
    )
    
    await db.get_collection("projects").insert_one(new_project.model_dump(by_alias=True))
    return new_project

@app.get("/api/style_presets")
async def get_style_presets(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # For prototype, return mock presets if collection is empty
    presets = await db.get_collection("style_presets").find().to_list(length=100)
    if not presets:
        return [
            {"id": "1", "name": "The Anderson", "thumbnail_url": "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80&w=300&h=200", "description": "Symmetrical, pastel, quirky"},
            {"id": "2", "name": "The Kubrick", "thumbnail_url": "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=300&h=200", "description": "One-point perspective, cold, intense"},
            {"id": "3", "name": "The Nolan", "thumbnail_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=300&h=200", "description": "Gritty, realistic, practical"},
        ]
    return presets

class StylePresetCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    prompt_injection: str
    parameter_overrides: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_public: bool = False

@app.post("/api/style_presets")
async def create_style_preset(
    preset: StylePresetCreateRequest,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    new_preset = {
        "id": str(uuid.uuid4()),
        "user_id": user.id,
        "name": preset.name,
        "description": preset.description,
        "prompt_injection": preset.prompt_injection,
        "parameter_overrides": preset.parameter_overrides,
        "thumbnail_url": preset.thumbnail_url,
        "is_public": preset.is_public,
        "created_at": datetime.utcnow()
    }
    
    await db.get_collection("style_presets").insert_one(new_preset)
    # Remove _id before returning
    new_preset.pop("_id", None)
    return new_preset

@app.get("/api/projects/{project_id}")
async def get_project(
    project_id: str,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    project = await db.get_collection("projects").find_one({"_id": project_id, "user_id": user.id})
    if not project:
        # Try searching by 'id' string field if _id lookup fails (legacy support)
        project = await db.get_collection("projects").find_one({"id": project_id, "user_id": user.id})
        
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

class ProjectUpdateRequest(BaseModel):
    name: Optional[str] = None
    genre: Optional[str] = None
    status: Optional[str] = None
    script_content: Optional[Dict[str, Any]] = None
    timeline: Optional[List[Dict[str, Any]]] = None

@app.put("/api/projects/{project_id}")
async def update_project(
    project_id: str,
    update_data: ProjectUpdateRequest,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Filter out None values
    update_fields = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_fields:
        return {"status": "no_changes"}

    result = await db.get_collection("projects").update_one(
        {"$or": [{"_id": project_id}, {"id": project_id}], "user_id": user.id},
        {"$set": update_fields}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
        
    return {"status": "success"}


@app.get("/api/projects/{project_id}/shots")
async def get_project_shots(
    project_id: str,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Verify project access
    project = await db.get_collection("projects").find_one({"_id": project_id, "user_id": user.id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    shots = await db.get_collection("shots").find({"project_id": project_id}).to_list(length=1000)
    return shots

@app.get("/api/projects/{project_id}/assets")
async def get_project_assets(
    project_id: str,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Verify project access
    project = await db.get_collection("projects").find_one({"_id": project_id, "user_id": user.id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    assets = await db.get_collection("assets").find({"project_id": project_id}).to_list(length=1000)
    return assets

@app.delete("/api/projects/{project_id}/assets/{asset_id}")
async def delete_asset(
    project_id: str,
    asset_id: str,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Verify project access
    project = await db.get_collection("projects").find_one({"_id": project_id, "user_id": user.id})
    if not project:
        # Try searching by 'id' string field if _id lookup fails
        project = await db.get_collection("projects").find_one({"id": project_id, "user_id": user.id})
        
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Find the asset
    asset = await db.get_collection("assets").find_one({"id": asset_id, "project_id": project_id})
    if not asset:
        # Try searching by _id if id lookup fails
        try:
            from bson import ObjectId
            asset = await db.get_collection("assets").find_one({"_id": ObjectId(asset_id), "project_id": project_id})
        except:
            pass
            
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Delete from GCS if path exists
    # Note: We need to import storage_manager here or ensure it's available globally
    # It is available globally in main.py
    if asset.get("gcs_path") and storage_manager:
        try:
            storage_manager.delete_file(asset["gcs_path"])
        except Exception as e:
            print(f"Warning: Failed to delete file from GCS: {e}")

    # Delete from Database
    await db.get_collection("assets").delete_one({"_id": asset["_id"]})

    return {"status": "success", "message": "Asset deleted successfully"}

@app.get("/api/projects/{project_id}/scenes")
async def get_project_scenes(
    project_id: str,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Verify project access
    project = await db.get_collection("projects").find_one({"_id": project_id, "user_id": user.id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    scenes = await db.get_collection("scenes").find({"project_id": project_id}).sort("order_index", 1).to_list(length=100)
    return scenes

# Comments for ReviewPlayer
class CommentRequest(BaseModel):
    project_id: str
    shot_id: Optional[str] = None
    content: str
    timestamp: float = 0.0
    is_resolved: bool = False

class VaultSearchRequest(BaseModel):
    query: str
    limit: int = 20

@app.post("/api/vault/search")
async def search_vault(
    request: VaultSearchRequest,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Mock response for now, integrating with Unsplash or internal DB later
    # We can return the same mock data structure as the frontend expects
    
    mock_results = [
        {
            "id": "1",
            "url": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800",
            "title": "Cinematic Dark Alley",
            "tags": ["Noir", "Dark", "Urban"],
            "score": 0.95
        },
        {
            "id": "2",
            "url": "https://images.unsplash.com/photo-1515462277126-2dd0c162007a?auto=format&fit=crop&q=80&w=800",
            "title": "Neon City Street",
            "tags": ["Cyberpunk", "Neon", "Night"],
            "score": 0.92
        },
        {
            "id": "3",
            "url": "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=800",
            "title": "Moody Landscape",
            "tags": ["Nature", "Moody", "Fog"],
            "score": 0.88
        },
        {
            "id": "4",
            "url": "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=800",
            "title": "Sci-Fi Corridor",
            "tags": ["Sci-Fi", "Interior", "Futuristic"],
            "score": 0.85
        }
    ]
    
    # Filter based on query if needed (mock)
    if "cyber" in request.query.lower():
         mock_results = [r for r in mock_results if "Cyberpunk" in r["tags"]]
         
    return {"status": "success", "results": mock_results}

    drawing_data: Optional[List[Any]] = None

@app.get("/api/comments")
async def get_comments(
    project_id: str,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Verify project access
    project = await db.get_collection("projects").find_one({"_id": project_id, "user_id": user.id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    comments = await db.get_collection("comments").find({"project_id": project_id}).sort("created_at", -1).to_list(length=500)
    return comments

@app.post("/api/comments")
async def create_comment(
    comment: CommentRequest,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Verify project access
    project = await db.get_collection("projects").find_one({"_id": comment.project_id, "user_id": user.id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    new_comment = {
        "id": str(uuid.uuid4()),
        "project_id": comment.project_id,
        "shot_id": comment.shot_id,
        "user_id": user.id,
        "user_email": user.email,
        "content": comment.content,
        "timestamp": comment.timestamp,
        "is_resolved": comment.is_resolved,
        "drawing_data": comment.drawing_data,
        "created_at": datetime.utcnow().isoformat()
    }
    
    await db.get_collection("comments").insert_one(new_comment)
    return {"status": "success", "comment": new_comment}

@app.put("/api/comments/{comment_id}")
async def update_comment(
    comment_id: str,
    update_data: Dict[str, Any],
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Check comment ownership or project ownership
    comment = await db.get_collection("comments").find_one({"id": comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    if comment["user_id"] != user.id:
        # Check if project owner? For now strict ownership
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")
        
    await db.get_collection("comments").update_one({"id": comment_id}, {"$set": update_data})
    return {"status": "success"}

@app.get("/health")
def health_check():
    return {"status": "ok"}


# --- New MongoDB Endpoints ---

class SearchRequest(BaseModel):
    query: str
    limit: int = 20

@app.post("/api/vault/search")
async def search_vault(
    request: SearchRequest, 
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Semantic search using Atlas Vector Search.
    """
    try:
        # 1. Generate Embedding for Query
        # In a real app, use OpenAI or Vertex AI. 
        # For prototype, we'll generate a random vector or use a mock function from NanoBananaClient if it had one.
        # Let's assume NanoBananaClient has a method or we mock it here.
        # Mocking embedding:
        import random
        query_embedding = [random.random() for _ in range(1536)] 
        
        # 2. Build Pipeline
        pipeline = get_vector_search_pipeline(query_embedding, limit=request.limit)
        
        # 3. Execute Aggregation
        collection = db.get_collection("reference_images")
        results = await collection.aggregate(pipeline).to_list(length=request.limit)
        
        # 4. Format Results
        formatted_results = []
        for doc in results:
            formatted_results.append({
                "id": str(doc["_id"]),
                "score": doc.get("score", 0),
                "tags": doc.get("tags", []),
                "url": doc.get("meta", {}).get("url"),
                "title": doc.get("meta", {}).get("title", "Untitled")
            })
            
        return {"status": "success", "results": formatted_results}

    except Exception as e:
        print(f"Error in search_vault: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class ExportRequest(BaseModel):
    project_id: str
    editor_state: Dict[str, Any]

@app.post("/api/export/resolve")
async def resolve_export(
    request: ExportRequest,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        print(f"Exporting project {request.project_id}")
        
        # Extract clips from editor state
        # Assuming simple structure for now: tracks -> clips
        clips = []
        if "tracks" in request.editor_state:
            for track in request.editor_state["tracks"]:
                if "clips" in track:
                    for clip in track["clips"]:
                        # In a real app, we'd resolve the source ID to a file path
                        # Here we assume 'source' is the path (as set in EditorBridge)
                        if "source" in clip:
                            clips.append({
                                "path": clip["source"],
                                "start": clip.get("start", 0),
                                "duration": clip.get("duration", 0)
                            })
        
        if not clips:
            raise HTTPException(status_code=400, detail="No clips found in timeline")
            
        # Generate output filename
        filename = f"export_{uuid.uuid4()}.mp4"
        output_path = os.path.abspath(os.path.join("temp_shots", filename))
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Render
        video_processor.render_timeline(clips, output_path)
        
        # In a real app, we'd upload this to S3/GCS and return a signed URL
        # For now, we return a file:// URL or just the path for local testing
        # Or serve it via a static mount (which we haven't set up, but let's assume we can)
        
        return {
            "status": "success",
            "download_url": f"file://{output_path}",
            "local_path": output_path
        }

    except Exception as e:
        print(f"Error in resolve_export: {e}")
        raise HTTPException(status_code=500, detail=str(e))

