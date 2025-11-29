// ============================================================================
// UI COMPONENTS BARREL EXPORT
// ============================================================================

// Status & Badges
export { default as StatusBadge } from './StatusBadge';
export type { StatusBadgeProps, BadgeVariant } from './StatusBadge';

// Modals
export { default as ModalWrapper, ModalButton } from './ModalWrapper';

// Data Display
export { default as DataGrid } from './DataGrid';
export type { DataGridColumn, DataGridProps } from './DataGrid';

// Form Components
export {
    SearchInput,
    TextInput,
    TextArea,
    Select,
    Checkbox,
    Toggle,
    RadioGroup,
} from './FormComponents';

// Re-exports for convenience
export { default as OfflineBanner } from './OfflineBanner';
export { default as ThemeToggle } from './ThemeToggle';
export { default as CommandPalette } from './CommandPalette';
