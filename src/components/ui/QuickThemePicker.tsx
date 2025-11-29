'use client';

import React, { useState } from 'react';
import { Palette, Check, ChevronDown, Settings } from 'lucide-react';
import Link from 'next/link';
import {
    useThemeCustomization,
    THEME_PRESETS,
    ACCENT_COLORS
} from '@/contexts/ThemeCustomizationContext';

export default function QuickThemePicker() {
    const { settings, updateSettings, currentPreset, currentAccent } = useThemeCustomization();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
                style={{ color: 'var(--sw-foreground-muted)' }}
            >
                <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: currentAccent.color }}
                />
                <Palette size={16} />
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <div 
                        className="absolute right-0 top-full mt-2 w-72 rounded-xl overflow-hidden z-50 shadow-2xl"
                        style={{ 
                            backgroundColor: 'var(--sw-background-secondary)',
                            border: '1px solid var(--sw-border)'
                        }}
                    >
                        {/* Header */}
                        <div 
                            className="px-4 py-3 flex items-center justify-between"
                            style={{ borderBottom: '1px solid var(--sw-border)' }}
                        >
                            <span className="text-sm font-medium" style={{ color: 'var(--sw-foreground)' }}>
                                Quick Theme
                            </span>
                            <Link 
                                href="/settings/appearance"
                                onClick={() => setIsOpen(false)}
                                className="text-xs flex items-center gap-1 transition-colors"
                                style={{ color: 'var(--sw-accent)' }}
                            >
                                <Settings size={12} />
                                All Settings
                            </Link>
                        </div>

                        {/* Theme Presets */}
                        <div className="p-3">
                            <div className="text-xs font-medium mb-2" style={{ color: 'var(--sw-foreground-muted)' }}>
                                Theme
                            </div>
                            <div className="grid grid-cols-5 gap-1.5">
                                {THEME_PRESETS.slice(0, 10).map(preset => (
                                    <button
                                        key={preset.id}
                                        onClick={() => updateSettings({ preset: preset.id })}
                                        className="relative aspect-square rounded-lg overflow-hidden transition-transform hover:scale-105"
                                        style={{ 
                                            background: preset.preview,
                                            border: settings.preset === preset.id 
                                                ? '2px solid var(--sw-accent)' 
                                                : '2px solid transparent'
                                        }}
                                        title={preset.name}
                                    >
                                        {settings.preset === preset.id && (
                                            <Check 
                                                size={12} 
                                                className="absolute inset-0 m-auto"
                                                style={{ color: 'white', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Accent Colors */}
                        <div 
                            className="p-3"
                            style={{ borderTop: '1px solid var(--sw-border)' }}
                        >
                            <div className="text-xs font-medium mb-2" style={{ color: 'var(--sw-foreground-muted)' }}>
                                Accent Color
                            </div>
                            <div className="flex gap-1.5">
                                {ACCENT_COLORS.map(color => (
                                    <button
                                        key={color.id}
                                        onClick={() => updateSettings({ accentColor: color.id })}
                                        className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                                        style={{ 
                                            backgroundColor: color.color,
                                            border: settings.accentColor === color.id 
                                                ? '2px solid var(--sw-foreground)' 
                                                : '2px solid transparent'
                                        }}
                                        title={color.name}
                                    >
                                        {settings.accentColor === color.id && (
                                            <Check 
                                                size={10} 
                                                className="mx-auto"
                                                style={{ color: color.foreground }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Current */}
                        <div 
                            className="px-4 py-2 text-xs"
                            style={{ 
                                backgroundColor: 'var(--sw-background-tertiary)',
                                color: 'var(--sw-foreground-muted)'
                            }}
                        >
                            Current: {currentPreset.name} + {currentAccent.name}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
