"use client";

import React from 'react';
import { Plus, FileText, Search, Clock, HardDrive, Zap, MessageSquare, Film } from 'lucide-react';
import Link from 'next/link';

// --- Types ---
interface Project {
    id: string;
    name: string;
    thumbnail: string;
    lastEdited: string;
    status: 'In Progress' | 'Rendering' | 'Completed';
}

interface Activity {
    id: string;
    text: string;
    timestamp: string;
    type: 'system' | 'comment' | 'render';
}

// --- Components ---

export function QuickActions() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button className="flex items-center justify-center gap-3 p-6 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-900/20 group">
                <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                    <Plus size={24} className="text-white" />
                </div>
                <div className="text-left">
                    <div className="font-bold text-lg text-white">New Project</div>
                    <div className="text-blue-100 text-xs">Start a new production</div>
                </div>
            </button>

            <button className="flex items-center justify-center gap-3 p-6 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-750 transition-all group">
                <div className="p-3 rounded-full bg-neutral-700 group-hover:bg-neutral-600 transition-colors">
                    <FileText size={24} className="text-purple-400" />
                </div>
                <div className="text-left">
                    <div className="font-bold text-lg text-white">New Script</div>
                    <div className="text-neutral-400 text-xs">Import or write</div>
                </div>
            </button>

            <button className="flex items-center justify-center gap-3 p-6 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-750 transition-all group">
                <div className="p-3 rounded-full bg-neutral-700 group-hover:bg-neutral-600 transition-colors">
                    <Search size={24} className="text-emerald-400" />
                </div>
                <div className="text-left">
                    <div className="font-bold text-lg text-white">Browse ShotDeck</div>
                    <div className="text-neutral-400 text-xs">Find references</div>
                </div>
            </button>
        </div>
    );
}

export function ResourceWidget() {
    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap size={16} /> Studio Resources
            </h3>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-white font-medium">Credits Remaining</span>
                        <span className="text-blue-400 font-bold">850 / 1000</span>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[85%] rounded-full" />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-white font-medium">Storage Used</span>
                        <span className="text-orange-400 font-bold">45 GB / 100 GB</span>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 w-[45%] rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function RecentProjects({ projects }: { projects: Project[] }) {
    return (
        <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Film size={20} className="text-neutral-400" />
                    Recent Projects
                </h2>
                <Link href="/projects" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {projects.map(project => (
                    <div key={project.id} className="group relative aspect-video bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:border-blue-500 transition-all cursor-pointer">
                        {/* Thumbnail Placeholder */}
                        <div className="absolute inset-0 bg-neutral-700 group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-bold truncate">{project.name}</h3>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-neutral-400">{project.lastEdited}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${project.status === 'Rendering' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500' :
                                        project.status === 'Completed' ? 'bg-green-500/20 border-green-500/50 text-green-500' :
                                            'bg-blue-500/20 border-blue-500/50 text-blue-500'
                                    }`}>
                                    {project.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Placeholder */}
                <div className="flex flex-col items-center justify-center aspect-video bg-neutral-900/50 border border-dashed border-neutral-700 rounded-lg hover:bg-neutral-800/50 hover:border-neutral-500 transition-all cursor-pointer text-neutral-500 hover:text-neutral-300">
                    <Plus size={32} className="mb-2" />
                    <span className="text-sm font-medium">Create Project</span>
                </div>
            </div>
        </div>
    );
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 h-full">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock size={16} /> Activity Feed
            </h3>
            <div className="space-y-4">
                {activities.map(activity => (
                    <div key={activity.id} className="flex gap-3 items-start">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${activity.type === 'render' ? 'bg-green-500' :
                                activity.type === 'comment' ? 'bg-blue-500' :
                                    'bg-neutral-500'
                            }`} />
                        <div>
                            <p className="text-sm text-neutral-300 leading-snug">{activity.text}</p>
                            <span className="text-xs text-neutral-500">{activity.timestamp}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
