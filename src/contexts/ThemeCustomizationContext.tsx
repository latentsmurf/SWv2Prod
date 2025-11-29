'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface ThemePreset {
    id: string;
    name: string;
    description: string;
    preview: string; // gradient or color for preview
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
    {
        id: 'midnight',
        name: 'Midnight',
        description: 'Deep dark theme with subtle blue undertones',
        preview: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
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
    {
        id: 'forest',
        name: 'Forest',
        description: 'Calming dark green tones',
        preview: 'linear-gradient(135deg, #0a1210 0%, #14231f 100%)',
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
        id: 'vampire',
        name: 'Vampire',
        description: 'Dark with red accents',
        preview: 'linear-gradient(135deg, #0f0a0a 0%, #1f1414 100%)',
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
        id: 'light',
        name: 'Light',
        description: 'Clean light mode for bright environments',
        preview: 'linear-gradient(135deg, #ffffff 0%, #f4f4f5 100%)',
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
// CONTEXT
// ============================================================================

interface ThemeContextType {
    settings: ThemeSettings;
    updateSettings: (updates: Partial<ThemeSettings>) => void;
    resetSettings: () => void;
    currentPreset: ThemePreset;
    currentAccent: AccentColor;
    currentFont: FontOption;
}

const ThemeCustomizationContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function ThemeCustomizationProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_THEME_SETTINGS);
    const [mounted, setMounted] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('sw_theme_settings');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSettings({ ...DEFAULT_THEME_SETTINGS, ...parsed });
            } catch (e) {
                console.error('Failed to parse theme settings:', e);
            }
        }
        setMounted(true);
    }, []);

    // Save settings to localStorage and apply CSS variables
    useEffect(() => {
        if (!mounted) return;

        localStorage.setItem('sw_theme_settings', JSON.stringify(settings));

        // Get current preset and accent
        const preset = THEME_PRESETS.find(p => p.id === settings.preset) || THEME_PRESETS[0];
        const accent = ACCENT_COLORS.find(a => a.id === settings.accentColor) || ACCENT_COLORS[0];
        const font = FONT_OPTIONS.find(f => f.id === settings.font) || FONT_OPTIONS[0];

        // Apply CSS variables to document root
        const root = document.documentElement;
        
        // Colors
        root.style.setProperty('--sw-background', preset.colors.background);
        root.style.setProperty('--sw-background-secondary', preset.colors.backgroundSecondary);
        root.style.setProperty('--sw-background-tertiary', preset.colors.backgroundTertiary);
        root.style.setProperty('--sw-foreground', preset.colors.foreground);
        root.style.setProperty('--sw-foreground-muted', preset.colors.foregroundMuted);
        root.style.setProperty('--sw-border', preset.colors.border);
        root.style.setProperty('--sw-border-hover', preset.colors.borderHover);
        root.style.setProperty('--sw-accent', accent.color);
        root.style.setProperty('--sw-accent-hover', accent.hover);
        root.style.setProperty('--sw-accent-foreground', accent.foreground);
        root.style.setProperty('--sw-success', preset.colors.success);
        root.style.setProperty('--sw-warning', preset.colors.warning);
        root.style.setProperty('--sw-error', preset.colors.error);

        // Font
        root.style.setProperty('--sw-font-family', font.family);

        // Font size
        const fontSizes = { small: '14px', medium: '16px', large: '18px' };
        root.style.setProperty('--sw-font-size-base', fontSizes[settings.fontSize]);

        // Density (spacing multiplier)
        const densities = { compact: '0.75', comfortable: '1', spacious: '1.25' };
        root.style.setProperty('--sw-density', densities[settings.density]);

        // Border radius
        const radii = { none: '0', small: '4px', medium: '8px', large: '12px', full: '9999px' };
        root.style.setProperty('--sw-radius', radii[settings.borderRadius]);

        // Animations
        root.style.setProperty('--sw-transition-duration', settings.animations ? '150ms' : '0ms');
        
        // Apply background color to body
        document.body.style.backgroundColor = preset.colors.background;
        document.body.style.color = preset.colors.foreground;

    }, [settings, mounted]);

    const updateSettings = (updates: Partial<ThemeSettings>) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };

    const resetSettings = () => {
        setSettings(DEFAULT_THEME_SETTINGS);
    };

    const currentPreset = THEME_PRESETS.find(p => p.id === settings.preset) || THEME_PRESETS[0];
    const currentAccent = ACCENT_COLORS.find(a => a.id === settings.accentColor) || ACCENT_COLORS[0];
    const currentFont = FONT_OPTIONS.find(f => f.id === settings.font) || FONT_OPTIONS[0];

    return (
        <ThemeCustomizationContext.Provider value={{
            settings,
            updateSettings,
            resetSettings,
            currentPreset,
            currentAccent,
            currentFont,
        }}>
            {children}
        </ThemeCustomizationContext.Provider>
    );
}

// ============================================================================
// HOOK
// ============================================================================

export function useThemeCustomization() {
    const context = useContext(ThemeCustomizationContext);
    if (context === undefined) {
        throw new Error('useThemeCustomization must be used within a ThemeCustomizationProvider');
    }
    return context;
}
