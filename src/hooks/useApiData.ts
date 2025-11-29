'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface UseApiDataOptions<T> {
    /** Initial data while loading */
    initialData?: T;
    /** Skip automatic fetch on mount */
    skip?: boolean;
    /** Dependencies that trigger refetch when changed */
    deps?: unknown[];
    /** Transform the response data */
    transform?: (data: unknown) => T;
    /** Called when fetch succeeds */
    onSuccess?: (data: T) => void;
    /** Called when fetch fails */
    onError?: (error: Error) => void;
}

interface UseApiDataReturn<T> {
    /** The fetched data */
    data: T | null;
    /** Loading state */
    loading: boolean;
    /** Error message if fetch failed */
    error: string | null;
    /** Manually trigger a refetch */
    refetch: () => Promise<void>;
    /** Set data manually */
    setData: React.Dispatch<React.SetStateAction<T | null>>;
    /** Clear error state */
    clearError: () => void;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook for fetching data from API endpoints
 * Reduces boilerplate for common data fetching patterns
 * 
 * @example
 * // Basic usage
 * const { data, loading, error } = useApiData<Project[]>('/api/projects');
 * 
 * @example
 * // With options
 * const { data, loading, refetch } = useApiData<User>('/api/user', {
 *   transform: (data) => data.user,
 *   onSuccess: (user) => console.log('Loaded:', user.name),
 * });
 * 
 * @example
 * // With query params
 * const { data } = useApiData<StylePreset[]>(
 *   `/api/style_presets?category=${category}`,
 *   { deps: [category] }
 * );
 */
export function useApiData<T>(
    url: string | null,
    options: UseApiDataOptions<T> = {}
): UseApiDataReturn<T> {
    const {
        initialData,
        skip = false,
        deps = [],
        transform,
        onSuccess,
        onError,
    } = options;

    const [data, setData] = useState<T | null>(initialData ?? null);
    const [loading, setLoading] = useState(!skip && url !== null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!url) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const rawData = await response.json();
            const transformedData = transform ? transform(rawData) : rawData as T;
            
            setData(transformedData);
            onSuccess?.(transformedData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            onError?.(err instanceof Error ? err : new Error(errorMessage));
        } finally {
            setLoading(false);
        }
    }, [url, transform, onSuccess, onError]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Initial fetch and refetch on dependency changes
    useEffect(() => {
        if (!skip && url) {
            fetchData();
        }
    }, [url, skip, ...deps]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        setData,
        clearError,
    };
}

// ============================================================================
// ADDITIONAL HOOKS
// ============================================================================

/**
 * Hook for fetching multiple endpoints in parallel
 * 
 * @example
 * const { data, loading } = useParallelApiData({
 *   projects: '/api/projects',
 *   assets: '/api/assets',
 *   users: '/api/users',
 * });
 */
export function useParallelApiData<T extends Record<string, unknown>>(
    endpoints: Record<keyof T, string | null>
): {
    data: { [K in keyof T]: T[K] | null };
    loading: boolean;
    errors: { [K in keyof T]?: string };
    refetch: () => Promise<void>;
} {
    const keys = Object.keys(endpoints) as (keyof T)[];
    
    const [data, setData] = useState<{ [K in keyof T]: T[K] | null }>(
        () => keys.reduce((acc, key) => ({ ...acc, [key]: null }), {} as { [K in keyof T]: T[K] | null })
    );
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<{ [K in keyof T]?: string }>({});

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setErrors({});

        const results = await Promise.allSettled(
            keys.map(async (key) => {
                const url = endpoints[key];
                if (!url) return { key, data: null };
                
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return { key, data: await response.json() };
            })
        );

        const newData: Partial<{ [K in keyof T]: T[K] | null }> = {};
        const newErrors: { [K in keyof T]?: string } = {};

        results.forEach((result, index) => {
            const key = keys[index];
            if (result.status === 'fulfilled') {
                newData[key] = result.value.data;
            } else {
                newErrors[key] = result.reason?.message || 'Failed to fetch';
            }
        });

        setData(prev => ({ ...prev, ...newData }));
        setErrors(newErrors);
        setLoading(false);
    }, [endpoints]);

    useEffect(() => {
        fetchAll();
    }, []);

    return { data, loading, errors, refetch: fetchAll };
}

/**
 * Hook for mutation operations (POST, PUT, DELETE)
 * 
 * @example
 * const { mutate, loading } = useApiMutation<Project>('/api/projects');
 * 
 * const handleCreate = async () => {
 *   const project = await mutate({ name: 'New Project' });
 * };
 */
export function useApiMutation<TData, TPayload = unknown>(
    url: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
): {
    mutate: (payload?: TPayload) => Promise<TData>;
    loading: boolean;
    error: string | null;
    reset: () => void;
} {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mutate = useCallback(async (payload?: TPayload): Promise<TData> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: payload ? JSON.stringify(payload) : undefined,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [url, method]);

    const reset = useCallback(() => {
        setError(null);
    }, []);

    return { mutate, loading, error, reset };
}

// Default export
export default useApiData;
