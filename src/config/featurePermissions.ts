// ============================================================================
// FEATURE PERMISSIONS CONFIG
// Defines which subscription plans can access which features
// ============================================================================

export type PlanTier = 'free' | 'pro' | 'studio' | 'enterprise';

export interface PlanInfo {
    id: PlanTier;
    name: string;
    price: number;
    creditsPerMonth: number;
    color: string;
    icon: string;
    tagline: string;
}

export interface FeaturePermission {
    id: string;
    name: string;
    description: string;
    requiredPlan: PlanTier;
    category: 'generation' | 'export' | 'collaboration' | 'ai-tools' | 'library' | 'navigation';
}

// Plan hierarchy - higher number = more access
export const PLAN_HIERARCHY: Record<PlanTier, number> = {
    free: 0,
    pro: 1,
    studio: 2,
    enterprise: 3,
};

// Plan details for display
export const PLANS: PlanInfo[] = [
    {
        id: 'free',
        name: 'Starter',
        price: 0,
        creditsPerMonth: 50,
        color: '#6b7280',
        icon: '🌱',
        tagline: 'Perfect for exploring'
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 29,
        creditsPerMonth: 500,
        color: '#3b82f6',
        icon: '⚡',
        tagline: 'For serious creators'
    },
    {
        id: 'studio',
        name: 'Studio',
        price: 99,
        creditsPerMonth: 2500,
        color: '#8b5cf6',
        icon: '🎬',
        tagline: 'For production teams'
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 499,
        creditsPerMonth: 15000,
        color: '#f59e0b',
        icon: '🏢',
        tagline: 'For large organizations'
    },
];

// All feature permissions
export const FEATURE_PERMISSIONS: FeaturePermission[] = [
    // =========================================================================
    // FREE TIER (Starter) - Essential features to get started
    // =========================================================================
    
    // Navigation
    { id: 'nav-dashboard', name: 'Dashboard', description: 'Project overview and stats', requiredPlan: 'free', category: 'navigation' },
    { id: 'nav-pre-production', name: 'Pre-Production', description: 'Script and planning tools', requiredPlan: 'free', category: 'navigation' },
    { id: 'nav-production', name: 'Production', description: 'Shot generation workspace', requiredPlan: 'free', category: 'navigation' },
    { id: 'nav-settings', name: 'Settings', description: 'Account settings', requiredPlan: 'free', category: 'navigation' },
    
    // Generation
    { id: 'basic-generation', name: 'Basic Generation', description: 'Generate shots up to 720p', requiredPlan: 'free', category: 'generation' },
    { id: 'shot-list', name: 'Shot List', description: 'Create and manage shot lists', requiredPlan: 'free', category: 'generation' },
    { id: 'basic-styles', name: 'Basic Styles', description: 'Access to 10 core visual styles', requiredPlan: 'free', category: 'generation' },
    
    // Library
    { id: 'reference-library', name: 'Reference Library', description: 'Browse and save reference images', requiredPlan: 'free', category: 'library' },
    
    // Export
    { id: 'basic-export', name: 'Basic Export', description: 'Export with watermark (720p)', requiredPlan: 'free', category: 'export' },
    
    // =========================================================================
    // PRO TIER - Full creative toolkit
    // =========================================================================
    
    // Navigation
    { id: 'nav-post-production', name: 'Post-Production', description: 'Video editor and timeline', requiredPlan: 'pro', category: 'navigation' },
    { id: 'nav-asset-vault', name: 'Asset Vault', description: 'Full asset management', requiredPlan: 'pro', category: 'navigation' },
    
    // Generation
    { id: 'hd-generation', name: 'HD Generation', description: 'Generate shots up to 1080p', requiredPlan: 'pro', category: 'generation' },
    { id: 'style-presets', name: 'All Style Presets', description: 'Access to 60+ visual styles', requiredPlan: 'pro', category: 'generation' },
    { id: 'batch-generation', name: 'Batch Generation', description: 'Generate multiple shots at once', requiredPlan: 'pro', category: 'generation' },
    { id: 'prompt-enhancement', name: 'AI Prompt Enhancement', description: 'AI-powered prompt suggestions', requiredPlan: 'pro', category: 'generation' },
    
    // AI Tools
    { id: 'voice-generation', name: 'Voice Generation', description: 'Text-to-speech narration', requiredPlan: 'pro', category: 'ai-tools' },
    { id: 'music-generation', name: 'AI Music', description: 'Generate background music', requiredPlan: 'pro', category: 'ai-tools' },
    { id: 'auto-captions', name: 'Auto Captions', description: 'AI-generated subtitles', requiredPlan: 'pro', category: 'ai-tools' },
    
    // Library
    { id: 'props-database', name: 'Props Database', description: 'Full props management system', requiredPlan: 'pro', category: 'library' },
    { id: 'vehicles-database', name: 'Vehicles Database', description: 'Vehicle asset library', requiredPlan: 'pro', category: 'library' },
    { id: 'equipment-database', name: 'Equipment Database', description: 'Camera and lighting presets', requiredPlan: 'pro', category: 'library' },
    
    // Export
    { id: 'watermark-free', name: 'Watermark-Free Export', description: 'Export without watermarks', requiredPlan: 'pro', category: 'export' },
    { id: 'hd-export', name: 'HD Export', description: 'Export up to 1080p', requiredPlan: 'pro', category: 'export' },
    
    // =========================================================================
    // STUDIO TIER - Professional production features
    // =========================================================================
    
    // Navigation
    { id: 'nav-repair-studio', name: 'Repair Studio', description: 'AI-powered image editing', requiredPlan: 'studio', category: 'navigation' },
    
    // Generation
    { id: '4k-generation', name: '4K Generation', description: 'Generate shots up to 4K', requiredPlan: 'studio', category: 'generation' },
    { id: 'character-consistency', name: 'Character Consistency', description: 'AI character tracking across shots', requiredPlan: 'studio', category: 'generation' },
    { id: 'custom-styles', name: 'Custom Styles', description: 'Create and save custom styles', requiredPlan: 'studio', category: 'generation' },
    
    // AI Tools
    { id: 'voice-cloning', name: 'Voice Cloning', description: 'Clone voices from samples', requiredPlan: 'studio', category: 'ai-tools' },
    { id: 'repair-studio', name: 'Repair Studio', description: 'AI inpainting and editing', requiredPlan: 'studio', category: 'ai-tools' },
    { id: 'script-assist', name: 'AI Script Assistant', description: 'AI-powered script writing', requiredPlan: 'studio', category: 'ai-tools' },
    { id: 'translation', name: 'AI Translation', description: 'Translate subtitles to 50+ languages', requiredPlan: 'studio', category: 'ai-tools' },
    
    // Collaboration
    { id: 'team-members', name: 'Team Members', description: 'Invite up to 5 team members', requiredPlan: 'studio', category: 'collaboration' },
    { id: 'approval-workflow', name: 'Approval Workflow', description: 'Review and approve shots', requiredPlan: 'studio', category: 'collaboration' },
    { id: 'comments', name: 'Comments & Annotations', description: 'Leave feedback on shots', requiredPlan: 'studio', category: 'collaboration' },
    { id: 'version-history', name: 'Version History', description: 'Full project versioning', requiredPlan: 'studio', category: 'collaboration' },
    
    // Export
    { id: '4k-export', name: '4K Export', description: 'Export up to 4K resolution', requiredPlan: 'studio', category: 'export' },
    { id: 'platform-export', name: 'Platform Export', description: 'Optimized exports for social platforms', requiredPlan: 'studio', category: 'export' },
    
    // =========================================================================
    // ENTERPRISE TIER - Full production suite
    // =========================================================================
    
    // Generation
    { id: '8k-generation', name: '8K Generation', description: 'Generate shots up to 8K', requiredPlan: 'enterprise', category: 'generation' },
    { id: 'custom-models', name: 'Custom AI Models', description: 'Train on your own visual data', requiredPlan: 'enterprise', category: 'generation' },
    { id: 'priority-queue', name: 'Priority Queue', description: 'Skip the generation queue', requiredPlan: 'enterprise', category: 'generation' },
    
    // Collaboration
    { id: 'unlimited-team', name: 'Unlimited Team', description: 'Unlimited team members', requiredPlan: 'enterprise', category: 'collaboration' },
    { id: 'sso', name: 'SSO Integration', description: 'Single sign-on with your IdP', requiredPlan: 'enterprise', category: 'collaboration' },
    { id: 'audit-logs', name: 'Audit Logs', description: 'Track all team activity', requiredPlan: 'enterprise', category: 'collaboration' },
    
    // Export
    { id: '8k-export', name: '8K Export', description: 'Export up to 8K resolution', requiredPlan: 'enterprise', category: 'export' },
    { id: 'api-access', name: 'API Access', description: 'Full REST API for integrations', requiredPlan: 'enterprise', category: 'export' },
    { id: 'white-label', name: 'White Label', description: 'Custom branding on exports', requiredPlan: 'enterprise', category: 'export' },
    { id: 'raw-export', name: 'RAW Export', description: 'Export raw AI outputs', requiredPlan: 'enterprise', category: 'export' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a plan has access to a specific feature
 */
export function canAccessFeature(userPlan: PlanTier, featureId: string): boolean {
    const feature = FEATURE_PERMISSIONS.find(f => f.id === featureId);
    if (!feature) return true; // If feature not defined, allow access
    return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[feature.requiredPlan];
}

/**
 * Get the required plan for a feature
 */
export function getRequiredPlan(featureId: string): PlanTier | null {
    const feature = FEATURE_PERMISSIONS.find(f => f.id === featureId);
    return feature?.requiredPlan ?? null;
}

/**
 * Get all features available for a plan
 */
export function getFeaturesForPlan(plan: PlanTier): FeaturePermission[] {
    return FEATURE_PERMISSIONS.filter(f => PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY[f.requiredPlan]);
}

/**
 * Get features that would be unlocked by upgrading to a plan
 */
export function getUpgradeFeatures(currentPlan: PlanTier, targetPlan: PlanTier): FeaturePermission[] {
    return FEATURE_PERMISSIONS.filter(f => 
        PLAN_HIERARCHY[currentPlan] < PLAN_HIERARCHY[f.requiredPlan] &&
        PLAN_HIERARCHY[targetPlan] >= PLAN_HIERARCHY[f.requiredPlan]
    );
}

/**
 * Get plan info by ID
 */
export function getPlanInfo(planId: PlanTier): PlanInfo | undefined {
    return PLANS.find(p => p.id === planId);
}

/**
 * Get the next upgrade plan
 */
export function getNextPlan(currentPlan: PlanTier): PlanInfo | null {
    const currentIndex = PLANS.findIndex(p => p.id === currentPlan);
    if (currentIndex === -1 || currentIndex === PLANS.length - 1) return null;
    return PLANS[currentIndex + 1];
}

/**
 * Group features by category
 */
export function getFeaturesByCategory(plan?: PlanTier): Record<string, FeaturePermission[]> {
    const features = plan ? getFeaturesForPlan(plan) : FEATURE_PERMISSIONS;
    return features.reduce((acc, feature) => {
        if (!acc[feature.category]) acc[feature.category] = [];
        acc[feature.category].push(feature);
        return acc;
    }, {} as Record<string, FeaturePermission[]>);
}
