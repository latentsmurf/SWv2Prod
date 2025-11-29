'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// USE LOCAL STORAGE HOOK
// Persists state to localStorage with SSR support
// ============================================================================

/**
 * Hook for persisting state to localStorage
 * Handles SSR safely and provides sync across tabs
 * 
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'dark');
 * const [favorites, setFavorites] = useLocalStorage<string[]>('favorites', []);
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize from localStorage on mount (client-side only)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
        }
        setIsInitialized(true);
    }, [key]);

    // Listen for changes in other tabs
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue) {
                try {
                    setStoredValue(JSON.parse(e.newValue));
                } catch {
                    // Ignore parse errors
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key]);

    // Return a wrapped version of useState's setter function
    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        try {
            // Allow value to be a function like useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            
            setStoredValue(valueToStore);
            
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    // Remove item from storage
    const removeValue = useCallback(() => {
        try {
            setStoredValue(initialValue);
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }
        } catch (error) {
            console.warn(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
}

// ============================================================================
// USE SESSION STORAGE HOOK
// Same as useLocalStorage but with sessionStorage
// ============================================================================

export function useSessionStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const item = window.sessionStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.warn(`Error reading sessionStorage key "${key}":`, error);
        }
    }, [key]);

    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            
            if (typeof window !== 'undefined') {
                window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting sessionStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    const removeValue = useCallback(() => {
        try {
            setStoredValue(initialValue);
            if (typeof window !== 'undefined') {
                window.sessionStorage.removeItem(key);
            }
        } catch (error) {
            console.warn(`Error removing sessionStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
}

// ============================================================================
// STORAGE KEYS CONSTANTS
// Centralized storage key definitions
// ============================================================================

export const STORAGE_KEYS = {
    // User preferences
    THEME: 'sw_theme',
    SIDEBAR_COLLAPSED: 'sw_sidebar_collapsed',
    VIEW_MODE: 'sw_view_mode',
    
    // Onboarding
    ONBOARDING_COMPLETED: 'sw_onboarding_completed',
    ONBOARDING_STEP: 'sw_onboarding_step',
    
    // Demo/Subscription
    DEMO_PLAN: 'sw_demo_plan',
    
    // Favorites
    FAVORITES: 'sw_favorites',
    RECENT_PROJECTS: 'sw_recent_projects',
    
    // Editor settings
    EDITOR_ZOOM: 'sw_editor_zoom',
    EDITOR_GRID: 'sw_editor_grid',
    EDITOR_SNAP: 'sw_editor_snap',
    
    // Feature flags
    FEATURE_FLAGS: 'sw_feature_flags',
} as const;

export default useLocalStorage;
