// ============================================================================
// DATA BARREL EXPORT
// Centralized data exports
// ============================================================================

// Reference library data
export {
    MOCK_IMAGES,
    MOCK_COLLECTIONS,
    MOODS,
    LIGHTING,
    type ReferenceImage,
    type Collection,
} from './referenceLibraryData';

// Project templates
export {
    PROJECT_TEMPLATES,
    TEMPLATE_CATEGORIES,
    TEMPLATE_ICONS,
    getTemplatesByCategory,
    getTemplateById,
    getTemplateIcon,
    type ProjectTemplate,
    type TemplateCategory,
} from './projectTemplates';

// Marketing page data
export {
    SECTIONS as MARKETING_SECTIONS,
    INITIAL_HERO,
    INITIAL_FEATURES,
    INITIAL_TESTIMONIALS,
    INITIAL_PRICING,
    INITIAL_FAQS,
    INITIAL_SOCIAL_PROOF,
    INITIAL_ANNOUNCEMENTS,
    INITIAL_FOOTER_COLUMNS,
    INITIAL_SEO,
    FEATURE_ICONS as MARKETING_FEATURE_ICONS,
    FAQ_CATEGORIES,
    type HeroSection,
    type Feature,
    type Testimonial,
    type PricingTier,
    type FAQ,
    type SocialProof,
    type Announcement,
    type FooterColumn,
    type FooterLink,
    type SEOSettings,
    type SectionId,
} from './marketingPageData';

// Theme presets data
export {
    THEME_PRESETS,
    ACCENT_COLORS,
    FONT_OPTIONS,
    DEFAULT_THEME_SETTINGS,
    THEME_CATEGORIES,
    getPresetById,
    getPresetsByCategory,
    getAccentById,
    getFontById,
    isLightTheme,
    type ThemePreset,
    type AccentColor,
    type FontOption,
    type ThemeSettings,
} from './themePresets';
