"use client";

import React from 'react';
import { HttpRenderer } from '@/components/reactvideoeditor/pro/utils/http-renderer';
import { ReactVideoEditor } from '@/components/reactvideoeditor/pro/components/react-video-editor';
import { createPexelsVideoAdaptor } from '@/components/reactvideoeditor/pro/adaptors/pexels-video-adaptor';
import { createPexelsImageAdaptor } from '@/components/reactvideoeditor/pro/adaptors/pexels-image-adaptor';
import { CustomTheme } from '@/components/reactvideoeditor/pro/hooks/use-extended-theme-switcher';
import { MobileWarningModal } from '@/components/reactvideoeditor/pro/components/shared/mobile-warning-modal';
import { ProjectLoadConfirmModal } from '@/components/reactvideoeditor/pro/components/shared/project-load-confirm-modal';
import { useProjectStateFromUrl } from '@/components/reactvideoeditor/pro/hooks/use-project-state-from-url';

// Constants
const SHOW_MOBILE_WARNING = true;

interface SaboteurEditorProps {
    projectId: string;
}

export default function SaboteurEditor({ projectId }: SaboteurEditorProps) {
    /**
     * Load project state from API via URL parameter or prop.
     */
    const { overlays, aspectRatio, isLoading, showModal, onConfirmLoad, onCancelLoad } =
        useProjectStateFromUrl('projectId', projectId);

    // Handle theme changes
    const handleThemeChange = (themeId: string) => {
        console.log('Theme changed to:', themeId);
    };

    // Define available themes
    const availableThemes: CustomTheme[] = [
        {
            id: 'rve',
            name: 'RVE',
            className: 'rve',
            color: '#3E8AF5'
        },
    ];


    // Default renderer uses NextJS API routes
    const ssrRenderer = React.useMemo(() =>
        new HttpRenderer('/api/latest/ssr', {
            type: 'ssr',
            entryPoint: '/api/latest/ssr'
        }), []
    );

    return (
        <div className="w-full h-full relative">
            <MobileWarningModal show={SHOW_MOBILE_WARNING} />
            <ProjectLoadConfirmModal
                isVisible={showModal}
                onConfirm={onConfirmLoad}
                onCancel={onCancelLoad}
            />
            <ReactVideoEditor
                projectId={projectId}
                defaultOverlays={overlays as any}
                defaultAspectRatio={aspectRatio || undefined}
                isLoadingProject={isLoading}
                fps={30}
                renderer={ssrRenderer}
                disabledPanels={[]}
                availableThemes={availableThemes}
                defaultTheme="dark"
                adaptors={{
                    video: [createPexelsVideoAdaptor('CEOcPegZJRoNztih7auwNoFZmIFTmlYoZTI0NgTRCUxkFhXORBhERORM')],
                    images: [createPexelsImageAdaptor('CEOcPegZJRoNztih7auwNoFZmIFTmlYoZTI0NgTRCUxkFhXORBhERORM')],
                }}
                onThemeChange={handleThemeChange}
                showDefaultThemes={true}
                sidebarWidth="clamp(350px, 25vw, 500px)"
                sidebarIconWidth="57.6px"
                showIconTitles={false}
            />
        </div>
    );
}
