'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from 'next-themes';

interface ThemeToggleProps {
    variant?: 'button' | 'dropdown';
}

export default function ThemeToggle({ variant = 'button' }: ThemeToggleProps) {
    const { theme, resolvedTheme, setTheme } = useTheme();
    const [showDropdown, setShowDropdown] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Wait for client-side hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    const themes = [
        { key: 'light' as const, label: 'Light', icon: Sun },
        { key: 'dark' as const, label: 'Dark', icon: Moon },
        { key: 'system' as const, label: 'System', icon: Monitor },
    ];

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="p-2 w-[34px] h-[34px] rounded-lg bg-gray-100 dark:bg-white/5" />
        );
    }

    if (variant === 'button') {
        // Simple toggle between light and dark
        return (
            <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
                {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        );
    }

    // Dropdown variant
    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
                {resolvedTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                <span className="text-sm">Theme</span>
            </button>

            {showDropdown && (
                <>
                    <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)} 
                    />
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                        {themes.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => {
                                    setTheme(key);
                                    setShowDropdown(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                    theme === key 
                                        ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' 
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                            >
                                <Icon size={16} />
                                <span className="flex-1 text-left">{label}</span>
                                {theme === key && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
