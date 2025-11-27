'use client';

import React, { useEffect, useState } from 'react';
import { ReactVideoEditor } from './components/react-video-editor';
import { OverlayType, ClipOverlay, Overlay } from './types';
import { VideoRenderer, RenderParams, ProgressParams, ProgressResponse, RenderResponse } from './types/renderer';
import { Download, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Dummy Renderer
const dummyRenderer: VideoRenderer = {
    renderVideo: async (params: RenderParams): Promise<RenderResponse> => {
        console.log("Rendering video with params:", params);
        return { renderId: "dummy-render-id", bucketName: "dummy-bucket" };
    },
    getProgress: async (params: ProgressParams): Promise<ProgressResponse> => {
        return { type: "progress", progress: 0.5 };
    }
};

interface EditorBridgeProps {
    projectId: string;
}

export default function EditorBridge({ projectId }: EditorBridgeProps) {
    const [overlays, setOverlays] = useState<Overlay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const loadShots = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/projects/${projectId}/shots`);
                if (res.ok) {
                    const shots = await res.json();
                    if (shots) {
                        const mappedOverlays = shots.map((shot: any, index: number) => ({
                            id: uuidv4(),
                            type: OverlayType.VIDEO,
                            src: shot.proxy_path,
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
                                objectFit: "cover",
                                opacity: 1
                            },
                            metadata: {
                                shot_id: shot.id
                            }
                        } as any));
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
        // Save timeline state to backend
        // We'd ideally pass the actual editor state here.
        // For now, we'll just log, but in a real app we'd PUT to /api/projects/{projectId}
        /*
        try {
            await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timeline: overlays }) // Simplified
            });
        } catch (e) {
            console.error("Error saving timeline", e);
        }
        */
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Construct payload from current overlays (mocking full editor state)
            const exportPayload = {
                project_id: projectId,
                editor_state: {
                    tracks: [
                        {
                            id: "main-track",
                            clips: overlays.map(o => ({
                                id: o.id,
                                source: (o as any).src, // Cast to any as src might not be on base Overlay
                                start: o.from / 30, // Frames to seconds
                                duration: o.durationInFrames / 30,
                                offset: 0,
                                metadata: (o as any).metadata
                            }))
                        }
                    ]
                }
            };

            const res = await fetch('/api/export/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(exportPayload)
            });

            const data = await res.json();
            if (data.status === 'success' && data.download_url) {
                window.open(data.download_url, '_blank');
            } else {
                alert("Export failed: " + (data.detail || "Unknown error"));
            }
        } catch (e) {
            console.error("Export error:", e);
            alert("Export failed. See console.");
        }
        setIsExporting(false);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen bg-black text-white">Loading Editor...</div>;
    }

    return (
        <div className="h-screen w-full bg-[#1e1e1e] flex flex-col">
            <div className="h-14 border-b border-white/5 bg-[#1a1a1a] flex items-center justify-between px-4">
                <h2 className="font-bold text-white">Editor</h2>
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium disabled:opacity-50"
                >
                    {isExporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                    Export XML
                </button>
            </div>
            <div className="flex-1 relative">
                <ReactVideoEditor
                    projectId={projectId}
                    defaultOverlays={overlays}
                    renderer={dummyRenderer}
                    onSaved={handleSave}
                    fps={30}
                    autoSaveInterval={30000}
                    showSidebar={true}
                    defaultTheme="dark"
                />
            </div>
        </div>
    );
}
