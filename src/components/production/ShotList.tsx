'use client';

import React, { useEffect, useState } from 'react';
import { Play, Loader2, Film, RefreshCw, AlertCircle, Camera, Image as ImageIcon } from 'lucide-react';
import { Shot } from '@/types';
import { SHOT_TYPE_LABELS } from '@/lib/coverage-presets';

interface ShotListProps {
    projectId?: string;
}

export default function ShotList({ projectId }: ShotListProps) {
    const [shots, setShots] = useState<Shot[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(projectId || null);

    // Fetch latest project if none provided
    useEffect(() => {
        const fetchProject = async () => {
            if (!currentProjectId) {
                try {
                    const res = await fetch('/api/projects');
                    if (res.ok) {
                        const projects = await res.json();
                        if (projects.length > 0) {
                            // Sort by created_at desc
                            projects.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                            setCurrentProjectId(projects[0].id || projects[0]._id);
                        }
                    }
                } catch (e) {
                    console.error("Error fetching projects:", e);
                }
            }
        };
        fetchProject();
    }, [currentProjectId]);

    // Fetch shots and poll
    useEffect(() => {
        if (!currentProjectId) return;

        const fetchShots = async () => {
            try {
                const res = await fetch(`/api/projects/${currentProjectId}/shots`);
                if (res.ok) {
                    const data = await res.json();
                    setShots(data);
                }
            } catch (e) {
                console.error("Error fetching shots:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchShots();
        const interval = setInterval(fetchShots, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [currentProjectId]);

    const handleGenerate = async (shot: Shot) => {
        setGeneratingId(shot.id);
        try {
            // Optimistic update
            setShots(prev => prev.map(s => s.id === shot.id ? { ...s, status: 'processing' } : s));

            const response = await fetch('/api/generate/shot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scene_id: shot.scene_id,
                    user_prompt: shot.prompt,
                    aspect_ratio: "16:9",
                    linked_asset_ids: []
                })
            });

            const data = await response.json();
            if (data.status !== 'success') {
                alert("Generation failed: " + data.detail);
                setShots(prev => prev.map(s => s.id === shot.id ? { ...s, status: 'failed' } : s));
            }
        } catch (e) {
            console.error("Error generating shot:", e);
            setShots(prev => prev.map(s => s.id === shot.id ? { ...s, status: 'failed' } : s));
        }
        setGeneratingId(null);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full text-white"><Loader2 className="animate-spin" /></div>;
    }

    if (!currentProjectId) {
        return <div className="flex items-center justify-center h-full text-gray-500">No Project Selected</div>;
    }

    return (
        <div className="h-full flex flex-col bg-[#121212] text-white">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Film className="text-yellow-500" /> Shot List
                </h2>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                    {shots.length} Shots
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {shots.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p>No shots yet.</p>
                        <p className="text-sm mt-2">Go to Pre-Production to breakdown your script.</p>
                    </div>
                )}
                {shots.map((shot, index) => {
                    const shotTypeInfo = SHOT_TYPE_LABELS[shot.shot_type || 'medium'];
                    return (
                        <div key={shot.id} className="bg-[#1a1a1a] border border-white/5 rounded-lg p-4 flex items-start gap-4 hover:border-white/10 transition-colors">
                            {/* Shot Number */}
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 font-mono text-sm">
                                {shot.shot_number || index + 1}
                            </div>

                            {/* Thumbnail / Status */}
                            <div className="w-40 aspect-video bg-black rounded overflow-hidden flex items-center justify-center relative group">
                                {shot.status === 'completed' && shot.proxy_path ? (
                                    <>
                                        <img src={shot.proxy_path} alt={`Shot ${index + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                            <Play className="text-white fill-white" />
                                        </div>
                                    </>
                                ) : shot.status === 'processing' ? (
                                    <div className="flex flex-col items-center gap-2 text-yellow-500">
                                        <Loader2 className="animate-spin" />
                                        <span className="text-xs">Rendering...</span>
                                    </div>
                                ) : shot.status === 'failed' ? (
                                    <div className="flex flex-col items-center gap-2 text-red-500">
                                        <AlertCircle />
                                        <span className="text-xs">Failed</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-gray-600">
                                        <ImageIcon size={20} />
                                        <span className="text-xs">Pending</span>
                                    </div>
                                )}
                                
                                {/* Shot Type Badge */}
                                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] font-mono text-white">
                                    {shotTypeInfo?.abbrev || 'MED'}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-white">
                                        {shotTypeInfo?.label || 'Medium Shot'}
                                    </span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold
                                        ${shot.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                            shot.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                                                shot.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                        }
                                    `}>
                                        {shot.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                    {shot.description || shot.prompt}
                                </p>
                                {shot.notes && (
                                    <p className="text-xs text-gray-600 mt-1 italic">
                                        Note: {shot.notes}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {(shot.status === 'pending' || shot.status === 'failed') && (
                                    <button
                                        onClick={() => handleGenerate(shot)}
                                        disabled={generatingId === shot.id}
                                        className="p-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors disabled:opacity-50"
                                        title="Generate Storyboard"
                                    >
                                        {generatingId === shot.id ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
