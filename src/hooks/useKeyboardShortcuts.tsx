'use client';

import React, { useEffect, useCallback, useRef } from 'react';

type KeyCombo = string; // e.g., 'ctrl+s', 'meta+shift+p', 'escape'
type ShortcutHandler = (e: KeyboardEvent) => void;

interface ShortcutConfig {
    key: KeyCombo;
    handler: ShortcutHandler;
    description?: string;
    category?: string;
    preventDefault?: boolean;
    enableInInput?: boolean;
}

interface UseKeyboardShortcutsOptions {
    enabled?: boolean;
    scope?: string;
}

// Parse a key combo string into its parts
function parseKeyCombo(combo: string): { 
    key: string; 
    ctrl: boolean; 
    meta: boolean; 
    shift: boolean; 
    alt: boolean 
} {
    const parts = combo.toLowerCase().split('+');
    const key = parts[parts.length - 1];
    
    return {
        key,
        ctrl: parts.includes('ctrl') || parts.includes('control'),
        meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
        shift: parts.includes('shift'),
        alt: parts.includes('alt') || parts.includes('option')
    };
}

// Check if an event matches a key combo
function matchesCombo(e: KeyboardEvent, combo: string): boolean {
    const { key, ctrl, meta, shift, alt } = parseKeyCombo(combo);
    
    const eventKey = e.key.toLowerCase();
    const matchesKey = eventKey === key || e.code.toLowerCase() === `key${key}`;
    
    return (
        matchesKey &&
        e.ctrlKey === ctrl &&
        e.metaKey === meta &&
        e.shiftKey === shift &&
        e.altKey === alt
    );
}

// Check if focus is in an input element
function isInputFocused(): boolean {
    const active = document.activeElement;
    if (!active) return false;
    
    const tagName = active.tagName.toLowerCase();
    return (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        (active as HTMLElement).isContentEditable
    );
}

// Main hook
export function useKeyboardShortcuts(
    shortcuts: ShortcutConfig[],
    options: UseKeyboardShortcutsOptions = {}
) {
    const { enabled = true, scope } = options;
    const shortcutsRef = useRef(shortcuts);
    shortcutsRef.current = shortcuts;

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip if in input and not explicitly enabled
            if (isInputFocused()) {
                const matchingShortcut = shortcutsRef.current.find(s => matchesCombo(e, s.key));
                if (!matchingShortcut?.enableInInput) return;
            }

            for (const shortcut of shortcutsRef.current) {
                if (matchesCombo(e, shortcut.key)) {
                    if (shortcut.preventDefault !== false) {
                        e.preventDefault();
                    }
                    shortcut.handler(e);
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabled, scope]);
}

// Shortcut for single key binding
export function useKeyboardShortcut(
    keyCombo: KeyCombo,
    handler: ShortcutHandler,
    options: Omit<UseKeyboardShortcutsOptions, 'shortcuts'> & { 
        preventDefault?: boolean;
        enableInInput?: boolean;
    } = {}
) {
    const { preventDefault = true, enableInInput = false, ...rest } = options;
    
    useKeyboardShortcuts([
        { key: keyCombo, handler, preventDefault, enableInInput }
    ], rest);
}

// ============================================================================
// COMMON SHORTCUTS PRESETS
// ============================================================================

export const EDITOR_SHORTCUTS: ShortcutConfig[] = [
    { key: 'meta+s', handler: () => {}, description: 'Save', category: 'General' },
    { key: 'meta+z', handler: () => {}, description: 'Undo', category: 'Edit' },
    { key: 'meta+shift+z', handler: () => {}, description: 'Redo', category: 'Edit' },
    { key: 'escape', handler: () => {}, description: 'Cancel / Close', category: 'General' },
    { key: 'meta+k', handler: () => {}, description: 'Quick Search', category: 'Navigation' },
    { key: 'meta+/', handler: () => {}, description: 'Keyboard Shortcuts', category: 'Help' },
];

export const TIMELINE_SHORTCUTS: ShortcutConfig[] = [
    { key: 'space', handler: () => {}, description: 'Play / Pause', category: 'Playback' },
    { key: 'j', handler: () => {}, description: 'Rewind', category: 'Playback' },
    { key: 'k', handler: () => {}, description: 'Pause', category: 'Playback' },
    { key: 'l', handler: () => {}, description: 'Fast Forward', category: 'Playback' },
    { key: 'arrowleft', handler: () => {}, description: 'Previous Frame', category: 'Navigation' },
    { key: 'arrowright', handler: () => {}, description: 'Next Frame', category: 'Navigation' },
    { key: 'home', handler: () => {}, description: 'Go to Start', category: 'Navigation' },
    { key: 'end', handler: () => {}, description: 'Go to End', category: 'Navigation' },
    { key: 'i', handler: () => {}, description: 'Set In Point', category: 'Edit' },
    { key: 'o', handler: () => {}, description: 'Set Out Point', category: 'Edit' },
];

export const SHOT_LIST_SHORTCUTS: ShortcutConfig[] = [
    { key: 'n', handler: () => {}, description: 'New Shot', category: 'Shots' },
    { key: 'g', handler: () => {}, description: 'Generate Selected', category: 'Shots' },
    { key: 'meta+a', handler: () => {}, description: 'Select All', category: 'Selection' },
    { key: 'delete', handler: () => {}, description: 'Delete Selected', category: 'Shots' },
    { key: 'meta+d', handler: () => {}, description: 'Duplicate', category: 'Shots' },
    { key: 'arrowup', handler: () => {}, description: 'Previous Shot', category: 'Navigation' },
    { key: 'arrowdown', handler: () => {}, description: 'Next Shot', category: 'Navigation' },
    { key: 'enter', handler: () => {}, description: 'Edit Shot', category: 'Shots' },
];

// ============================================================================
// SHORTCUT DISPLAY HELPERS
// ============================================================================

export function formatShortcut(combo: string): string {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
    
    return combo
        .split('+')
        .map(part => {
            switch (part.toLowerCase()) {
                case 'meta':
                case 'cmd':
                case 'command':
                    return isMac ? '⌘' : 'Ctrl';
                case 'ctrl':
                case 'control':
                    return isMac ? '⌃' : 'Ctrl';
                case 'alt':
                case 'option':
                    return isMac ? '⌥' : 'Alt';
                case 'shift':
                    return isMac ? '⇧' : 'Shift';
                case 'enter':
                case 'return':
                    return '↵';
                case 'escape':
                    return 'Esc';
                case 'arrowup':
                    return '↑';
                case 'arrowdown':
                    return '↓';
                case 'arrowleft':
                    return '←';
                case 'arrowright':
                    return '→';
                case 'space':
                    return 'Space';
                case 'delete':
                case 'backspace':
                    return isMac ? '⌫' : 'Del';
                default:
                    return part.toUpperCase();
            }
        })
        .join(isMac ? '' : '+');
}

export function ShortcutKey({ combo, className = '' }: { combo: string; className?: string }) {
    const formatted = formatShortcut(combo);
    const parts = formatted.split(/(?=[⌘⌃⌥⇧↵↑↓←→⌫])|(?<=[⌘⌃⌥⇧↵↑↓←→⌫])/);
    
    return (
        <span className={`inline-flex items-center gap-0.5 ${className}`}>
            {parts.map((part, i) => (
                <kbd
                    key={i}
                    className="px-1.5 py-0.5 text-xs font-mono bg-white/10 border border-white/20 rounded text-gray-300"
                >
                    {part}
                </kbd>
            ))}
        </span>
    );
}

export default useKeyboardShortcuts;
