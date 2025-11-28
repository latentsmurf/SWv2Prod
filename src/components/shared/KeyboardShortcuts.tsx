'use client';

import React, { useState, useEffect } from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface Shortcut {
    keys: string[];
    description: string;
    category: string;
}

const SHORTCUTS: Shortcut[] = [
    // Global
    { keys: ['⌘', 'K'], description: 'Open search', category: 'Global' },
    { keys: ['⌘', '/'], description: 'Show shortcuts', category: 'Global' },
    { keys: ['⌘', 'N'], description: 'New project', category: 'Global' },
    { keys: ['⌘', 'S'], description: 'Save', category: 'Global' },
    { keys: ['Esc'], description: 'Close modal / Cancel', category: 'Global' },
    
    // Navigation
    { keys: ['⌘', '1'], description: 'Go to Dashboard', category: 'Navigation' },
    { keys: ['⌘', '2'], description: 'Go to Production', category: 'Navigation' },
    { keys: ['⌘', '3'], description: 'Go to Library', category: 'Navigation' },
    { keys: ['⌘', ','], description: 'Open Settings', category: 'Navigation' },
    
    // Editor
    { keys: ['Space'], description: 'Play / Pause', category: 'Editor' },
    { keys: ['←'], description: 'Previous shot', category: 'Editor' },
    { keys: ['→'], description: 'Next shot', category: 'Editor' },
    { keys: ['⌘', 'Z'], description: 'Undo', category: 'Editor' },
    { keys: ['⌘', '⇧', 'Z'], description: 'Redo', category: 'Editor' },
    { keys: ['⌘', 'C'], description: 'Copy', category: 'Editor' },
    { keys: ['⌘', 'V'], description: 'Paste', category: 'Editor' },
    { keys: ['Delete'], description: 'Delete selected', category: 'Editor' },
    
    // Generation
    { keys: ['⌘', 'G'], description: 'Generate shots', category: 'Generation' },
    { keys: ['⌘', 'R'], description: 'Regenerate selected', category: 'Generation' },
    { keys: ['⌘', 'E'], description: 'Export', category: 'Generation' },
];

interface KeyboardShortcutsProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
    // Group shortcuts by category
    const groupedShortcuts = SHORTCUTS.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
            acc[shortcut.category] = [];
        }
        acc[shortcut.category].push(shortcut);
        return acc;
    }, {} as Record<string, Shortcut[]>);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-xl">
                            <Keyboard className="text-yellow-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
                            <p className="text-sm text-gray-500">Navigate faster with shortcuts</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Shortcuts List */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="grid gap-8">
                        {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                            <div key={category}>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                    {category}
                                </h3>
                                <div className="space-y-2">
                                    {shortcuts.map((shortcut, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5"
                                        >
                                            <span className="text-gray-300">{shortcut.description}</span>
                                            <div className="flex items-center gap-1">
                                                {shortcut.keys.map((key, keyIndex) => (
                                                    <React.Fragment key={keyIndex}>
                                                        <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded text-xs text-white font-mono min-w-[24px] text-center">
                                                            {key}
                                                        </kbd>
                                                        {keyIndex < shortcut.keys.length - 1 && (
                                                            <span className="text-gray-600">+</span>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-white/5 flex items-center justify-center">
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                        Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">⌘ /</kbd> anywhere to show this help
                    </p>
                </div>
            </div>
        </div>
    );
}

// Global shortcut listener hook
export function useKeyboardShortcuts(handlers: Record<string, () => void>) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifier = isMac ? e.metaKey : e.ctrlKey;

            // Build key combo string
            let combo = '';
            if (modifier) combo += 'cmd+';
            if (e.shiftKey) combo += 'shift+';
            if (e.altKey) combo += 'alt+';
            combo += e.key.toLowerCase();

            // Check if handler exists
            if (handlers[combo]) {
                e.preventDefault();
                handlers[combo]();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlers]);
}

// Shortcut Provider Component
export function ShortcutProvider({ children }: { children: React.ReactNode }) {
    const [showHelp, setShowHelp] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    // Register global shortcuts
    useKeyboardShortcuts({
        'cmd+/': () => setShowHelp(true),
        'cmd+k': () => setShowSearch(true),
    });

    return (
        <>
            {children}
            <KeyboardShortcuts isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </>
    );
}
