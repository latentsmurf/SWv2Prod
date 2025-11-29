'use client';

import React, { useState } from 'react';
import {
    Palette, Type, Maximize2, Circle, Check, RotateCcw, Eye,
    Moon, Sun, Sparkles, Minus, Square, Monitor, Zap
} from 'lucide-react';
import {
    useThemeCustomization,
    THEME_PRESETS,
    ACCENT_COLORS,
    FONT_OPTIONS,
    DEFAULT_THEME_SETTINGS,
    ThemePreset,
    AccentColor,
    FontOption
} from '@/contexts/ThemeCustomizationContext';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ThemeCustomizer() {
    const {
        settings,
        updateSettings,
        resetSettings,
        currentPreset,
        currentAccent,
        currentFont
    } = useThemeCustomization();

    const [activeTab, setActiveTab] = useState<'themes' | 'colors' | 'typography' | 'layout'>('themes');
    const [showPreview, setShowPreview] = useState(false);

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(DEFAULT_THEME_SETTINGS);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--sw-foreground)' }}>
                        Appearance
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--sw-foreground-muted)' }}>
                        Customize how SceneWeaver looks for you
                    </p>
                </div>
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
                        onClick={() => setActiveTab(tab.key as any)}
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
                <div className="space-y-4">
                    <p className="text-sm" style={{ color: 'var(--sw-foreground-muted)' }}>
                        Choose a base theme for the interface
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {THEME_PRESETS.map(preset => (
                            <button
                                key={preset.id}
                                onClick={() => updateSettings({ preset: preset.id })}
                                className="relative group rounded-xl overflow-hidden transition-all"
                                style={{
                                    border: settings.preset === preset.id 
                                        ? `2px solid var(--sw-accent)` 
                                        : '2px solid var(--sw-border)',
                                }}
                            >
                                {/* Preview */}
                                <div 
                                    className="aspect-[4/3] p-3"
                                    style={{ background: preset.preview }}
                                >
                                    <div className="h-full rounded-lg flex flex-col gap-1 p-2" style={{ backgroundColor: preset.colors.backgroundSecondary }}>
                                        <div className="h-2 w-3/4 rounded" style={{ backgroundColor: preset.colors.foreground, opacity: 0.3 }} />
                                        <div className="h-2 w-1/2 rounded" style={{ backgroundColor: preset.colors.foregroundMuted, opacity: 0.3 }} />
                                        <div className="mt-auto flex gap-1">
                                            <div className="h-3 w-8 rounded" style={{ backgroundColor: preset.colors.accent }} />
                                            <div className="h-3 w-6 rounded" style={{ backgroundColor: preset.colors.border }} />
                                        </div>
                                    </div>
                                </div>
                                {/* Label */}
                                <div 
                                    className="p-2 text-left"
                                    style={{ backgroundColor: preset.colors.backgroundSecondary }}
                                >
                                    <div className="text-xs font-medium" style={{ color: preset.colors.foreground }}>
                                        {preset.name}
                                    </div>
                                </div>
                                {/* Selected indicator */}
                                {settings.preset === preset.id && (
                                    <div 
                                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: 'var(--sw-accent)' }}
                                    >
                                        <Check size={12} style={{ color: 'var(--sw-accent-foreground)' }} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
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
                        <div className="flex items-center gap-3">
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
                                        The quick brown fox
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
                                    onClick={() => updateSettings({ density: option.key as any })}
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
                                    onClick={() => updateSettings({ borderRadius: option.key as any })}
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
