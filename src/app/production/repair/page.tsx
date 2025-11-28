'use client';

import React, { useEffect, useState } from 'react';
import ImageEditingStudio from '@/components/production/ImageEditingStudio';
import { Loader2, Image as ImageIcon, Sparkles, ChevronRight, Clock, Check, AlertCircle } from 'lucide-react';

interface Shot {
    id: string;
    prompt: string;
    status: string;
    proxy_path: string | null;
    gcs_path: string | null;
    created_at?: string;
    scene_number?: number;
}

interface Project {
    id: string;
    name: string;
    created_at: string;
}

export default function RepairPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [shots, setShots] = useState<Shot[]>([]);
    const [selectedShot, setSelectedShot] = useState<Shot | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            fetchShots(selectedProject.id);
        }
    }, [selectedProject]);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            if (!res.ok) {
                // API not available or error - just set empty state
                setProjects([]);
                return;
            }
            const data = await res.json();
            
            // Sort by created_at desc
            if (Array.isArray(data) && data.length > 0) {
                data.sort((a: Project, b: Project) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setProjects(data);
                setSelectedProject(data[0]);
            } else {
                setProjects([]);
            }
        } catch (error) {
            // Network error or other issue - gracefully handle
            console.error("Error fetching projects:", error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchShots = async (projectId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/shots`);
            if (!res.ok) return;
            
            const allShots = await res.json();
            // Filter for completed shots
            const completedShots = allShots.filter((s: Shot) => s.status === 'completed');
            // Sort by created_at desc
            completedShots.sort((a: Shot, b: Shot) => 
                new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            );
            setShots(completedShots);
        } catch (error) {
            console.error("Error fetching shots:", error);
        }
    };

    const handleSave = async (data: { imageData: string; versions: any[] }) => {
        if (!selectedShot) return;
        
        try {
            // Save edited shot
            await fetch(`/api/shots/${selectedShot.id}/versions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_data: data.imageData,
                    versions: data.versions
                })
            });
        } catch (error) {
            console.error("Error saving:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-yellow-500" size={32} />
            </div>
        );
    }

    return (
        <div className="flex h-full bg-[#0a0a0a]">
            {/* Sidebar */}
            <div 
                className={`${sidebarCollapsed ? 'w-0' : 'w-80'} flex flex-col bg-[#121212] border-r border-white/5 overflow-hidden transition-all duration-300`}
            >
                {/* Header */}
                <div className="p-4 border-b border-white/5 bg-gradient-to-r from-yellow-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                            <Sparkles className="text-yellow-400" size={20} />
                        </div>
                        <div>
                            <h1 className="font-bold text-white">Repair Studio</h1>
                            <p className="text-xs text-gray-500">Nano Banana Pro • Gemini 3</p>
                        </div>
                    </div>
                </div>

                {/* Project Selector */}
                <div className="p-3 border-b border-white/5">
                    <select
                        value={selectedProject?.id || ''}
                        onChange={(e) => {
                            const project = projects.find(p => p.id === e.target.value);
                            setSelectedProject(project || null);
                            setSelectedShot(null);
                        }}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-yellow-500/50 focus:outline-none"
                    >
                        {projects.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Shots List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {shots.length === 0 ? (
                        <div className="text-center py-12">
                            <ImageIcon className="mx-auto text-gray-600 mb-3" size={32} />
                            <p className="text-gray-500 text-sm">No completed shots found</p>
                            <p className="text-gray-600 text-xs mt-1">Generate some shots first</p>
                        </div>
                    ) : (
                        shots.map(shot => (
                            <div
                                key={shot.id}
                                onClick={() => setSelectedShot(shot)}
                                className={`group p-3 rounded-xl border cursor-pointer transition-all ${
                                    selectedShot?.id === shot.id
                                        ? 'bg-yellow-500/10 border-yellow-500/50 ring-1 ring-yellow-500/20'
                                        : 'bg-[#1a1a1a] border-white/5 hover:border-white/20 hover:bg-[#1e1e1e]'
                                }`}
                            >
                                <div className="flex gap-3">
                                    {/* Thumbnail */}
                                    <div className="w-20 h-12 bg-black rounded-lg overflow-hidden flex-shrink-0 relative">
                                        {shot.proxy_path ? (
                                            <>
                                                <video 
                                                    src={shot.proxy_path} 
                                                    className="w-full h-full object-cover"
                                                    muted
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                <ImageIcon size={16} />
                                            </div>
                                        )}
                                        
                                        {/* Status indicator */}
                                        <div className="absolute top-1 right-1">
                                            {shot.status === 'completed' ? (
                                                <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                                                    <Check size={10} className="text-green-400" />
                                                </div>
                                            ) : (
                                                <div className="w-4 h-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                                    <Clock size={10} className="text-yellow-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        {shot.scene_number && (
                                            <span className="text-[10px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded mb-1 inline-block">
                                                Scene {shot.scene_number}
                                            </span>
                                        )}
                                        <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                                            {shot.prompt}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Stats */}
                <div className="p-3 border-t border-white/5 bg-black/20">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{shots.length} shots available</span>
                        <span>Click to edit</span>
                    </div>
                </div>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-6 bg-[#1a1a1a] border-r border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors"
            >
                <ChevronRight 
                    size={16} 
                    className={`text-gray-500 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} 
                />
            </button>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {selectedShot ? (
                    <ImageEditingStudio
                        imageUrl={selectedShot.proxy_path || ''}
                        shotId={selectedShot.id}
                        shotName={selectedShot.prompt.slice(0, 50)}
                        onSave={handleSave}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
                        <div className="text-center max-w-md px-8">
                            <div className="w-20 h-20 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="text-yellow-400" size={36} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">
                                Welcome to Repair Studio
                            </h2>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                Select a generated shot from the sidebar to start editing. 
                                Use AI-powered tools to fix, enhance, and perfect your shots.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-3 text-left">
                                {[
                                    { icon: '🎨', title: 'Inpaint', desc: 'Fix specific areas' },
                                    { icon: '✨', title: 'Enhance', desc: 'Auto-improve quality' },
                                    { icon: '🔍', title: 'Upscale', desc: '4x AI upscaling' },
                                    { icon: '👤', title: 'Face Fix', desc: 'Restore faces' },
                                    { icon: '🎭', title: 'Style Transfer', desc: 'Apply art styles' },
                                    { icon: '🖼️', title: 'Outpaint', desc: 'Extend borders' },
                                ].map(feature => (
                                    <div key={feature.title} className="p-3 bg-white/5 rounded-lg">
                                        <span className="text-lg">{feature.icon}</span>
                                        <p className="text-sm font-medium text-white mt-1">{feature.title}</p>
                                        <p className="text-xs text-gray-500">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-8 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
                                    <div className="text-left">
                                        <p className="text-sm text-yellow-400 font-medium">Powered by Nano Banana Pro</p>
                                        <p className="text-xs text-yellow-400/70 mt-1">
                                            Advanced AI image editing using Google Gemini 3 for professional-grade results.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
