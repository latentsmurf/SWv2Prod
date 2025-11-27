export interface Asset {
    id: string;
    project_id: string;
    type: 'cast' | 'prop' | 'location' | 'wardrobe' | 'image' | 'video' | 'sfx';
    name: string;
    gcs_path?: string;
    public_url?: string;
    definition?: any;
    created_at?: string;
    // Legacy/UI fields compatibility
    title?: string;
    url?: string;
    tags?: string[];
    embedding?: number[];
}

export interface Shot {
    id: string;
    project_id: string;
    scene_id?: string;
    prompt: string;
    status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed' | 'ready';
    gcs_path?: string;
    proxy_path?: string;
    created_at?: string;
}

export interface Project {
    id: string;
    user_id: string;
    name: string;
    genre?: string;
    status: string;
    created_at: string;
    assets?: Asset[];
}

export interface Comment {
    id: string;
    project_id: string;
    user_id: string; // or 'anonymous' or email
    timestamp: number; // video timestamp in seconds
    content: string;
    drawing_data?: any; // JSON for canvas paths
    is_resolved: boolean;
    created_at: string;
}
