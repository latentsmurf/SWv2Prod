'use client';

import React from 'react';

interface Tab {
    key: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
}

interface SectionTabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (key: string) => void;
    variant?: 'default' | 'pills' | 'underline';
    size?: 'sm' | 'md' | 'lg';
}

export default function SectionTabs({
    tabs,
    activeTab,
    onTabChange,
    variant = 'default',
    size = 'md'
}: SectionTabsProps) {
    const sizeClasses = {
        sm: 'px-2.5 py-1.5 text-xs gap-1.5',
        md: 'px-3 py-2 text-sm gap-2',
        lg: 'px-4 py-2.5 text-base gap-2'
    };

    const getTabClasses = (isActive: boolean) => {
        const base = `flex items-center font-medium whitespace-nowrap transition-all ${sizeClasses[size]}`;
        
        if (variant === 'pills') {
            return `${base} rounded-lg ${
                isActive
                    ? 'bg-yellow-500 text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`;
        }
        
        if (variant === 'underline') {
            return `${base} border-b-2 ${
                isActive
                    ? 'border-yellow-500 text-yellow-500'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-white/20'
            }`;
        }
        
        // Default variant
        return `${base} rounded-lg ${
            isActive
                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
        }`;
    };

    return (
        <div className={`flex items-center gap-1 ${variant === 'underline' ? 'border-b border-white/5' : ''}`}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <button
                        key={tab.key}
                        onClick={() => onTabChange(tab.key)}
                        className={getTabClasses(isActive)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {tab.badge !== undefined && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                isActive ? 'bg-black/20' : 'bg-white/10'
                            }`}>
                                {tab.badge}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
