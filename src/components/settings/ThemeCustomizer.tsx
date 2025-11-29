'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Palette, Type, Maximize2, Circle, Check, RotateCcw, Eye,
    Moon, Sun, Sparkles, Minus, Square, Monitor, Zap, ArrowLeft,
    Layout, Layers, Grid3X3
} from 'lucide-react';
import {
    useThemeCustomization,
    THEME_PRESETS,
    ACCENT_COLORS,
    FONT_OPTIONS,
    DEFAULT_THEME_SETTINGS,
    ThemePreset,
} from '@/contexts/ThemeCustomizationContext';

// ============================================================================
// THEME CATEGORIES
// ============================================================================

const THEME_CATEGORIES = [
    { id: 'dark', name: 'Dark', themes: ['midnight', 'obsidian', 'slate'] },
    { id: 'nature', name: 'Nature', themes: ['forest', 'ocean', 'aurora'] },
    { id: 'creative', name: 'Creative', themes: ['cyberpunk', 'synthwave', 'tokyo-night', 'dracula'] },
    { id: 'moody', name: 'Moody', themes: ['vampire', 'lavender', 'sunset', 'noir'] },
    { id: 'warm', name: 'Warm', themes: ['mocha', 'terracotta'] },
    { id: 'light', name: 'Light', themes: ['light', 'paper', 'rose', 'mint'] },
];

// ============================================================================
// THEME PREVIEW COMPONENT
// ============================================================================

function ThemePreviewCard({ 
    preset, 
    isSelected, 
    onClick 
}: { 
    preset: ThemePreset; 
    isSelected: boolean; 
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="relative group rounded-xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{
                border: isSelected 
                    ? '3px solid var(--sw-accent)' 
                    : '2px solid var(--sw-border)',
            }}
        >
            {/* Full Preview */}
            <div 
                className="aspect-[16/10] p-3"
                style={{ background: preset.preview }}
            >
                {/* Mock interface */}
                <div className="h-full rounded-lg overflow-hidden flex" style={{ backgroundColor: preset.colors.backgroundSecondary }}>
                    {/* Sidebar */}
                    <div 
                        className="w-1/4 p-2 space-y-1.5 border-r"
                        style={{ backgroundColor: preset.colors.background, borderColor: preset.colors.border }}
                    >
                        <div className="h-2 w-4 rounded" style={{ backgroundColor: preset.colors.accent }} />
                        <div className="h-1.5 w-full rounded opacity-30" style={{ backgroundColor: preset.colors.foreground }} />
                        <div className="h-1.5 w-3/4 rounded opacity-20" style={{ backgroundColor: preset.colors.foreground }} />
                        <div className="h-1.5 w-5/6 rounded opacity-20" style={{ backgroundColor: preset.colors.foreground }} />
                    </div>
                    {/* Main content */}
                    <div className="flex-1 p-2">
                        {/* Header bar */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="h-1.5 w-1/4 rounded opacity-30" style={{ backgroundColor: preset.colors.foreground }} />
                            <div className="h-3 w-8 rounded" style={{ backgroundColor: preset.colors.accent }} />
                        </div>
                        {/* Content area */}
                        <div 
                            className="rounded p-1.5 h-[calc(100%-20px)]"
                            style={{ backgroundColor: preset.colors.backgroundTertiary }}
                        >
                            <div className="grid grid-cols-3 gap-1 h-full">
                                {[1,2,3].map(i => (
                                    <div 
                                        key={i}
                                        className="rounded"
                                        style={{ backgroundColor: preset.colors.background }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Label */}
            <div 
                className="px-3 py-2 text-left flex items-center justify-between"
                style={{ backgroundColor: preset.colors.backgroundSecondary }}
            >
                <div>
                    <div className="text-sm font-medium" style={{ color: preset.colors.foreground }}>
                        {preset.name}
                    </div>
                    <div className="text-[10px] opacity-60" style={{ color: preset.colors.foregroundMuted }}>
                        {preset.description}
                    </div>
                </div>
                {/* Color dots */}
                <div className="flex -space-x-1">
                    <div className="w-3 h-3 rounded-full border-2" style={{ backgroundColor: preset.colors.background, borderColor: preset.colors.backgroundSecondary }} />
                    <div className="w-3 h-3 rounded-full border-2" style={{ backgroundColor: preset.colors.accent, borderColor: preset.colors.backgroundSecondary }} />
                </div>
            </div>
            
            {/* Selected indicator */}
            {isSelected && (
                <div 
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: 'var(--sw-accent)' }}
                >
                    <Check size={14} style={{ color: 'var(--sw-accent-foreground)' }} />
                </div>
            )}
        </button>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ThemeCustomizer() {
    const router = useRouter();
    const {
        settings,
        updateSettings,
        resetSettings,
        currentPreset,
        currentAccent,
        currentFont
    } = useThemeCustomization();

    const [activeTab, setActiveTab] = useState<'themes' | 'colors' | 'typography' | 'layout'>('themes');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(DEFAULT_THEME_SETTINGS);

    // Get themes for display
    const getThemesForCategory = (categoryId: string) => {
        const category = THEME_CATEGORIES.find(c => c.id === categoryId);
        if (!category) return [];
        return category.themes.map(id => THEME_PRESETS.find(p => p.id === id)).filter(Boolean) as ThemePreset[];
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg transition-colors hover:bg-white/5"
                        style={{ color: 'var(--sw-foreground-muted)' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: 'var(--sw-foreground)' }}>
                            Appearance
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--sw-foreground-muted)' }}>
                            Customize how SceneWeaver looks for you
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <button
                            onClick={resetSettings}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
                            style={{
                                backgroundColor: 'var(--sw-background-tertiary)',
                                color: 'var(--sw-foreground-muted)',
                                border: '1px solid var(--sw-border)'
                            }}
                        >
                            <RotateCcw size={14} />
                            Reset to Default
                        </button>
                    )}
                    <button
                        onClick={() => router.push('/production')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{
                            backgroundColor: 'var(--sw-accent)',
                            color: 'var(--sw-accent-foreground)'
                        }}
                    >
                        <Check size={14} />
                        Done
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--sw-background-secondary)' }}>
                {[
                    { key: 'themes', label: 'Themes', icon: <Palette size={14} /> },
                    { key: 'colors', label: 'Accent Colors', icon: <Circle size={14} /> },
                    { key: 'typography', label: 'Typography', icon: <Type size={14} /> },
                    { key: 'layout', label: 'Layout', icon: <Maximize2 size={14} /> },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as typeof activeTab)}
                        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        style={{
                            backgroundColor: activeTab === tab.key ? 'var(--sw-background-tertiary)' : 'transparent',
                            color: activeTab === tab.key ? 'var(--sw-foreground)' : 'var(--sw-foreground-muted)'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Themes Tab */}
            {activeTab === 'themes' && (
                <div className="space-y-6">
                    {/* Category filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: selectedCategory === null ? 'var(--sw-accent)' : 'var(--sw-background-secondary)',
                                color: selectedCategory === null ? 'var(--sw-accent-foreground)' : 'var(--sw-foreground-muted)'
                            }}
                        >
                            All Themes
                        </button>
                        {THEME_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: selectedCategory === cat.id ? 'var(--sw-accent)' : 'var(--sw-background-secondary)',
                                    color: selectedCategory === cat.id ? 'var(--sw-accent-foreground)' : 'var(--sw-foreground-muted)'
                                }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Theme grid - show all or by category */}
                    {selectedCategory === null ? (
                        // Show all themes grouped by category
                        <div className="space-y-8">
                            {THEME_CATEGORIES.map(category => (
                                <div key={category.id}>
                                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--sw-foreground-muted)' }}>
                                        {category.name}
                                        <span className="text-xs opacity-50">({category.themes.length})</span>
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {getThemesForCategory(category.id).map(preset => (
                                            <ThemePreviewCard
                                                key={preset.id}
                                                preset={preset}
                                                isSelected={settings.preset === preset.id}
                                                onClick={() => updateSettings({ preset: preset.id })}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Show themes for selected category
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {getThemesForCategory(selectedCategory).map(preset => (
                                <ThemePreviewCard
                                    key={preset.id}
                                    preset={preset}
                                    isSelected={settings.preset === preset.id}
                                    onClick={() => updateSettings({ preset: preset.id })}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Accent Colors Tab */}
            {activeTab === 'colors' && (
                <div className="space-y-4">
                    <p className="text-sm" style={{ color: 'var(--sw-foreground-muted)' }}>
                        Pick an accent color for buttons and highlights
                    </p>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                        {ACCENT_COLORS.map(color => (
                            <button
                                key={color.id}
                                onClick={() => updateSettings({ accentColor: color.id })}
                                className="relative aspect-square rounded-xl transition-transform hover:scale-105"
                                style={{
                                    backgroundColor: color.color,
                                    border: settings.accentColor === color.id
                                        ? '3px solid var(--sw-foreground)'
                                        : '3px solid transparent'
                                }}
                                title={color.name}
                            >
                                {settings.accentColor === color.id && (
                                    <Check 
                                        size={16} 
                                        className="absolute inset-0 m-auto"
                                        style={{ color: color.foreground }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Preview */}
                    <div 
                        className="mt-6 p-4 rounded-xl"
                        style={{ backgroundColor: 'var(--sw-background-secondary)', border: '1px solid var(--sw-border)' }}
                    >
                        <div className="text-sm mb-3" style={{ color: 'var(--sw-foreground-muted)' }}>Preview</div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                                style={{ 
                                    backgroundColor: 'var(--sw-accent)', 
                                    color: 'var(--sw-accent-foreground)' 
                                }}
                            >
                                Primary Button
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                                style={{ 
                                    backgroundColor: 'transparent', 
                                    color: 'var(--sw-accent)',
                                    border: '1px solid var(--sw-accent)'
                                }}
                            >
                                Outline Button
                            </button>
                            <span 
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{ 
                                    backgroundColor: 'color-mix(in srgb, var(--sw-accent) 20%, transparent)', 
                                    color: 'var(--sw-accent)'
                                }}
                            >
                                Badge
                            </span>
                            <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: 'var(--sw-accent)' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Typography Tab */}
            {activeTab === 'typography' && (
                <div className="space-y-6">
                    {/* Font Family */}
                    <div>
                        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--sw-foreground)' }}>
                            Font Family
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {FONT_OPTIONS.map(font => (
                                <button
                                    key={font.id}
                                    onClick={() => updateSettings({ font: font.id })}
                                    className="p-3 rounded-lg text-left transition-colors"
                                    style={{
                                        backgroundColor: settings.font === font.id 
                                            ? 'var(--sw-background-tertiary)' 
                                            : 'var(--sw-background-secondary)',
                                        border: settings.font === font.id
                                            ? '2px solid var(--sw-accent)'
                                            : '2px solid var(--sw-border)',
                                        fontFamily: font.family
                                    }}
                                >
                                    <div className="text-sm font-medium" style={{ color: 'var(--sw-foreground)' }}>
                                        {font.name}
                                    </div>
                                    <div className="text-xs mt-1" style={{ color: 'var(--sw-foreground-muted)' }}>
                                        The quick brown fox jumps over
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Font Size */}
                    <div>
                        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--sw-foreground)' }}>
                            Font Size
                        </label>
                        <div className="flex items-center gap-2">
                            {(['small', 'medium', 'large'] as const).map(size => (
                                <button
                                    key={size}
                                    onClick={() => updateSettings({ fontSize: size })}
                                    className="flex-1 px-4 py-3 rounded-lg text-center capitalize transition-colors"
                                    style={{
                                        backgroundColor: settings.fontSize === size 
                                            ? 'var(--sw-background-tertiary)' 
                                            : 'var(--sw-background-secondary)',
                                        border: settings.fontSize === size
                                            ? '2px solid var(--sw-accent)'
                                            : '2px solid var(--sw-border)',
                                        color: 'var(--sw-foreground)',
                                        fontSize: size === 'small' ? '13px' : size === 'medium' ? '15px' : '17px'
                                    }}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Layout Tab */}
            {activeTab === 'layout' && (
                <div className="space-y-6">
                    {/* Density */}
                    <div>
                        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--sw-foreground)' }}>
                            Interface Density
                        </label>
                        <div className="flex items-center gap-2">
                            {[
                                { key: 'compact', label: 'Compact', icon: <Minus size={14} /> },
                                { key: 'comfortable', label: 'Comfortable', icon: <Square size={14} /> },
                                { key: 'spacious', label: 'Spacious', icon: <Maximize2 size={14} /> },
                            ].map(option => (
                                <button
                                    key={option.key}
                                    onClick={() => updateSettings({ density: option.key as typeof settings.density })}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors"
                                    style={{
                                        backgroundColor: settings.density === option.key 
                                            ? 'var(--sw-background-tertiary)' 
                                            : 'var(--sw-background-secondary)',
                                        border: settings.density === option.key
                                            ? '2px solid var(--sw-accent)'
                                            : '2px solid var(--sw-border)',
                                        color: 'var(--sw-foreground)'
                                    }}
                                >
                                    {option.icon}
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Border Radius */}
                    <div>
                        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--sw-foreground)' }}>
                            Border Radius
                        </label>
                        <div className="flex items-center gap-2">
                            {[
                                { key: 'none', label: 'None', radius: '0' },
                                { key: 'small', label: 'Small', radius: '4px' },
                                { key: 'medium', label: 'Medium', radius: '8px' },
                                { key: 'large', label: 'Large', radius: '12px' },
                                { key: 'full', label: 'Full', radius: '9999px' },
                            ].map(option => (
                                <button
                                    key={option.key}
                                    onClick={() => updateSettings({ borderRadius: option.key as typeof settings.borderRadius })}
                                    className="flex-1 px-4 py-3 transition-colors"
                                    style={{
                                        backgroundColor: settings.borderRadius === option.key 
                                            ? 'var(--sw-background-tertiary)' 
                                            : 'var(--sw-background-secondary)',
                                        border: settings.borderRadius === option.key
                                            ? '2px solid var(--sw-accent)'
                                            : '2px solid var(--sw-border)',
                                        color: 'var(--sw-foreground)',
                                        borderRadius: option.radius
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-4">
                        {/* Animations */}
                        <div 
                            className="flex items-center justify-between p-4 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background-secondary)', border: '1px solid var(--sw-border)' }}
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <Zap size={16} style={{ color: 'var(--sw-accent)' }} />
                                    <span className="font-medium" style={{ color: 'var(--sw-foreground)' }}>Animations</span>
                                </div>
                                <p className="text-xs mt-1" style={{ color: 'var(--sw-foreground-muted)' }}>
                                    Enable smooth transitions and effects
                                </p>
                            </div>
                            <button
                                onClick={() => updateSettings({ animations: !settings.animations })}
                                className="w-12 h-6 rounded-full transition-colors"
                                style={{ 
                                    backgroundColor: settings.animations ? 'var(--sw-accent)' : 'var(--sw-background-tertiary)'
                                }}
                            >
                                <div 
                                    className="w-5 h-5 rounded-full bg-white transition-transform"
                                    style={{ transform: settings.animations ? 'translateX(24px)' : 'translateX(2px)' }}
                                />
                            </button>
                        </div>

                        {/* Reduced Motion */}
                        <div 
                            className="flex items-center justify-between p-4 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background-secondary)', border: '1px solid var(--sw-border)' }}
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <Monitor size={16} style={{ color: 'var(--sw-accent)' }} />
                                    <span className="font-medium" style={{ color: 'var(--sw-foreground)' }}>Reduced Motion</span>
                                </div>
                                <p className="text-xs mt-1" style={{ color: 'var(--sw-foreground-muted)' }}>
                                    Minimize motion for accessibility
                                </p>
                            </div>
                            <button
                                onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
                                className="w-12 h-6 rounded-full transition-colors"
                                style={{ 
                                    backgroundColor: settings.reducedMotion ? 'var(--sw-accent)' : 'var(--sw-background-tertiary)'
                                }}
                            >
                                <div 
                                    className="w-5 h-5 rounded-full bg-white transition-transform"
                                    style={{ transform: settings.reducedMotion ? 'translateX(24px)' : 'translateX(2px)' }}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Current Settings Summary */}
            <div 
                className="mt-8 p-4 rounded-xl"
                style={{ 
                    backgroundColor: 'var(--sw-background-secondary)', 
                    border: '1px solid var(--sw-border)' 
                }}
            >
                <div className="text-xs font-medium mb-3" style={{ color: 'var(--sw-foreground-muted)' }}>
                    Current Configuration
                </div>
                <div className="flex flex-wrap gap-2">
                    <span 
                        className="px-2 py-1 rounded text-xs"
                        style={{ backgroundColor: 'var(--sw-background-tertiary)', color: 'var(--sw-foreground)' }}
                    >
                        Theme: {currentPreset.name}
                    </span>
                    <span 
                        className="px-2 py-1 rounded text-xs"
                        style={{ backgroundColor: 'var(--sw-background-tertiary)', color: 'var(--sw-foreground)' }}
                    >
                        Accent: {currentAccent.name}
                    </span>
                    <span 
                        className="px-2 py-1 rounded text-xs"
                        style={{ backgroundColor: 'var(--sw-background-tertiary)', color: 'var(--sw-foreground)' }}
                    >
                        Font: {currentFont.name}
                    </span>
                    <span 
                        className="px-2 py-1 rounded text-xs capitalize"
                        style={{ backgroundColor: 'var(--sw-background-tertiary)', color: 'var(--sw-foreground)' }}
                    >
                        Size: {settings.fontSize}
                    </span>
                    <span 
                        className="px-2 py-1 rounded text-xs capitalize"
                        style={{ backgroundColor: 'var(--sw-background-tertiary)', color: 'var(--sw-foreground)' }}
                    >
                        Density: {settings.density}
                    </span>
                    <span 
                        className="px-2 py-1 rounded text-xs capitalize"
                        style={{ backgroundColor: 'var(--sw-background-tertiary)', color: 'var(--sw-foreground)' }}
                    >
                        Radius: {settings.borderRadius}
                    </span>
                </div>
            </div>
        </div>
    );
}
