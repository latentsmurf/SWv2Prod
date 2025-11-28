'use client';

import React, { useEffect, useState } from 'react';
import { ReactVideoEditor } from './components/react-video-editor';
import { OverlayType, Overlay } from './types';
import { VideoRenderer, RenderParams, ProgressParams, ProgressResponse, RenderResponse } from './types/renderer';
import { v4 as uuidv4 } from 'uuid';

// Dummy Renderer
const dummyRenderer: VideoRenderer = {
    renderVideo: async (params: RenderParams): Promise<RenderResponse> => {
        console.log("Rendering video with params:", params);
        return { renderId: "dummy-render-id", bucketName: "dummy-bucket" };
    },
    getProgress: async (_params: ProgressParams): Promise<ProgressResponse> => {
        return { type: "progress", progress: 0.5 };
    }
};

interface EditorBridgeProps {
    projectId: string;
}

export default function EditorBridge({ projectId }: EditorBridgeProps) {
    const [overlays, setOverlays] = useState<Overlay[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadShots = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/projects/${projectId}/shots`);
                if (res.ok) {
                    const shots = await res.json();
                    if (shots) {
                        const mappedOverlays = shots.map((shot: { id: string; proxy_path: string; duration?: number }, index: number) => ({
                            id: uuidv4(),
                            type: OverlayType.VIDEO,
                            src: shot.proxy_path,
                            content: "",
                            start: 0,
                            durationInFrames: (shot.duration || 2) * 30,
                            from: index * 60,
                            height: 1080,
                            width: 1920,
                            row: 0,
                            left: 0,
                            top: 0,
                            isDragging: false,
                            rotation: 0,
                            styles: {
                                objectFit: "cover" as const,
                                opacity: 1
                            },
                            metadata: {
                                shot_id: shot.id
                            }
                        }));
                        setOverlays(mappedOverlays);
                    }
                }
            } catch (error) {
                console.error("Error loading shots:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (projectId) {
            loadShots();
        }
    }, [projectId]);

    const handleSave = async (timestamp: number) => {
        console.log("Editor saved at:", timestamp);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen bg-black text-white">Loading Editor...</div>;
    }

    return (
        <div className="h-screen w-full bg-[#050505]">
            <ReactVideoEditor
                projectId={projectId}
                defaultOverlays={overlays}
                renderer={dummyRenderer}
                onSaved={handleSave}
                fps={30}
                autoSaveInterval={30000}
                layout="sidebar"
                showSidebar={true}
                defaultTheme="dark"
                hideThemeToggle={true}
            />
        </div>
    );
}
