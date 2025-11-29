// ============================================================================
// THEME CUSTOMIZATION DATA
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface ThemePreset {
    id: string;
    name: string;
    description: string;
    preview: string; // gradient or color for preview
    category: 'dark' | 'nature' | 'creative' | 'moody' | 'warm' | 'light';
    colors: {
        background: string;
        backgroundSecondary: string;
        backgroundTertiary: string;
        foreground: string;
        foregroundMuted: string;
        border: string;
        borderHover: string;
        accent: string;
        accentHover: string;
        accentForeground: string;
        success: string;
        warning: string;
        error: string;
    };
}

export interface AccentColor {
    id: string;
    name: string;
    color: string;
    hover: string;
    foreground: string;
}

export interface FontOption {
    id: string;
    name: string;
    family: string;
    category: 'sans' | 'serif' | 'mono' | 'display';
}

export interface ThemeSettings {
    preset: string;
    accentColor: string;
    font: string;
    fontSize: 'small' | 'medium' | 'large';
    density: 'compact' | 'comfortable' | 'spacious';
    borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
    animations: boolean;
    reducedMotion: boolean;
    sidebarCollapsed: boolean;
}

// ============================================================================
// THEME PRESETS
// ============================================================================

export const THEME_PRESETS: ThemePreset[] = [
    // ===== DARK THEMES =====
    {
        id: 'midnight',
        name: 'Midnight',
        description: 'Deep dark theme with subtle blue undertones',
        preview: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
        category: 'dark',
        colors: {
            background: '#0a0a0f',
            backgroundSecondary: '#12121a',
            backgroundTertiary: '#1a1a2e',
            foreground: '#ffffff',
            foregroundMuted: '#71717a',
            border: 'rgba(255,255,255,0.1)',
            borderHover: 'rgba(255,255,255,0.2)',
            accent: '#eab308',
            accentHover: '#facc15',
            accentForeground: '#000000',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
        }
    },
    {
        id: 'obsidian',
        name: 'Obsidian',
        description: 'Pure black for OLED displays',
        preview: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)',
        category: 'dark',
        colors: {
            background: '#000000',
            backgroundSecondary: '#0a0a0a',
            backgroundTertiary: '#141414',
            foreground: '#ffffff',
            foregroundMuted: '#737373',
            border: 'rgba(255,255,255,0.08)',
            borderHover: 'rgba(255,255,255,0.15)',
            accent: '#eab308',
            accentHover: '#facc15',
            accentForeground: '#000000',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
        }
    },
    {
        id: 'slate',
        name: 'Slate',
        description: 'Neutral gray tones for extended use',
        preview: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        category: 'dark',
        colors: {
            background: '#0f172a',
            backgroundSecondary: '#1e293b',
            backgroundTertiary: '#334155',
            foreground: '#f8fafc',
            foregroundMuted: '#94a3b8',
            border: 'rgba(148,163,184,0.2)',
            borderHover: 'rgba(148,163,184,0.3)',
            accent: '#eab308',
            accentHover: '#facc15',
            accentForeground: '#000000',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
        }
    },
    
    // ===== NATURE-INSPIRED =====
    {
        id: 'forest',
        name: 'Forest',
        description: 'Calming dark green tones',
        preview: 'linear-gradient(135deg, #0a1210 0%, #14231f 100%)',
        category: 'nature',
        colors: {
            background: '#0a1210',
            backgroundSecondary: '#0f1a16',
            backgroundTertiary: '#14231f',
            foreground: '#ecfdf5',
            foregroundMuted: '#6ee7b7',
            border: 'rgba(110,231,183,0.15)',
            borderHover: 'rgba(110,231,183,0.25)',
            accent: '#10b981',
            accentHover: '#34d399',
            accentForeground: '#000000',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
        }
    },
    {
        id: 'ocean',
        name: 'Ocean',
        description: 'Deep sea blue vibes',
        preview: 'linear-gradient(135deg, #0a0f14 0%, #0c1929 100%)',
        category: 'nature',
        colors: {
            background: '#0a0f14',
            backgroundSecondary: '#0c1929',
            backgroundTertiary: '#172554',
            foreground: '#f0f9ff',
            foregroundMuted: '#7dd3fc',
            border: 'rgba(125,211,252,0.15)',
            borderHover: 'rgba(125,211,252,0.25)',
            accent: '#0ea5e9',
            accentHover: '#38bdf8',
            accentForeground: '#000000',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
        }
    },
    {
        id: 'aurora',
        name: 'Aurora',
        description: 'Northern lights inspired',
        preview: 'linear-gradient(135deg, #0f1419 0%, #1a2b3c 50%, #0d2818 100%)',
        category: 'nature',
        colors: {
            background: '#0f1419',
            backgroundSecondary: '#162028',
            backgroundTertiary: '#1d2d3a',
            foreground: '#e8f4f8',
            foregroundMuted: '#7ec8e3',
            border: 'rgba(126,200,227,0.15)',
            borderHover: 'rgba(126,200,227,0.25)',
            accent: '#22d3ee',
            accentHover: '#67e8f9',
            accentForeground: '#000000',
            success: '#34d399',
            warning: '#fbbf24',
            error: '#f87171',
        }
    },
    
    // ===== CREATIVE/ARTISTIC =====
    {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        description: 'Neon-soaked futuristic vibes',
        preview: 'linear-gradient(135deg, #0d0221 0%, #1a0a2e 50%, #16042d 100%)',
        category: 'creative',
        colors: {
            background: '#0d0221',
            backgroundSecondary: '#150530',
            backgroundTertiary: '#1f0a40',
            foreground: '#f0e6ff',
            foregroundMuted: '#a78bfa',
            border: 'rgba(167,139,250,0.2)',
            borderHover: 'rgba(167,139,250,0.35)',
            accent: '#f0abfc',
            accentHover: '#f5d0fe',
            accentForeground: '#000000',
            success: '#4ade80',
            warning: '#fbbf24',
            error: '#fb7185',
        }
    },
    {
        id: 'synthwave',
        name: 'Synthwave',
        description: '80s retro neon aesthetic',
        preview: 'linear-gradient(135deg, #1a1033 0%, #2d1b4e 50%, #1f1040 100%)',
        category: 'creative',
        colors: {
            background: '#1a1033',
            backgroundSecondary: '#241545',
            backgroundTertiary: '#2d1b4e',
            foreground: '#fdf4ff',
            foregroundMuted: '#e879f9',
            border: 'rgba(232,121,249,0.2)',
            borderHover: 'rgba(232,121,249,0.35)',
            accent: '#f472b6',
            accentHover: '#f9a8d4',
            accentForeground: '#000000',
            success: '#4ade80',
            warning: '#fde047',
            error: '#fb7185',
        }
    },
    {
        id: 'tokyo-night',
        name: 'Tokyo Night',
        description: 'Inspired by Tokyo city lights',
        preview: 'linear-gradient(135deg, #1a1b26 0%, #24283b 100%)',
        category: 'creative',
        colors: {
            background: '#1a1b26',
            backgroundSecondary: '#1f2335',
            backgroundTertiary: '#24283b',
            foreground: '#c0caf5',
            foregroundMuted: '#565f89',
            border: 'rgba(86,95,137,0.3)',
            borderHover: 'rgba(86,95,137,0.5)',
            accent: '#7aa2f7',
            accentHover: '#89b4fa',
            accentForeground: '#000000',
            success: '#9ece6a',
            warning: '#e0af68',
            error: '#f7768e',
        }
    },
    {
        id: 'dracula',
        name: 'Dracula',
        description: 'Popular dark theme with purple tones',
        preview: 'linear-gradient(135deg, #282a36 0%, #44475a 100%)',
        category: 'creative',
        colors: {
            background: '#282a36',
            backgroundSecondary: '#2d303d',
            backgroundTertiary: '#44475a',
            foreground: '#f8f8f2',
            foregroundMuted: '#6272a4',
            border: 'rgba(98,114,164,0.3)',
            borderHover: 'rgba(98,114,164,0.5)',
            accent: '#bd93f9',
            accentHover: '#d4b9fc',
            accentForeground: '#000000',
            success: '#50fa7b',
            warning: '#ffb86c',
            error: '#ff5555',
        }
    },
    
    // ===== MOODY/DRAMATIC =====
    {
        id: 'vampire',
        name: 'Vampire',
        description: 'Dark with blood red accents',
        preview: 'linear-gradient(135deg, #0f0a0a 0%, #1f1414 100%)',
        category: 'moody',
        colors: {
            background: '#0f0a0a',
            backgroundSecondary: '#1a1010',
            backgroundTertiary: '#2a1818',
            foreground: '#fef2f2',
            foregroundMuted: '#fca5a5',
            border: 'rgba(252,165,165,0.15)',
            borderHover: 'rgba(252,165,165,0.25)',
            accent: '#ef4444',
            accentHover: '#f87171',
            accentForeground: '#ffffff',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
        }
    },
    {
        id: 'lavender',
        name: 'Lavender Dreams',
        description: 'Soft purple undertones',
        preview: 'linear-gradient(135deg, #0f0a14 0%, #1a1425 100%)',
        category: 'moody',
        colors: {
            background: '#0f0a14',
            backgroundSecondary: '#1a1425',
            backgroundTertiary: '#2e1f4a',
            foreground: '#faf5ff',
            foregroundMuted: '#c4b5fd',
            border: 'rgba(196,181,253,0.15)',
            borderHover: 'rgba(196,181,253,0.25)',
            accent: '#a855f7',
            accentHover: '#c084fc',
            accentForeground: '#ffffff',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
        }
    },
    {
        id: 'sunset',
        name: 'Sunset',
        description: 'Warm orange and pink tones',
        preview: 'linear-gradient(135deg, #1a0a0f 0%, #2d1520 100%)',
        category: 'moody',
        colors: {
            background: '#1a0a0f',
            backgroundSecondary: '#2d1520',
            backgroundTertiary: '#4a1d35',
            foreground: '#fff7ed',
            foregroundMuted: '#fdba74',
            border: 'rgba(253,186,116,0.15)',
            borderHover: 'rgba(253,186,116,0.25)',
            accent: '#f97316',
            accentHover: '#fb923c',
            accentForeground: '#000000',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
        }
    },
    {
        id: 'noir',
        name: 'Film Noir',
        description: 'Classic black and white cinema',
        preview: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
        category: 'moody',
        colors: {
            background: '#0a0a0a',
            backgroundSecondary: '#141414',
            backgroundTertiary: '#1e1e1e',
            foreground: '#e5e5e5',
            foregroundMuted: '#737373',
            border: 'rgba(255,255,255,0.1)',
            borderHover: 'rgba(255,255,255,0.2)',
            accent: '#a3a3a3',
            accentHover: '#d4d4d4',
            accentForeground: '#000000',
            success: '#a3a3a3',
            warning: '#a3a3a3',
            error: '#a3a3a3',
        }
    },
    
    // ===== WARM THEMES =====
    {
        id: 'mocha',
        name: 'Mocha',
        description: 'Rich coffee and chocolate tones',
        preview: 'linear-gradient(135deg, #1c1410 0%, #2c2018 100%)',
        category: 'warm',
        colors: {
            background: '#1c1410',
            backgroundSecondary: '#241a14',
            backgroundTertiary: '#2c2018',
            foreground: '#f5f0eb',
            foregroundMuted: '#a89984',
            border: 'rgba(168,153,132,0.2)',
            borderHover: 'rgba(168,153,132,0.35)',
            accent: '#d79921',
            accentHover: '#fabd2f',
            accentForeground: '#000000',
            success: '#98971a',
            warning: '#d79921',
            error: '#cc241d',
        }
    },
    {
        id: 'terracotta',
        name: 'Terracotta',
        description: 'Earthy clay and rust tones',
        preview: 'linear-gradient(135deg, #1a1412 0%, #2a1f1a 100%)',
        category: 'warm',
        colors: {
            background: '#1a1412',
            backgroundSecondary: '#221a16',
            backgroundTertiary: '#2a1f1a',
            foreground: '#faf5f0',
            foregroundMuted: '#c4a882',
            border: 'rgba(196,168,130,0.2)',
            borderHover: 'rgba(196,168,130,0.35)',
            accent: '#c2410c',
            accentHover: '#ea580c',
            accentForeground: '#ffffff',
            success: '#65a30d',
            warning: '#ca8a04',
            error: '#dc2626',
        }
    },
    
    // ===== LIGHT THEMES =====
    {
        id: 'light',
        name: 'Light',
        description: 'Clean light mode for bright environments',
        preview: 'linear-gradient(135deg, #ffffff 0%, #f4f4f5 100%)',
        category: 'light',
        colors: {
            background: '#ffffff',
            backgroundSecondary: '#f4f4f5',
            backgroundTertiary: '#e4e4e7',
            foreground: '#18181b',
            foregroundMuted: '#71717a',
            border: 'rgba(0,0,0,0.1)',
            borderHover: 'rgba(0,0,0,0.2)',
            accent: '#ca8a04',
            accentHover: '#a16207',
            accentForeground: '#ffffff',
            success: '#16a34a',
            warning: '#d97706',
            error: '#dc2626',
        }
    },
    {
        id: 'paper',
        name: 'Paper',
        description: 'Warm cream tones, easy on the eyes',
        preview: 'linear-gradient(135deg, #fefcf3 0%, #f5f0e1 100%)',
        category: 'light',
        colors: {
            background: '#fefcf3',
            backgroundSecondary: '#f5f0e1',
            backgroundTertiary: '#e8e0cc',
            foreground: '#1c1917',
            foregroundMuted: '#78716c',
            border: 'rgba(0,0,0,0.1)',
            borderHover: 'rgba(0,0,0,0.2)',
            accent: '#b45309',
            accentHover: '#92400e',
            accentForeground: '#ffffff',
            success: '#16a34a',
            warning: '#d97706',
            error: '#dc2626',
        }
    },
    {
        id: 'rose',
        name: 'Rose Quartz',
        description: 'Soft pink light theme',
        preview: 'linear-gradient(135deg, #fff5f7 0%, #ffe4e8 100%)',
        category: 'light',
        colors: {
            background: '#fff5f7',
            backgroundSecondary: '#ffe4e8',
            backgroundTertiary: '#fecdd3',
            foreground: '#1c1917',
            foregroundMuted: '#78716c',
            border: 'rgba(0,0,0,0.08)',
            borderHover: 'rgba(0,0,0,0.15)',
            accent: '#e11d48',
            accentHover: '#be123c',
            accentForeground: '#ffffff',
            success: '#16a34a',
            warning: '#d97706',
            error: '#dc2626',
        }
    },
    {
        id: 'mint',
        name: 'Mint Fresh',
        description: 'Cool minty light theme',
        preview: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        category: 'light',
        colors: {
            background: '#f0fdf4',
            backgroundSecondary: '#dcfce7',
            backgroundTertiary: '#bbf7d0',
            foreground: '#14532d',
            foregroundMuted: '#166534',
            border: 'rgba(0,0,0,0.08)',
            borderHover: 'rgba(0,0,0,0.15)',
            accent: '#16a34a',
            accentHover: '#15803d',
            accentForeground: '#ffffff',
            success: '#16a34a',
            warning: '#d97706',
            error: '#dc2626',
        }
    },
];

// ============================================================================
// ACCENT COLORS
// ============================================================================

export const ACCENT_COLORS: AccentColor[] = [
    { id: 'yellow', name: 'Gold', color: '#eab308', hover: '#facc15', foreground: '#000000' },
    { id: 'orange', name: 'Orange', color: '#f97316', hover: '#fb923c', foreground: '#000000' },
    { id: 'red', name: 'Red', color: '#ef4444', hover: '#f87171', foreground: '#ffffff' },
    { id: 'pink', name: 'Pink', color: '#ec4899', hover: '#f472b6', foreground: '#ffffff' },
    { id: 'purple', name: 'Purple', color: '#a855f7', hover: '#c084fc', foreground: '#ffffff' },
    { id: 'blue', name: 'Blue', color: '#3b82f6', hover: '#60a5fa', foreground: '#ffffff' },
    { id: 'cyan', name: 'Cyan', color: '#06b6d4', hover: '#22d3ee', foreground: '#000000' },
    { id: 'teal', name: 'Teal', color: '#14b8a6', hover: '#2dd4bf', foreground: '#000000' },
    { id: 'green', name: 'Green', color: '#22c55e', hover: '#4ade80', foreground: '#000000' },
    { id: 'lime', name: 'Lime', color: '#84cc16', hover: '#a3e635', foreground: '#000000' },
];

// ============================================================================
// FONT OPTIONS
// ============================================================================

export const FONT_OPTIONS: FontOption[] = [
    { id: 'system', name: 'System Default', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', category: 'sans' },
    { id: 'inter', name: 'Inter', family: '"Inter", sans-serif', category: 'sans' },
    { id: 'geist', name: 'Geist', family: '"Geist", sans-serif', category: 'sans' },
    { id: 'space-grotesk', name: 'Space Grotesk', family: '"Space Grotesk", sans-serif', category: 'sans' },
    { id: 'dm-sans', name: 'DM Sans', family: '"DM Sans", sans-serif', category: 'sans' },
    { id: 'plus-jakarta', name: 'Plus Jakarta Sans', family: '"Plus Jakarta Sans", sans-serif', category: 'sans' },
    { id: 'outfit', name: 'Outfit', family: '"Outfit", sans-serif', category: 'sans' },
    { id: 'sora', name: 'Sora', family: '"Sora", sans-serif', category: 'sans' },
    { id: 'jetbrains-mono', name: 'JetBrains Mono', family: '"JetBrains Mono", monospace', category: 'mono' },
    { id: 'fira-code', name: 'Fira Code', family: '"Fira Code", monospace', category: 'mono' },
];

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
    preset: 'midnight',
    accentColor: 'yellow',
    font: 'system',
    fontSize: 'medium',
    density: 'comfortable',
    borderRadius: 'medium',
    animations: true,
    reducedMotion: false,
    sidebarCollapsed: false,
};

// ============================================================================
// THEME CATEGORIES
// ============================================================================

export const THEME_CATEGORIES = [
    { id: 'dark', name: 'Dark', description: 'Classic dark themes' },
    { id: 'nature', name: 'Nature', description: 'Inspired by nature' },
    { id: 'creative', name: 'Creative', description: 'Artistic and bold' },
    { id: 'moody', name: 'Moody', description: 'Dramatic atmospheres' },
    { id: 'warm', name: 'Warm', description: 'Cozy warm tones' },
    { id: 'light', name: 'Light', description: 'Bright themes' },
] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getPresetById(id: string): ThemePreset | undefined {
    return THEME_PRESETS.find(p => p.id === id);
}

export function getPresetsByCategory(category: ThemePreset['category']): ThemePreset[] {
    return THEME_PRESETS.filter(p => p.category === category);
}

export function getAccentById(id: string): AccentColor | undefined {
    return ACCENT_COLORS.find(a => a.id === id);
}

export function getFontById(id: string): FontOption | undefined {
    return FONT_OPTIONS.find(f => f.id === id);
}

export function isLightTheme(presetId: string): boolean {
    const preset = getPresetById(presetId);
    return preset?.category === 'light';
}
