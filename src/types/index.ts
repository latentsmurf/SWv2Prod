export interface Asset {
    id: string;
    project_id: string;
    type: 'cast' | 'prop' | 'location' | 'wardrobe' | 'image' | 'video' | 'sfx';
    name: string;
    gcs_path?: string;
    public_url?: string;
    definition?: AssetDefinition;
    created_at?: string;
    // Legacy/UI fields compatibility
    title?: string;
    url?: string;
    tags?: string[];
    embedding?: number[];
}

export interface AssetDefinition {
    // Cast-specific
    age?: string;
    gender?: string;
    ethnicity?: string;
    archetype?: string;
    vibe?: string;
    role?: string;
    // Wardrobe-specific
    era?: string;
    formality?: string;
    weather?: string;
    color?: string;
    // Location-specific
    interior_exterior?: 'interior' | 'exterior';
    time_of_day?: string;
    environment_type?: string;
    mood?: string;
    // Prop-specific
    category?: string;
    // Generic
    description?: string;
    [key: string]: any;
}

// Coverage Presets for Shot Breakdown
export type CoveragePresetType = 'minimal' | 'standard' | 'heavy' | 'commercial' | 'documentary';

export interface CoveragePreset {
    id: CoveragePresetType;
    name: string;
    description: string;
    shotCount: { min: number; max: number };
    shotTypes: ShotType[];
    icon: string;
}

export type ShotType = 
    | 'wide' 
    | 'establishing' 
    | 'master' 
    | 'medium' 
    | 'medium_close_up' 
    | 'close_up' 
    | 'extreme_close_up'
    | 'over_the_shoulder'
    | 'two_shot'
    | 'insert'
    | 'cutaway'
    | 'pov'
    | 'drone'
    | 'tracking'
    | 'dolly'
    | 'handheld';

export interface Shot {
    id: string;
    project_id: string;
    scene_id?: string;
    prompt: string;
    status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed' | 'ready';
    gcs_path?: string;
    proxy_path?: string;
    created_at?: string;
    // Enhanced shot metadata
    shot_type?: ShotType;
    shot_number?: number;
    description?: string;
    duration?: number; // in seconds
    notes?: string;
    camera_movement?: string;
    lens?: string;
    // Linked assets for this specific shot
    linked_cast_ids?: string[];
    linked_prop_ids?: string[];
}

// Scene - First-class object between Project and Shots
export interface Scene {
    id: string;
    project_id: string;
    order_index: number;
    slug_line: string; // e.g., "INT. KITCHEN - DAY"
    script_text: string;
    synopsis?: string;
    // Linked production assets
    linked_cast_ids: string[];
    linked_location_id?: string;
    linked_wardrobe_ids: string[]; // Map of cast_id -> wardrobe_id
    linked_prop_ids: string[];
    // Coverage settings
    coverage_preset?: CoveragePresetType;
    // Visual style
    style_mode?: 'storyboard' | 'cinematic';
    style_preset_id?: string;
    // Metadata
    estimated_duration?: number; // in seconds
    page_count?: number;
    characters?: string[]; // Character names detected from script
    created_at?: string;
    updated_at?: string;
}

// Scene with populated assets for UI
export interface SceneWithAssets extends Scene {
    location?: Asset;
    cast: Asset[];
    wardrobe: Asset[];
    props: Asset[];
    shots: Shot[];
}

export interface Project {
    id: string;
    user_id: string;
    name: string;
    genre?: string;
    status: string;
    created_at: string;
    assets?: Asset[];
    scenes?: Scene[];
    // Project-level style settings
    style_preset_id?: string;
    global_style_mode?: 'storyboard' | 'cinematic';
}

export interface Comment {
    id: string;
    project_id: string;
    shot_id?: string; // Optional reference to specific shot
    user_id: string; // or 'anonymous' or email
    timestamp: number; // video timestamp in seconds
    content: string;
    drawing_data?: any; // JSON for canvas paths
    is_resolved: boolean;
    created_at: string;
}

// Storyboard types
export interface StoryboardPanel {
    shot: Shot;
    scene: Scene;
    image_url?: string;
    duration: number;
}

export interface StoryboardExportOptions {
    format: 'pdf' | 'png_strip' | 'pitch_deck';
    includeNotes: boolean;
    includeDialogue: boolean;
    panelsPerRow: number;
    paperSize: 'letter' | 'a4' | 'tabloid';
}

// Batch Generation
export interface BatchGenerationRequest {
    scene_ids?: string[];
    shot_ids?: string[];
    style_mode: 'storyboard' | 'cinematic';
    style_preset_id?: string;
}

export interface BatchGenerationProgress {
    total: number;
    completed: number;
    failed: number;
    current_shot_id?: string;
    status: 'idle' | 'running' | 'completed' | 'failed';
}
