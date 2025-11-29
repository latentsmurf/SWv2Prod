import { NextResponse } from "next/server";

// ============================================================================
// COMPREHENSIVE STYLE PRESETS DATABASE
// ============================================================================

const MOCK_PRESETS = [
    // ==========================================
    // MICRO DRAMA / VERTICAL SERIES (9:16)
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
    // DIRECTORS
    // ==========================================
    { 
        id: 'dir-spielberg', 
        name: 'Spielberg',
        category: 'directors',
        thumbnail_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Dramatic backlighting, lens flares, emotional close-ups, "Spielberg face"',
        keywords: 'dramatic lighting, lens flare, wonder, awe, silhouettes'
    },
    { 
        id: 'dir-nolan', 
        name: 'Christopher Nolan',
        category: 'directors',
        thumbnail_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'IMAX scale, practical effects, cold blue tones, time manipulation',
        keywords: 'IMAX, practical, cold blue, epic scale, time'
    },
    { 
        id: 'dir-tarantino', 
        name: 'Quentin Tarantino',
        category: 'directors',
        thumbnail_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Trunk shots, feet shots, long takes, saturated colors, 70s aesthetic',
        keywords: 'trunk shot, saturated, retro, dialogue, violence'
    },
    { 
        id: 'dir-wes-anderson', 
        name: 'Wes Anderson',
        category: 'directors',
        thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Symmetrical compositions, pastel colors, whimsical, dollhouse aesthetic',
        keywords: 'symmetry, pastel, whimsical, centered, quirky'
    },
    { 
        id: 'dir-kubrick', 
        name: 'Stanley Kubrick',
        category: 'directors',
        thumbnail_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'One-point perspective, cold precision, unsettling symmetry, wide angles',
        keywords: 'symmetry, cold, wide angle, precision, unsettling'
    },
    { 
        id: 'dir-fincher', 
        name: 'David Fincher',
        category: 'directors',
        thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Dark, desaturated, meticulous framing, green-yellow tones, noir',
        keywords: 'dark, desaturated, noir, green tint, precise'
    },
    { 
        id: 'dir-villeneuve', 
        name: 'Denis Villeneuve',
        category: 'directors',
        thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Vast landscapes, atmospheric haze, monolithic scale, contemplative',
        keywords: 'scale, atmospheric, haze, contemplative, sci-fi'
    },
    { 
        id: 'dir-wong-kar-wai', 
        name: 'Wong Kar-wai',
        category: 'directors',
        thumbnail_url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Neon-lit nights, slow motion, saturated colors, romantic melancholy',
        keywords: 'neon, slow motion, romance, saturated, melancholy'
    },
    { 
        id: 'dir-scorsese', 
        name: 'Martin Scorsese',
        category: 'directors',
        thumbnail_url: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Tracking shots, freeze frames, dynamic camera, rock music energy',
        keywords: 'tracking shot, freeze frame, energy, dynamic, crime'
    },
    { 
        id: 'dir-lynch', 
        name: 'David Lynch',
        category: 'directors',
        thumbnail_url: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Surreal imagery, dream logic, dark shadows, industrial sounds',
        keywords: 'surreal, dream, dark, industrial, unsettling'
    },

    // ==========================================
    // CINEMATOGRAPHERS
    // ==========================================
    { 
        id: 'dp-deakins', 
        name: 'Roger Deakins',
        category: 'cinematographers',
        thumbnail_url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Natural light mastery, subtle color grading, painterly compositions',
        keywords: 'natural light, painterly, subtle, elegant, master'
    },
    { 
        id: 'dp-lubezki', 
        name: 'Emmanuel Lubezki',
        category: 'cinematographers',
        thumbnail_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Long takes, natural light, handheld fluidity, magic hour obsession',
        keywords: 'long take, natural light, handheld, magic hour, fluid'
    },
    { 
        id: 'dp-storaro', 
        name: 'Vittorio Storaro',
        category: 'cinematographers',
        thumbnail_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Color as emotion, dramatic shadows, operatic lighting, warm tones',
        keywords: 'color emotion, dramatic, operatic, warm, expressive'
    },
    { 
        id: 'dp-kaminski', 
        name: 'Janusz Kamiński',
        category: 'cinematographers',
        thumbnail_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Harsh backlight, blown-out windows, high contrast, Spielberg collaborator',
        keywords: 'backlight, high contrast, blown highlights, dramatic'
    },
    { 
        id: 'dp-hoytema', 
        name: 'Hoyte van Hoytema',
        category: 'cinematographers',
        thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'IMAX grandeur, practical lighting, intimate scale, Nolan collaborator',
        keywords: 'IMAX, practical, intimate, grand, epic'
    },
    { 
        id: 'dp-richardson', 
        name: 'Robert Richardson',
        category: 'cinematographers',
        thumbnail_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'High contrast, bold colors, smoke and haze, Tarantino collaborator',
        keywords: 'high contrast, bold, haze, smoke, dramatic'
    },
    { 
        id: 'dp-prieto', 
        name: 'Rodrigo Prieto',
        category: 'cinematographers',
        thumbnail_url: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Period-accurate looks, versatile styles, texture, Scorsese collaborator',
        keywords: 'period, texture, versatile, authentic, classic'
    },
    { 
        id: 'dp-doyle', 
        name: 'Christopher Doyle',
        category: 'cinematographers',
        thumbnail_url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Handheld intimacy, saturated neons, Hong Kong nights, Wong Kar-wai partner',
        keywords: 'handheld, neon, saturated, intimate, kinetic'
    },

    // ==========================================
    // ANIMATION STYLES
    // ==========================================
    { 
        id: 'anim-disney-classic', 
        name: 'Disney Classic',
        category: 'animation',
        thumbnail_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Hand-drawn elegance, expressive characters, fairy tale aesthetic',
        keywords: 'hand-drawn, fairy tale, expressive, classic, magical'
    },
    { 
        id: 'anim-pixar', 
        name: 'Pixar',
        category: 'animation',
        thumbnail_url: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&q=80&w=300&h=200',
        description: '3D photorealistic lighting, emotional storytelling, vibrant colors',
        keywords: '3D, photorealistic, emotional, vibrant, family'
    },
    { 
        id: 'anim-ghibli', 
        name: 'Studio Ghibli',
        category: 'animation',
        thumbnail_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Watercolor backgrounds, nature worship, gentle pacing, wonder',
        keywords: 'watercolor, nature, gentle, wonder, Japanese'
    },
    { 
        id: 'anim-anime-shonen', 
        name: 'Anime Shonen',
        category: 'animation',
        thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Dynamic action lines, speed effects, dramatic poses, energy',
        keywords: 'action, dynamic, speed lines, dramatic, energy'
    },
    { 
        id: 'anim-anime-slice', 
        name: 'Anime Slice of Life',
        category: 'animation',
        thumbnail_url: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Soft lighting, everyday moments, pastel tones, atmospheric',
        keywords: 'soft, pastel, atmospheric, everyday, gentle'
    },
    { 
        id: 'anim-stop-motion', 
        name: 'Stop Motion',
        category: 'animation',
        thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Handcrafted texture, tactile quality, charming imperfection',
        keywords: 'handcrafted, texture, tactile, charming, quirky'
    },
    { 
        id: 'anim-spider-verse', 
        name: 'Spider-Verse Style',
        category: 'animation',
        thumbnail_url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Comic book halftones, frame rate variation, pop art colors',
        keywords: 'comic, halftone, pop art, stylized, kinetic'
    },
    { 
        id: 'anim-arcane', 
        name: 'Arcane Style',
        category: 'animation',
        thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Painted textures, steampunk aesthetic, expressive lighting',
        keywords: 'painted, steampunk, expressive, detailed, dramatic'
    },

    // ==========================================
    // FILM ERAS
    // ==========================================
    { 
        id: 'era-silent', 
        name: '1920s Silent Film',
        category: 'eras',
        thumbnail_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'High contrast B&W, title cards, exaggerated acting, vignette',
        keywords: 'silent, black and white, vignette, classic, expressive'
    },
    { 
        id: 'era-noir', 
        name: '1940s Film Noir',
        category: 'eras',
        thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Hard shadows, venetian blind lighting, femme fatale, cynical',
        keywords: 'noir, shadows, cynical, detective, mysterious'
    },
    { 
        id: 'era-technicolor', 
        name: '1950s Technicolor',
        category: 'eras',
        thumbnail_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Vivid saturated colors, studio glamour, golden age Hollywood',
        keywords: 'technicolor, saturated, glamour, golden age, vivid'
    },
    { 
        id: 'era-new-hollywood', 
        name: '1970s New Hollywood',
        category: 'eras',
        thumbnail_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Gritty realism, natural light, handheld, anti-establishment',
        keywords: '70s, gritty, natural, handheld, realistic'
    },
    { 
        id: 'era-80s-neon', 
        name: '1980s Neon',
        category: 'eras',
        thumbnail_url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Neon pink and blue, synth aesthetic, excess, MTV era',
        keywords: '80s, neon, synth, excess, MTV, retro'
    },
    { 
        id: 'era-90s-indie', 
        name: '1990s Indie',
        category: 'eras',
        thumbnail_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Grainy film stock, desaturated, lo-fi aesthetic, raw',
        keywords: '90s, indie, grainy, desaturated, raw, lo-fi'
    },
    { 
        id: 'era-2000s-digital', 
        name: '2000s Early Digital',
        category: 'eras',
        thumbnail_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Teal and orange, shaky cam, matrix-style, early digital look',
        keywords: '2000s, teal orange, shaky, digital, action'
    },

    // ==========================================
    // GENRES
    // ==========================================
    { 
        id: 'genre-horror', 
        name: 'Horror',
        category: 'genres',
        thumbnail_url: 'https://images.unsplash.com/photo-1509248961895-b4b3eb436bf4?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Deep shadows, cold tones, dutch angles, unsettling framing',
        keywords: 'horror, dark, shadows, cold, unsettling'
    },
    { 
        id: 'genre-comedy', 
        name: 'Comedy',
        category: 'genres',
        thumbnail_url: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Bright, even lighting, warm tones, clear compositions',
        keywords: 'comedy, bright, warm, clear, friendly'
    },
    { 
        id: 'genre-action', 
        name: 'Action',
        category: 'genres',
        thumbnail_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Dynamic angles, high contrast, adrenaline colors, motion blur',
        keywords: 'action, dynamic, contrast, motion, adrenaline'
    },
    { 
        id: 'genre-romance', 
        name: 'Romance',
        category: 'genres',
        thumbnail_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Soft focus, warm golden tones, dreamy bokeh, intimate',
        keywords: 'romance, soft, warm, dreamy, intimate'
    },
    { 
        id: 'genre-scifi', 
        name: 'Sci-Fi',
        category: 'genres',
        thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Cool blue tones, clean lines, futuristic lighting, tech aesthetic',
        keywords: 'sci-fi, blue, futuristic, clean, tech'
    },
    { 
        id: 'genre-western', 
        name: 'Western',
        category: 'genres',
        thumbnail_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Dusty warm tones, wide landscapes, golden hour, epic vistas',
        keywords: 'western, dusty, warm, landscape, epic'
    },
    { 
        id: 'genre-fantasy', 
        name: 'Fantasy',
        category: 'genres',
        thumbnail_url: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Magical lighting, rich colors, ethereal glow, epic scale',
        keywords: 'fantasy, magical, ethereal, rich, epic'
    },
    { 
        id: 'genre-thriller', 
        name: 'Thriller',
        category: 'genres',
        thumbnail_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Tense compositions, shadow play, desaturated, claustrophobic',
        keywords: 'thriller, tense, shadows, desaturated, suspense'
    },

    // ==========================================
    // TRADITIONAL CINEMATIC (16:9)
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
    // SOCIAL / SQUARE (1:1, 4:5)
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

    // ==========================================
    // COLOR PALETTES
    // ==========================================
    { 
        id: 'color-teal-orange', 
        name: 'Teal & Orange',
        category: 'colors',
        thumbnail_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Hollywood blockbuster color grading, complementary contrast',
        keywords: 'teal, orange, blockbuster, complementary, cinematic'
    },
    { 
        id: 'color-monochrome', 
        name: 'Monochrome',
        category: 'colors',
        thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Single color family, elegant and cohesive',
        keywords: 'monochrome, single color, elegant, cohesive, minimal'
    },
    { 
        id: 'color-pastel', 
        name: 'Pastel Dream',
        category: 'colors',
        thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Soft pastel tones, dreamy and whimsical',
        keywords: 'pastel, soft, dreamy, whimsical, light'
    },
    { 
        id: 'color-neon', 
        name: 'Neon Nights',
        category: 'colors',
        thumbnail_url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Vibrant neon pinks, blues, and purples',
        keywords: 'neon, vibrant, night, cyberpunk, electric'
    },
    { 
        id: 'color-earth', 
        name: 'Earth Tones',
        category: 'colors',
        thumbnail_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Warm browns, greens, and natural tones',
        keywords: 'earth, natural, warm, organic, grounded'
    },
    { 
        id: 'color-desaturated', 
        name: 'Desaturated',
        category: 'colors',
        thumbnail_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Muted colors, low saturation, moody',
        keywords: 'desaturated, muted, moody, subtle, atmospheric'
    },

    // ==========================================
    // LIGHTING STYLES
    // ==========================================
    { 
        id: 'light-golden-hour', 
        name: 'Golden Hour',
        category: 'lighting',
        thumbnail_url: 'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Warm golden sunlight, long shadows, magic hour',
        keywords: 'golden hour, warm, sunset, magic hour, natural'
    },
    { 
        id: 'light-blue-hour', 
        name: 'Blue Hour',
        category: 'lighting',
        thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Cool blue twilight, atmospheric, mysterious',
        keywords: 'blue hour, twilight, cool, mysterious, atmospheric'
    },
    { 
        id: 'light-high-key', 
        name: 'High Key',
        category: 'lighting',
        thumbnail_url: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Bright, even lighting, minimal shadows, clean',
        keywords: 'high key, bright, clean, minimal shadows, airy'
    },
    { 
        id: 'light-low-key', 
        name: 'Low Key',
        category: 'lighting',
        thumbnail_url: 'https://images.unsplash.com/photo-1509248961895-b4b3eb436bf4?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Dark, dramatic, heavy shadows, chiaroscuro',
        keywords: 'low key, dark, dramatic, shadows, chiaroscuro'
    },
    { 
        id: 'light-rembrandt', 
        name: 'Rembrandt',
        category: 'lighting',
        thumbnail_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Classic portrait lighting, triangle of light, painterly',
        keywords: 'rembrandt, portrait, triangle, classic, painterly'
    },
    { 
        id: 'light-silhouette', 
        name: 'Silhouette',
        category: 'lighting',
        thumbnail_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=300&h=200',
        description: 'Strong backlight, dark subjects, dramatic outlines',
        keywords: 'silhouette, backlight, dramatic, outline, contrast'
    },
];

// Category metadata
export const CATEGORIES = [
    { id: 'directors', name: 'Directors', icon: 'clapperboard', description: 'Iconic director styles' },
    { id: 'cinematographers', name: 'Cinematographers', icon: 'camera', description: 'Master DP looks' },
    { id: 'animation', name: 'Animation', icon: 'sparkles', description: 'Animation studio styles' },
    { id: 'eras', name: 'Film Eras', icon: 'clock', description: 'Period-specific looks' },
    { id: 'genres', name: 'Genres', icon: 'film', description: 'Genre-defining aesthetics' },
    { id: 'colors', name: 'Color Palettes', icon: 'palette', description: 'Color grading presets' },
    { id: 'lighting', name: 'Lighting', icon: 'sun', description: 'Lighting setups' },
    { id: 'micro-drama', name: 'Micro Drama', icon: 'smartphone', description: 'Vertical video styles' },
    { id: 'film', name: 'Cinematic', icon: 'film', description: 'Traditional film looks' },
    { id: 'social', name: 'Social Media', icon: 'share', description: 'Social-optimized styles' },
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const aspectRatio = searchParams.get('aspect_ratio');
    const search = searchParams.get('search');
    
    let filteredPresets = MOCK_PRESETS;
    
    // Filter by category if provided
    if (category && category !== 'all') {
        filteredPresets = filteredPresets.filter(p => p.category === category);
    }
    
    // Filter by aspect ratio if provided
    if (aspectRatio) {
        filteredPresets = filteredPresets.filter(p => p.aspect_ratio === aspectRatio);
    }
    
    // Search filter
    if (search) {
        const searchLower = search.toLowerCase();
        filteredPresets = filteredPresets.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower) ||
            (p as any).keywords?.toLowerCase().includes(searchLower)
        );
    }
    
    return NextResponse.json(filteredPresets);
}
