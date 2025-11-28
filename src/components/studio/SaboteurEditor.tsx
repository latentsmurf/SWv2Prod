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
import { useEditorPanel } from '@/components/layout/ProductionLayout';
import { IntegratedEditorSidebar } from './IntegratedEditorSidebar';

// Constants
const SHOW_MOBILE_WARNING = true;

interface SaboteurEditorProps {
    projectId: string;
    /** Whether to show the RVE sidebar (default: false for integrated mode) */
    showSidebar?: boolean;
}

export default function SaboteurEditor({ projectId, showSidebar = false }: SaboteurEditorProps) {
    const editorPanelContext = useEditorPanel();

    /**
     * Load project state from API via URL parameter or prop.
     */
    const { overlays, aspectRatio, isLoading, showModal, onConfirmLoad, onCancelLoad } =
        useProjectStateFromUrl('projectId', projectId);

    // Handle theme changes
    const handleThemeChange = (themeId: string) => {
        console.log('Theme changed to:', themeId);
    };

    // Define SceneWeaver theme
    const availableThemes: CustomTheme[] = [
        {
            id: 'sceneweaver',
            name: 'SceneWeaver',
            className: 'sceneweaver',
            color: '#EBFF00'
        },
    ];

    // Default renderer uses NextJS API routes
    const ssrRenderer = React.useMemo(() =>
        new HttpRenderer('/api/latest/ssr', {
            type: 'ssr',
            entryPoint: '/api/latest/ssr'
        }), []
    );

    // If we have an editor panel context (integrated mode), use the IntegratedEditorSidebar
    const customSidebar = editorPanelContext ? (
        <IntegratedEditorSidebar activePanel={editorPanelContext.activePanel} />
    ) : undefined;

    return (
        <div className="w-full h-full relative bg-[#050505]">
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
                hideThemeToggle={true}
                showSidebar={editorPanelContext ? !!editorPanelContext.activePanel : showSidebar}
                customSidebar={customSidebar}
                adaptors={{
                    video: [createPexelsVideoAdaptor('CEOcPegZJRoNztih7auwNoFZmIFTmlYoZTI0NgTRCUxkFhXORBhERORM')],
                    images: [createPexelsImageAdaptor('CEOcPegZJRoNztih7auwNoFZmIFTmlYoZTI0NgTRCUxkFhXORBhERORM')],
                }}
                onThemeChange={handleThemeChange}
                showDefaultThemes={false}
                sidebarWidth="clamp(280px, 22vw, 380px)"
                sidebarIconWidth="0px"
                showIconTitles={false}
            />
        </div>
    );
}
