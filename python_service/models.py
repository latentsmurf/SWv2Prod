from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, BeforeValidator
from typing_extensions import Annotated
from datetime import datetime
import bson

# Helper for ObjectId mapping
PyObjectId = Annotated[str, BeforeValidator(str)]

class MongoBaseModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {bson.ObjectId: str}

# --- Users Collection ---
class User(MongoBaseModel):
    email: str
    role: str = "user" # user, admin, support
    credits_balance: int = 0

# --- Projects Collection ---
class ProjectSettings(BaseModel):
    style_preset_id: Optional[str] = None
    global_prompt: Optional[str] = None

class Project(MongoBaseModel):
    owner_id: PyObjectId
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    settings: ProjectSettings = Field(default_factory=ProjectSettings)
    timeline: List[Dict[str, Any]] = [] # Stores DesignRE editor JSON state
    script_content: Optional[Dict[str, Any]] = None # Stores Tiptap JSON content

# --- Assets Collection ---
class Asset(MongoBaseModel):
    project_id: PyObjectId
    type: str # 'cast', 'prop', 'location'
    gcs_path: str
    public_url: Optional[str] = None
    definition: Dict[str, Any] = {} # Flexible JSON storage

# --- Coverage Presets ---
class CoveragePreset(BaseModel):
    id: str  # minimal, standard, heavy, commercial, documentary
    name: str
    description: str
    shot_count_min: int
    shot_count_max: int
    shot_types: List[str]

# --- Scenes Collection (Enhanced) ---
class Scene(MongoBaseModel):
    project_id: PyObjectId
    order_index: int
    slug_line: str = ""  # e.g., "INT. KITCHEN - DAY"
    script_text: str
    synopsis: Optional[str] = None
    # Linked production assets
    linked_cast_ids: List[PyObjectId] = []
    linked_location_id: Optional[PyObjectId] = None
    linked_wardrobe_ids: List[PyObjectId] = []
    linked_prop_ids: List[PyObjectId] = []
    # Coverage settings
    coverage_preset: str = "standard"  # minimal, standard, heavy, commercial, documentary
    # Visual style
    style_mode: str = "storyboard"  # storyboard, cinematic
    style_preset_id: Optional[str] = None
    # Metadata
    estimated_duration: Optional[int] = None  # in seconds
    page_count: Optional[float] = None
    characters: List[str] = []  # Character names detected from script
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    # Legacy field for backwards compatibility
    linked_assets: List[PyObjectId] = []

# --- Shots Collection (Enhanced) ---
class ShotUrls(BaseModel):
    high_res: Optional[str] = None
    proxy: Optional[str] = None

class ShotPromptData(BaseModel):
    prompt: str
    seed: Optional[int] = None

class Shot(MongoBaseModel):
    scene_id: PyObjectId
    project_id: PyObjectId
    status: str = "queued"  # pending, queued, processing, completed, failed, ready
    urls: ShotUrls = Field(default_factory=ShotUrls)
    prompt_data: ShotPromptData
    # Enhanced shot metadata
    shot_type: str = "medium"  # wide, establishing, master, medium, close_up, etc.
    shot_number: int = 0
    description: Optional[str] = None
    duration: float = 3.0  # in seconds
    notes: Optional[str] = None
    camera_movement: Optional[str] = None
    lens: Optional[str] = None
    # Linked assets for this specific shot
    linked_cast_ids: List[PyObjectId] = []
    linked_prop_ids: List[PyObjectId] = []
    # GCS paths (for backwards compatibility)
    gcs_path: Optional[str] = None
    proxy_path: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Batch Generation Job ---
class BatchGenerationJob(MongoBaseModel):
    project_id: PyObjectId
    shot_ids: List[PyObjectId] = []
    total: int = 0
    completed: int = 0
    failed: int = 0
    current_shot_id: Optional[PyObjectId] = None
    status: str = "idle"  # idle, running, completed, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# --- Reference Vault ---
class ReferenceImage(MongoBaseModel):
    tags: List[str] = []
    meta: Dict[str, Any] = {}
    embedding: List[float] # 1536 dimensions

# --- System Logs ---
class Log(MongoBaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    level: str # info, warning, error
    service: str
    message: str
    meta: Dict[str, Any] = {}

# --- Moderation Queue ---
class ModerationItem(MongoBaseModel):
    user_id: str
    type: str # image, prompt, text
    content: str # text content or URL
    reason: str
    status: str = "pending" # pending, approved, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Pricing Configuration ---
class PricingAction(BaseModel):
    action: str
    cost: int
    unit: str

class CreditPack(BaseModel):
    name: str
    credits: int
    price: float

class PricingConfig(MongoBaseModel):
    actions: List[PricingAction] = []
    packs: List[CreditPack] = []
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# --- AI Provider Configuration ---
class AIProviderConfig(MongoBaseModel):
    provider_id: str # openai, replicate, etc.
    api_key: Optional[str] = None # Encrypted
    enabled_models: List[str] = []
    is_active: bool = True
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# --- Comments Collection (for Review) ---
class DrawingPoint(BaseModel):
    x: float
    y: float

class DrawingStroke(BaseModel):
    points: List[DrawingPoint]
    color: str = "#ff0000"
    width: float = 2.0

class Comment(MongoBaseModel):
    project_id: PyObjectId
    shot_id: Optional[PyObjectId] = None
    content: str
    timestamp: float = 0.0  # Video timestamp in seconds
    is_resolved: bool = False
    drawing_data: Optional[List[DrawingStroke]] = None  # Canvas drawing annotations
    author_id: Optional[PyObjectId] = None
    author_name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# --- Request/Response Models for Comments ---
class CommentCreate(BaseModel):
    project_id: str
    shot_id: Optional[str] = None
    content: str
    timestamp: float = 0.0
    drawing_data: Optional[List[Dict[str, Any]]] = None

class CommentUpdate(BaseModel):
    content: Optional[str] = None
    is_resolved: Optional[bool] = None
    drawing_data: Optional[List[Dict[str, Any]]] = None

# --- Episodes Collection (for Micro Drama Series) ---
class Episode(MongoBaseModel):
    project_id: PyObjectId
    episode_number: int
    title: str
    synopsis: Optional[str] = None
    scene_ids: List[PyObjectId] = []  # Scenes in this episode
    duration: Optional[float] = None  # in seconds
    status: str = "draft"  # draft, in_production, rendered, published
    cliffhanger_note: Optional[str] = None  # Note about episode ending hook
    hook_note: Optional[str] = None  # Note about opening hook
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class EpisodeCreate(BaseModel):
    project_id: str
    episode_number: int
    title: str
    synopsis: Optional[str] = None
    scene_ids: List[str] = []

class EpisodeUpdate(BaseModel):
    title: Optional[str] = None
    synopsis: Optional[str] = None
    scene_ids: Optional[List[str]] = None
    status: Optional[str] = None
    cliffhanger_note: Optional[str] = None
    hook_note: Optional[str] = None
