"use client";

import React from 'react';
import { ChevronsLeft } from 'lucide-react';

// Import overlay panels from RVE
import { VideoOverlayPanel } from '@/components/reactvideoeditor/pro/components/overlay/video/video-overlay-panel';
import { TextOverlaysPanel } from '@/components/reactvideoeditor/pro/components/overlay/text/text-overlays-panel';
import SoundsOverlayPanel from '@/components/reactvideoeditor/pro/components/overlay/sounds/sounds-overlay-panel';
import { CaptionsOverlayPanel } from '@/components/reactvideoeditor/pro/components/overlay/captions/captions-overlay-panel';
import { ImageOverlayPanel } from '@/components/reactvideoeditor/pro/components/overlay/images/image-overlay-panel';
import { LocalMediaPanel } from '@/components/reactvideoeditor/pro/components/overlay/local-media/local-media-panel';
import { StickersPanel } from '@/components/reactvideoeditor/pro/components/overlay/stickers/stickers-panel';
import { TemplateOverlayPanel } from '@/components/reactvideoeditor/pro/components/overlay/templates/template-overlay-panel';
import { SettingsPanel } from '@/components/reactvideoeditor/pro/components/settings/settings-panel';

// Import UI components
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
} from '@/components/reactvideoeditor/pro/components/ui/sidebar';
import { Button } from '@/components/reactvideoeditor/pro/components/ui/button';
import { useEditorPanel } from '@/components/layout/ProductionLayout';
import { useEditorContext } from '@/components/reactvideoeditor/pro/contexts/editor-context';

type EditorPanelType = 'video' | 'text' | 'audio' | 'caption' | 'image' | 'sticker' | 'uploads' | 'templates' | 'settings' | null;

interface IntegratedEditorSidebarProps {
    activePanel: EditorPanelType;
}

const getPanelTitle = (panel: EditorPanelType): string => {
    switch (panel) {
        case 'video': return 'Video';
        case 'text': return 'Text';
        case 'audio': return 'Audio';
        case 'caption': return 'Captions';
        case 'image': return 'Images';
        case 'sticker': return 'Stickers';
        case 'uploads': return 'Uploads';
        case 'templates': return 'Templates';
        case 'settings': return 'Settings';
        default: return '';
    }
};

export const IntegratedEditorSidebar: React.FC<IntegratedEditorSidebarProps> = ({ activePanel }) => {
    const editorPanelContext = useEditorPanel();
    const editorContext = useEditorContext();
    
    const selectedOverlay = editorContext?.selectedOverlayId !== null 
        ? editorContext?.overlays.find(overlay => overlay.id === editorContext.selectedOverlayId) 
        : null;

    // Check if we should show back button (when editing a specific overlay)
    const shouldShowBackButton = selectedOverlay !== null;

    const renderActivePanel = () => {
        switch (activePanel) {
            case 'video':
                return <VideoOverlayPanel />;
            case 'text':
                return <TextOverlaysPanel />;
            case 'audio':
                return <SoundsOverlayPanel />;
            case 'caption':
                return <CaptionsOverlayPanel />;
            case 'image':
                return <ImageOverlayPanel />;
            case 'sticker':
                return <StickersPanel />;
            case 'uploads':
                return <LocalMediaPanel />;
            case 'templates':
                return <TemplateOverlayPanel />;
            case 'settings':
                return <SettingsPanel />;
            default:
                return null;
        }
    };

    if (!activePanel) return null;

    return (
        <Sidebar collapsible="none" className="flex-1 bg-[#0a0a0a] border-r border-white/5">
            <SidebarHeader className="gap-3.5 border-b border-white/5 px-4 py-3">
                <div className="flex w-full items-center justify-between">
                    <h3 className="font-medium text-sm text-white/90">
                        {getPanelTitle(activePanel)}
                    </h3>
                    <div className="flex items-center gap-2">
                        {shouldShowBackButton && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-zinc-400 hover:text-white"
                                onClick={() => editorContext?.setSelectedOverlayId(null)}
                                aria-label="Back"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-zinc-400 hover:text-white"
                            onClick={() => editorPanelContext?.setActivePanel(null)}
                            aria-label="Close panel"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-[#0a0a0a] px-2 pt-1">
                {renderActivePanel()}
            </SidebarContent>
        </Sidebar>
    );
};

