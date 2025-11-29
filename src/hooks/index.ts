// ============================================================================
// HOOKS BARREL EXPORT
// Central export for all custom hooks
// ============================================================================

// Data fetching hooks
export { 
    useApiData, 
    useParallelApiData, 
    useApiMutation 
} from './useApiData';

// Storage hooks
export {
    useLocalStorage,
    useSessionStorage,
    STORAGE_KEYS,
} from './useLocalStorage';

// Default export
export { default } from './useApiData';
