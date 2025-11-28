import { NextResponse } from "next/server";

// Mock presets for development - always available
const MOCK_PRESETS = [
    // ==========================================
    // MICRO DRAMA / VERTICAL SERIES PRESETS (9:16)
    // ==========================================
    { 
        id: 'micro-romantic-glow', 
        name: 'Romantic Glow',
        category: 'micro-drama',
        aspect_ratio: '9:16',
        thumbnail_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=200&h=356',
        description: 'Soft lighting, warm tones, dreamy bokeh - perfect for romance verticals',
        pacing: 'dramatic-pauses',
        avg_shot_duration: 2.5
    },
    { 
        id: 'micro-tension-dark', 
        name: 'Tension Dark',
        category: 'micro-drama',
        aspect_ratio: '9:16',
        thumbnail_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=200&h=356',
        description: 'High contrast shadows, dramatic angles for thriller & revenge',
        pacing: 'quick-reveals',
        avg_shot_duration: 1.8
    },
    { 
        id: 'micro-ceo-luxury', 
        name: 'CEO Luxury',
        category: 'micro-drama',
        aspect_ratio: '9:16',
        thumbnail_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200&h=356',
        description: 'Sleek, glamorous, gold accents for billionaire & CEO romance',
        pacing: 'slow-burn',
        avg_shot_duration: 3.0
    },
    { 
        id: 'micro-supernatural', 
        name: 'Supernatural Glow',
        category: 'micro-drama',
        aspect_ratio: '9:16',
        thumbnail_url: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?auto=format&fit=crop&q=80&w=200&h=356',
        description: 'Mystical blue tones, ethereal lighting for fantasy & werewolf',
        pacing: 'suspenseful',
        avg_shot_duration: 2.0
    },
    { 
        id: 'micro-urban-drama', 
        name: 'Urban Drama',
        category: 'micro-drama',
        aspect_ratio: '9:16',
        thumbnail_url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=200&h=356',
        description: 'Gritty city vibes, moody contrast for mafia & street drama',
        pacing: 'fast-cuts',
        avg_shot_duration: 1.5
    },
    { 
        id: 'micro-golden-hour', 
        name: 'Golden Hour Romance',
        category: 'micro-drama',
        aspect_ratio: '9:16',
        thumbnail_url: 'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=200&h=356',
        description: 'Warm golden sunlight, soft focus for emotional moments',
        pacing: 'emotional-beats',
        avg_shot_duration: 2.8
    },

    // ==========================================
    // TRADITIONAL CINEMATIC PRESETS (16:9)
    // ==========================================
    { 
        id: 'cinematic-teal', 
        name: 'Cinematic Teal',
        category: 'film',
        aspect_ratio: '16:9',
        thumbnail_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Cool teal tones with cinematic contrast'
    },
    { 
        id: 'noir-bw', 
        name: 'Noir Black & White',
        category: 'film',
        aspect_ratio: '16:9',
        thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Classic black and white film noir style'
    },
    { 
        id: 'warm-vintage', 
        name: 'Warm Vintage',
        category: 'film',
        aspect_ratio: '16:9',
        thumbnail_url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Warm, nostalgic tones reminiscent of old film'
    },
    { 
        id: 'scifi-neon', 
        name: 'Sci-Fi Neon',
        category: 'film',
        aspect_ratio: '16:9',
        thumbnail_url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Vibrant neon colors with futuristic feel'
    },
    { 
        id: 'anamorphic-epic', 
        name: 'Anamorphic Epic',
        category: 'film',
        aspect_ratio: '2.39:1',
        thumbnail_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=300&h=126',
        description: 'Wide anamorphic look with lens flares'
    },
    { 
        id: 'documentary-natural', 
        name: 'Documentary Natural',
        category: 'film',
        aspect_ratio: '16:9',
        thumbnail_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Clean, natural colors for documentary realism'
    },

    // ==========================================
    // SOCIAL / SQUARE PRESETS (1:1, 4:5)
    // ==========================================
    { 
        id: 'social-vibrant', 
        name: 'Social Vibrant',
        category: 'social',
        aspect_ratio: '1:1',
        thumbnail_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=200&h=200',
        description: 'Punchy, saturated colors for social media impact'
    },
    { 
        id: 'instagram-aesthetic', 
        name: 'Instagram Aesthetic',
        category: 'social',
        aspect_ratio: '4:5',
        thumbnail_url: 'https://images.unsplash.com/photo-1501901609772-df0848060b33?auto=format&fit=crop&q=80&w=200&h=250',
        description: 'Trendy muted tones, lifestyle aesthetic'
    },
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const aspectRatio = searchParams.get('aspect_ratio');
    
    let filteredPresets = MOCK_PRESETS;
    
    // Filter by category if provided
    if (category) {
        filteredPresets = filteredPresets.filter(p => p.category === category);
    }
    
    // Filter by aspect ratio if provided
    if (aspectRatio) {
        filteredPresets = filteredPresets.filter(p => p.aspect_ratio === aspectRatio);
    }
    
    return NextResponse.json(filteredPresets);
}
