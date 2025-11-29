'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Clock, Film, Smartphone, Video, Clapperboard, ChevronRight,
    MoreHorizontal, Trash2, Copy, Archive, Star, StarOff
} from 'lucide-react';

interface Project {
    id: string;
    name: string;
    genre?: string;
    created_at: string;
    updated_at?: string;
    thumbnail_url?: string;
    scene_count?: number;
    shot_count?: number;
}

interface RecentProjectsProps {
    limit?: number;
    showViewAll?: boolean;
    compact?: boolean;
}

export default function RecentProjects({ 
    limit = 5, 
    showViewAll = true,
    compact = false 
}: RecentProjectsProps) {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem('favorite_projects');
        if (savedFavorites) {
            setFavorites(new Set(JSON.parse(savedFavorites)));
        }

        const fetchProjects = async () => {
            try {
                const res = await fetch('/api/projects');
                if (res.ok) {
                    const data = await res.json();
                    // Sort by updated_at or created_at desc
                    const sorted = data.sort((a: Project, b: Project) => {
                        const dateA = new Date(a.updated_at || a.created_at).getTime();
                        const dateB = new Date(b.updated_at || b.created_at).getTime();
                        return dateB - dateA;
                    });
                    setProjects(sorted.slice(0, limit));
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [limit]);

    const toggleFavorite = (projectId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(projectId)) {
                next.delete(projectId);
            } else {
                next.add(projectId);
            }
            localStorage.setItem('favorite_projects', JSON.stringify([...next]));
            return next;
        });
    };

    const getGenreIcon = (genre?: string) => {
        if (genre?.startsWith('micro-')) return <Smartphone size={14} className="text-pink-400" />;
        if (genre?.includes('commercial')) return <Video size={14} className="text-blue-400" />;
        return <Film size={14} className="text-purple-400" />;
    };

    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="text-center py-8">
                <Clock className="mx-auto text-gray-600 mb-2" size={24} />
                <p className="text-sm text-gray-500">No recent projects</p>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="space-y-1">
                {projects.map(project => (
                    <button
                        key={project.id}
                        onClick={() => router.push(`/production?projectId=${project.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                    >
                        {getGenreIcon(project.genre)}
                        <span className="flex-1 text-sm text-gray-300 truncate group-hover:text-white">
                            {project.name}
                        </span>
                        <span className="text-xs text-gray-600">
                            {formatRelativeTime(project.updated_at || project.created_at)}
                        </span>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Clock size={14} />
                    Recent Projects
                </h3>
                {showViewAll && (
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="text-xs text-gray-500 hover:text-white flex items-center gap-1"
                    >
                        View all <ChevronRight size={12} />
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {projects.map(project => (
                    <div
                        key={project.id}
                        onClick={() => router.push(`/production?projectId=${project.id}`)}
                        className="group flex items-center gap-4 p-3 bg-[#121212] border border-white/5 rounded-xl hover:border-white/20 cursor-pointer transition-all"
                    >
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                            {project.thumbnail_url ? (
                                <img src={project.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Clapperboard className="text-gray-600" size={20} />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                {getGenreIcon(project.genre)}
                                <h4 className="text-sm font-medium text-white truncate group-hover:text-pink-400 transition-colors">
                                    {project.name}
                                </h4>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span>{formatRelativeTime(project.updated_at || project.created_at)}</span>
                                {project.scene_count !== undefined && (
                                    <span>{project.scene_count} scenes</span>
                                )}
                                {project.shot_count !== undefined && (
                                    <span>{project.shot_count} shots</span>
                                )}
                            </div>
                        </div>

                        {/* Favorite */}
                        <button
                            onClick={(e) => toggleFavorite(project.id, e)}
                            className="p-2 text-gray-500 hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            {favorites.has(project.id) ? (
                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                            ) : (
                                <StarOff size={16} />
                            )}
                        </button>

                        {/* Arrow */}
                        <ChevronRight 
                            size={16} 
                            className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" 
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
