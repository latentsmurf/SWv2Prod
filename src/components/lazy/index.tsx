'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// ============================================================================
// LOADING FALLBACK
// ============================================================================

const LoadingFallback = ({ message = 'Loading...' }: { message?: string }) => (
    <div className="flex items-center justify-center p-8">
        <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-3" />
            <p className="text-sm text-gray-500">{message}</p>
        </div>
    </div>
);

// ============================================================================
// AI TOOLS - Heavy components with AI integrations
// ============================================================================

export const LazyVoiceCloning = dynamic(
    () => import('@/components/ai/VoiceCloning'),
    { 
        loading: () => <LoadingFallback message="Loading Voice Studio..." />,
        ssr: false 
    }
);

export const LazyMusicGenerator = dynamic(
    () => import('@/components/ai/MusicGenerator'),
    { 
        loading: () => <LoadingFallback message="Loading Music Generator..." />,
        ssr: false 
    }
);

export const LazySmartPromptEnhancer = dynamic(
    () => import('@/components/ai/SmartPromptEnhancer'),
    { 
        loading: () => <LoadingFallback message="Loading AI Enhancer..." />,
        ssr: false 
    }
);

// ============================================================================
// EXPORT TOOLS - Heavy components with export logic
// ============================================================================

export const LazyPlatformExporter = dynamic(
    () => import('@/components/export/PlatformExporter'),
    { 
        loading: () => <LoadingFallback message="Loading Export Tools..." />,
        ssr: false 
    }
);

export const LazySubtitleExporter = dynamic(
    () => import('@/components/export/SubtitleExporter'),
    { 
        loading: () => <LoadingFallback message="Loading Subtitle Tools..." />,
        ssr: false 
    }
);

// ============================================================================
// PRODUCTION COMPONENTS - Medium-weight components
// ============================================================================

export const LazyCharacterConsistencyPanel = dynamic(
    () => import('@/components/production/CharacterConsistencyPanel'),
    { 
        loading: () => <LoadingFallback message="Loading Character Panel..." />,
        ssr: false 
    }
);

export const LazyScriptToShotPipeline = dynamic(
    () => import('@/components/production/ScriptToShotPipeline'),
    { 
        loading: () => <LoadingFallback message="Loading Pipeline..." />,
        ssr: false 
    }
);

export const LazyTimelinePreview = dynamic(
    () => import('@/components/production/TimelinePreview'),
    { 
        loading: () => <LoadingFallback message="Loading Timeline..." />,
        ssr: false 
    }
);

export const LazyImageEditingStudio = dynamic(
    () => import('@/components/production/ImageEditingStudio'),
    { 
        loading: () => <LoadingFallback message="Loading Repair Studio..." />,
        ssr: false 
    }
);

// ============================================================================
// COLLABORATION COMPONENTS
// ============================================================================

export const LazyApprovalWorkflow = dynamic(
    () => import('@/components/collaboration/ApprovalWorkflow'),
    { 
        loading: () => <LoadingFallback message="Loading Approval Workflow..." />,
        ssr: false 
    }
);

export const LazyProjectVersioning = dynamic(
    () => import('@/components/project/ProjectVersioning'),
    { 
        loading: () => <LoadingFallback message="Loading Version History..." />,
        ssr: false 
    }
);

// ============================================================================
// POST-PRODUCTION COMPONENTS
// ============================================================================

export const LazyColorGradingManager = dynamic(
    () => import('@/components/post-production/ColorGradingManager'),
    { 
        loading: () => <LoadingFallback message="Loading Color Grading..." />,
        ssr: false 
    }
);

export const LazySoundDesignPanel = dynamic(
    () => import('@/components/post-production/SoundDesignPanel'),
    { 
        loading: () => <LoadingFallback message="Loading Sound Design..." />,
        ssr: false 
    }
);

// ============================================================================
// ADMIN COMPONENTS - Heavy data-driven pages
// ============================================================================

export const LazyEmailManagement = dynamic(
    () => import('@/app/admin/email/page'),
    { 
        loading: () => <LoadingFallback message="Loading Email Management..." />,
        ssr: false 
    }
);

export const LazyBlogAdmin = dynamic(
    () => import('@/app/admin/blog/page'),
    { 
        loading: () => <LoadingFallback message="Loading Blog Admin..." />,
        ssr: false 
    }
);

// ============================================================================
// EXPORT ALL
// ============================================================================

export { LoadingFallback };
