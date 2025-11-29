'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    THEME_PRESETS,
    ACCENT_COLORS,
    FONT_OPTIONS,
    DEFAULT_THEME_SETTINGS,
    type ThemePreset,
    type AccentColor,
    type FontOption,
    type ThemeSettings,
} from '@/data/themePresets';

// Re-export types for convenience
export type {
    ThemePreset,
    AccentColor,
    FontOption,
    ThemeSettings,
} from '@/data/themePresets';

// Re-export constants for backward compatibility
export { THEME_PRESETS, ACCENT_COLORS, FONT_OPTIONS, DEFAULT_THEME_SETTINGS };

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
