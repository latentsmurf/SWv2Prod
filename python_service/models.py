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

# --- Scenes Collection ---
class Scene(MongoBaseModel):
    project_id: PyObjectId
    order_index: int
    script_text: str
    linked_assets: List[PyObjectId] = [] # References to Assets

# --- Shots Collection ---
class ShotUrls(BaseModel):
    high_res: Optional[str] = None
    proxy: Optional[str] = None

class ShotPromptData(BaseModel):
    prompt: str
    seed: Optional[int] = None

class Shot(MongoBaseModel):
    scene_id: PyObjectId
    project_id: PyObjectId
    status: str = "queued" # queued, processing, done
    urls: ShotUrls = Field(default_factory=ShotUrls)
    prompt_data: ShotPromptData

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
