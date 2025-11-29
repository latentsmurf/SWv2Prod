'use client';

import React from 'react';
import { X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
    onClose: () => void;
}

const SHORTCUT_CATEGORIES = [
    {
        name: 'Global',
        shortcuts: [
            { keys: ['⌘', 'K'], description: 'Quick search' },
            { keys: ['⌘', '/'], description: 'Show keyboard shortcuts' },
            { keys: ['⌘', 'N'], description: 'New project' },
            { keys: ['⌘', 'S'], description: 'Save project' },
            { keys: ['Esc'], description: 'Close modal' },
        ]
    },
    {
        name: 'Navigation',
        shortcuts: [
            { keys: ['G', 'D'], description: 'Go to Dashboard' },
            { keys: ['G', 'P'], description: 'Go to Production' },
            { keys: ['G', 'L'], description: 'Go to Library' },
            { keys: ['G', 'S'], description: 'Go to Settings' },
        ]
    },
    {
        name: 'Editor',
        shortcuts: [
            { keys: ['Space'], description: 'Play/Pause' },
            { keys: ['←'], description: 'Previous frame' },
            { keys: ['→'], description: 'Next frame' },
            { keys: ['J'], description: 'Rewind' },
            { keys: ['K'], description: 'Pause' },
            { keys: ['L'], description: 'Fast forward' },
            { keys: ['I'], description: 'Set in point' },
            { keys: ['O'], description: 'Set out point' },
        ]
    },
    {
        name: 'Timeline',
        shortcuts: [
            { keys: ['⌘', 'Z'], description: 'Undo' },
            { keys: ['⌘', '⇧', 'Z'], description: 'Redo' },
            { keys: ['⌘', 'C'], description: 'Copy' },
            { keys: ['⌘', 'V'], description: 'Paste' },
            { keys: ['Delete'], description: 'Delete selection' },
            { keys: ['⌘', 'A'], description: 'Select all' },
        ]
    },
    {
        name: 'Shot List',
        shortcuts: [
            { keys: ['↑'], description: 'Previous shot' },
            { keys: ['↓'], description: 'Next shot' },
            { keys: ['Enter'], description: 'Edit shot' },
            { keys: ['⌘', 'G'], description: 'Generate shot' },
            { keys: ['R'], description: 'Regenerate shot' },
        ]
    }
];

export default function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8" onClick={onClose}>
            <div 
                className="w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <Command size={18} className="text-yellow-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Keyboard Shortcuts</h2>
                            <p className="text-xs text-gray-500">Navigate faster with these shortcuts</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-8">
                        {SHORTCUT_CATEGORIES.map(category => (
                            <div key={category.name}>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    {category.name}
                                </h3>
                                <div className="space-y-2">
                                    {category.shortcuts.map((shortcut, i) => (
                                        <div key={i} className="flex items-center justify-between py-1.5">
                                            <span className="text-sm text-gray-400">{shortcut.description}</span>
                                            <div className="flex items-center gap-1">
                                                {shortcut.keys.map((key, j) => (
                                                    <kbd
                                                        key={j}
                                                        className="min-w-[24px] h-6 px-2 bg-white/5 border border-white/10 rounded text-xs font-mono text-gray-300 flex items-center justify-center"
                                                    >
                                                        {key}
                                                    </kbd>
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
                <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                    <p className="text-xs text-center text-gray-600">
                        Press <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] mx-1">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] mx-1">/</kbd> anytime to show this dialog
                    </p>
                </div>
            </div>
        </div>
    );
}
