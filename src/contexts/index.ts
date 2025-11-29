// ============================================================================
// CONTEXTS BARREL EXPORT
// ============================================================================

// Auth Context
export { AuthProvider, useAuth } from './AuthContext';

// Subscription Context
export { SubscriptionProvider, useSubscription } from './SubscriptionContext';

// Notification Context  
export { NotificationProvider, useNotification } from './NotificationContext';

// Theme Customization Context
export { 
    ThemeCustomizationProvider, 
    useThemeCustomization,
    THEME_PRESETS,
    ACCENT_COLORS,
    FONT_OPTIONS,
    DEFAULT_THEME_SETTINGS,
    type ThemePreset,
    type AccentColor,
    type FontOption,
    type ThemeSettings,
} from './ThemeCustomizationContext';
