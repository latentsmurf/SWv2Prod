'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Search, FileText, Film, Clapperboard, Scissors, Settings, Plus,
    Zap, Archive, HelpCircle, Keyboard, Home, FolderOpen, Command
} from 'lucide-react';

interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon: React.ReactNode;
    action: () => void;
    shortcut?: string;
    category: 'navigation' | 'actions' | 'projects' | 'help';
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const commands: CommandItem[] = [
        // Navigation
        { id: 'nav-dashboard', label: 'Go to Dashboard', icon: <Home size={16} />, action: () => router.push('/dashboard'), shortcut: 'G D', category: 'navigation' },
        { id: 'nav-pre', label: 'Go to Pre-Production', icon: <Clapperboard size={16} />, action: () => router.push('/production/pre-production'), shortcut: '⌘ 1', category: 'navigation' },
        { id: 'nav-prod', label: 'Go to Production', icon: <Film size={16} />, action: () => router.push('/production'), shortcut: '⌘ 2', category: 'navigation' },
        { id: 'nav-post', label: 'Go to Post-Production', icon: <Scissors size={16} />, action: () => router.push('/production/post'), shortcut: '⌘ 3', category: 'navigation' },
        { id: 'nav-library', label: 'Go to Asset Library', icon: <Archive size={16} />, action: () => router.push('/production/library'), category: 'navigation' },
        { id: 'nav-settings', label: 'Go to Settings', icon: <Settings size={16} />, action: () => router.push('/settings/engine'), shortcut: '⌘ ,', category: 'navigation' },
        
        // Actions
        { id: 'act-new', label: 'Create New Project', description: 'Start a new production', icon: <Plus size={16} />, action: () => router.push('/new-project'), shortcut: '⌘ N', category: 'actions' },
        { id: 'act-repair', label: 'Open Repair Studio', description: 'AI-powered image editing', icon: <Zap size={16} />, action: () => router.push('/production/repair'), category: 'actions' },
        { id: 'act-import', label: 'Import Script', description: 'Upload a screenplay', icon: <FileText size={16} />, action: () => router.push('/production/pre-production'), category: 'actions' },
        
        // Help
        { id: 'help-shortcuts', label: 'Keyboard Shortcuts', description: 'View all shortcuts', icon: <Keyboard size={16} />, action: () => { onClose(); /* trigger shortcuts modal */ }, shortcut: '⌘ /', category: 'help' },
        { id: 'help-docs', label: 'Documentation', description: 'Read the docs', icon: <HelpCircle size={16} />, action: () => window.open('https://docs.sceneweaver.ai', '_blank'), category: 'help' },
    ];

    const filteredCommands = query
        ? commands.filter(cmd => 
            cmd.label.toLowerCase().includes(query.toLowerCase()) ||
            cmd.description?.toLowerCase().includes(query.toLowerCase())
          )
        : commands;

    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = [];
        acc[cmd.category].push(cmd);
        return acc;
    }, {} as Record<string, CommandItem[]>);

    const categoryLabels = {
        navigation: 'Navigation',
        actions: 'Actions',
        projects: 'Recent Projects',
        help: 'Help'
    };

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(i => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                    onClose();
                }
                break;
            case 'Escape':
                onClose();
                break;
        }
    }, [isOpen, filteredCommands, selectedIndex, onClose]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Scroll selected item into view
    useEffect(() => {
        const selectedElement = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
        selectedElement?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    if (!isOpen) return null;

    let flatIndex = 0;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-start justify-center pt-[15vh]" onClick={onClose}>
            <div 
                className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
                    <Search size={20} className="text-gray-500" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        placeholder="Search commands..."
                        className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
                    />
                    <kbd className="px-2 py-1 bg-white/5 rounded text-xs text-gray-500 font-mono">ESC</kbd>
                </div>

                {/* Results */}
                <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
                    {filteredCommands.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">
                            <Search size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No commands found</p>
                        </div>
                    ) : (
                        Object.entries(groupedCommands).map(([category, items]) => (
                            <div key={category} className="mb-2">
                                <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                    {categoryLabels[category as keyof typeof categoryLabels]}
                                </div>
                                {items.map((cmd) => {
                                    const currentIndex = flatIndex++;
                                    const isSelected = currentIndex === selectedIndex;
                                    
                                    return (
                                        <button
                                            key={cmd.id}
                                            data-index={currentIndex}
                                            onClick={() => {
                                                cmd.action();
                                                onClose();
                                            }}
                                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                                isSelected 
                                                    ? 'bg-yellow-500/10 text-white' 
                                                    : 'text-gray-400 hover:bg-white/5'
                                            }`}
                                        >
                                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5'}`}>
                                                {cmd.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{cmd.label}</div>
                                                {cmd.description && (
                                                    <div className="text-xs text-gray-500">{cmd.description}</div>
                                                )}
                                            </div>
                                            {cmd.shortcut && (
                                                <kbd className="px-2 py-1 bg-white/5 rounded text-xs text-gray-500 font-mono">
                                                    {cmd.shortcut}
                                                </kbd>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↑↓</kbd> navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↵</kbd> select
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white/5 rounded">esc</kbd> close
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Command size={12} />
                        <span>Powered by SceneWeaver</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
