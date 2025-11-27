'use client';

import React, { useEffect, useState } from 'react';
import InpaintingCanvas from '@/components/production/InpaintingCanvas';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface Shot {
    id: string;
    prompt: string;
    status: string;
    proxy_path: string | null;
    gcs_path: string | null;
}

export default function RepairPage() {
    const [shots, setShots] = useState<Shot[]>([]);
    const [selectedShot, setSelectedShot] = useState<Shot | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShots = async () => {
            try {
                // Fetch latest project first
                const projectRes = await fetch('/api/projects');
                if (!projectRes.ok) throw new Error('Failed to fetch projects');
                const projects = await projectRes.json();

                if (projects && projects.length > 0) {
                    // Sort by created_at desc
                    projects.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    const latestProject = projects[0];
                    const projectId = latestProject.id || latestProject._id;

                    const shotsRes = await fetch(`/api/projects/${projectId}/shots`);
                    if (shotsRes.ok) {
                        const allShots = await shotsRes.json();
                        // Filter for completed shots
                        const completedShots = allShots.filter((s: any) => s.status === 'completed');
                        // Sort by created_at desc
                        completedShots.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                        setShots(completedShots);
                    }
                }
            } catch (error) {
                console.error("Error fetching shots:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchShots();
    }, []);

    const handleRepair = async (maskBase64: string, prompt: string) => {
        if (!selectedShot) return;

        try {
            const response = await fetch('/api/repair/shot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shot_id: selectedShot.id,
                    mask_base64: maskBase64,
                    prompt: prompt
                })
            });
            const data = await response.json();
            if (data.status === 'success') {
                alert("Repair started! The shot will update shortly.");
                // Optionally refresh shot data or show status
            } else {
                alert("Repair failed: " + data.detail);
            }
        } catch (e) {
            console.error("Error repairing shot:", e);
            alert("Error repairing shot");
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full text-white"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex h-full gap-6">
            {/* Sidebar: Shot Selector */}
            <div className="w-80 flex flex-col bg-[#121212] rounded-xl border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-black/20">
                    <h3 className="font-bold text-white">Select Shot to Repair</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {shots.length === 0 && (
                        <p className="text-gray-500 text-sm text-center py-10">No completed shots found.</p>
                    )}
                    {shots.map(shot => (
                        <div
                            key={shot.id}
                            onClick={() => setSelectedShot(shot)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all flex gap-3 items-center
                                ${selectedShot?.id === shot.id
                                    ? 'bg-yellow-500/10 border-yellow-500/50'
                                    : 'bg-[#1a1a1a] border-white/5 hover:border-white/20'
                                }
                            `}
                        >
                            <div className="w-16 h-9 bg-black rounded overflow-hidden flex-shrink-0">
                                {shot.proxy_path ? (
                                    <video src={shot.proxy_path} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700"><ImageIcon size={12} /></div>
                                )}
                            </div>
                            <p className="text-xs text-gray-300 line-clamp-2">{shot.prompt}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Area: Canvas */}
            <div className="flex-1 flex flex-col justify-center">
                {selectedShot ? (
                    <InpaintingCanvas
                        imageUrl={selectedShot.proxy_path || ''}
                        shotId={selectedShot.id}
                        onRepair={handleRepair}
                    />
                ) : (
                    <div className="text-center text-gray-500">
                        <p>Select a shot from the sidebar to start repairing.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
