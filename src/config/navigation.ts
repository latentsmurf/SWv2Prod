// ============================================================================
// NAVIGATION CONFIGURATION
// Centralized navigation items for ProductionLayout sidebar
// ============================================================================

import { LucideIcon } from 'lucide-react';
import {
    Home, FileText, Film, Scissors, Eraser, Archive,
    Video, Type, Music, Subtitles, ImageIcon, Sticker, FolderOpen, Layout, Settings
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface NavItem {
    id: string;
    label: string;
    href: string;
    icon: LucideIcon;
    badge?: string | number;
    featureId?: string;
}

export interface NavSection {
    id: string;
    title: string;
    items: NavItem[];
}

export interface EditorTool {
    id: string;
    label: string;
    panelType: string;
    icon: LucideIcon;
}

// ============================================================================
// MAIN NAVIGATION
// ============================================================================

export const MAIN_NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', href: '/dashboard' },
];

// ============================================================================
// PRODUCTION PHASES
// ============================================================================

export const PRODUCTION_PHASES: NavItem[] = [
    { id: 'pre-production', icon: FileText, label: 'Pre-Production', href: '/production/pre-production' },
    { id: 'production', icon: Film, label: 'Production', href: '/production' },
    { id: 'post-production', icon: Scissors, label: 'Post-Production', href: '/production/post', featureId: 'post-production' },
];

// ============================================================================
// TOOLS
// ============================================================================

export const TOOL_ITEMS: NavItem[] = [
    { id: 'repair-studio', icon: Eraser, label: 'Repair Studio', href: '/production/repair', featureId: 'repair-studio' },
    { id: 'asset-vault', icon: Archive, label: 'Asset Vault', href: '/production/library', featureId: 'asset-vault' },
];

// ============================================================================
// SYSTEM
// ============================================================================

export const SYSTEM_ITEMS: NavItem[] = [
    { id: 'settings', icon: Settings, label: 'Settings', href: '/settings' },
];

// ============================================================================
// EDITOR TOOLS (for post-production panel)
// ============================================================================

export const EDITOR_TOOLS: EditorTool[] = [
    { id: 'video', panelType: 'video', icon: Video, label: 'Video' },
    { id: 'text', panelType: 'text', icon: Type, label: 'Text' },
    { id: 'audio', panelType: 'audio', icon: Music, label: 'Audio' },
    { id: 'captions', panelType: 'caption', icon: Subtitles, label: 'Captions' },
    { id: 'images', panelType: 'image', icon: ImageIcon, label: 'Images' },
    { id: 'stickers', panelType: 'sticker', icon: Sticker, label: 'Stickers' },
    { id: 'uploads', panelType: 'uploads', icon: FolderOpen, label: 'Uploads' },
    { id: 'templates', panelType: 'templates', icon: Layout, label: 'Templates' },
];

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

export interface KeyboardShortcut {
    keys: string[];
    description: string;
    category: 'general' | 'editing' | 'playback' | 'timeline';
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
    // General
    { keys: ['⌘', 'K'], description: 'Open search', category: 'general' },
    { keys: ['⌘', '/'], description: 'Keyboard shortcuts', category: 'general' },
    { keys: ['⌘', 'S'], description: 'Save project', category: 'general' },
    { keys: ['⌘', 'Z'], description: 'Undo', category: 'general' },
    { keys: ['⌘', '⇧', 'Z'], description: 'Redo', category: 'general' },
    
    // Editing
    { keys: ['C'], description: 'Cut at playhead', category: 'editing' },
    { keys: ['⌫'], description: 'Delete selection', category: 'editing' },
    { keys: ['⌘', 'C'], description: 'Copy', category: 'editing' },
    { keys: ['⌘', 'V'], description: 'Paste', category: 'editing' },
    { keys: ['⌘', 'D'], description: 'Duplicate', category: 'editing' },
    
    // Playback
    { keys: ['Space'], description: 'Play/Pause', category: 'playback' },
    { keys: ['J'], description: 'Rewind', category: 'playback' },
    { keys: ['K'], description: 'Pause', category: 'playback' },
    { keys: ['L'], description: 'Fast forward', category: 'playback' },
    { keys: ['←'], description: 'Previous frame', category: 'playback' },
    { keys: ['→'], description: 'Next frame', category: 'playback' },
    
    // Timeline
    { keys: ['I'], description: 'Set in point', category: 'timeline' },
    { keys: ['O'], description: 'Set out point', category: 'timeline' },
    { keys: ['Home'], description: 'Go to start', category: 'timeline' },
    { keys: ['End'], description: 'Go to end', category: 'timeline' },
    { keys: ['+'], description: 'Zoom in timeline', category: 'timeline' },
    { keys: ['-'], description: 'Zoom out timeline', category: 'timeline' },
];

export const SHORTCUT_CATEGORIES = {
    general: 'General',
    editing: 'Editing',
    playback: 'Playback',
    timeline: 'Timeline',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getShortcutsByCategory(category: keyof typeof SHORTCUT_CATEGORIES): KeyboardShortcut[] {
    return KEYBOARD_SHORTCUTS.filter(s => s.category === category);
}

export function isNavItemActive(href: string, pathname: string): boolean {
    if (href === '/dashboard') {
        return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
}
