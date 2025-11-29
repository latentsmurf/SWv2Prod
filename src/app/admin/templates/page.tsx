'use client';

import React, { useState } from 'react';
import {
    FileText, Search, Plus, Edit2, Trash2, Copy, Eye, Download,
    Film, Video, Tv, Clapperboard, BookOpen, Megaphone, MoreHorizontal
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    type: 'project' | 'scene' | 'shot' | 'script';
    thumbnail?: string;
    usageCount: number;
    createdAt: string;
    isSystem: boolean;
}

// ============================================================================
// DATA
// ============================================================================

const TEMPLATES: Template[] = [
    { id: '1', name: 'Short Film', description: 'Template for short film projects with 3-act structure', category: 'Film', type: 'project', usageCount: 1234, createdAt: '2024-01-15', isSystem: true },
    { id: '2', name: 'Feature Film', description: 'Full-length feature film template with scenes and acts', category: 'Film', type: 'project', usageCount: 567, createdAt: '2024-02-20', isSystem: true },
    { id: '3', name: 'Documentary', description: 'Documentary project template with interview segments', category: 'Documentary', type: 'project', usageCount: 890, createdAt: '2024-03-10', isSystem: true },
    { id: '4', name: 'Commercial (30s)', description: '30-second commercial template', category: 'Commercial', type: 'project', usageCount: 2341, createdAt: '2024-01-05', isSystem: true },
    { id: '5', name: 'Music Video', description: 'Music video template with beat-synced scenes', category: 'Music Video', type: 'project', usageCount: 1567, createdAt: '2024-04-01', isSystem: true },
    { id: '6', name: 'TV Episode', description: 'Television episode template (42 min)', category: 'TV', type: 'project', usageCount: 432, createdAt: '2024-05-15', isSystem: true },
    { id: '7', name: 'Trailer', description: 'Movie trailer template with teasers', category: 'Promotional', type: 'project', usageCount: 876, createdAt: '2024-06-20', isSystem: true },
    { id: '8', name: 'Action Scene', description: 'Fast-paced action sequence template', category: 'Action', type: 'scene', usageCount: 3421, createdAt: '2024-02-01', isSystem: true },
    { id: '9', name: 'Dialogue Scene', description: 'Two-person dialogue scene template', category: 'Drama', type: 'scene', usageCount: 4532, createdAt: '2024-01-20', isSystem: true },
    { id: '10', name: 'Establishing Shot', description: 'Wide establishing shot template', category: 'Cinematic', type: 'shot', usageCount: 8765, createdAt: '2024-01-01', isSystem: true },
];

const CATEGORIES = ['All', 'Film', 'Documentary', 'Commercial', 'Music Video', 'TV', 'Promotional', 'Action', 'Drama', 'Cinematic'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TemplatesPage() {
    const [templates, setTemplates] = useState(TEMPLATES);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('all');

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        return matchesSearch && matchesCategory && matchesType;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'project': return <Film size={14} />;
            case 'scene': return <Clapperboard size={14} />;
            case 'shot': return <Video size={14} />;
            case 'script': return <BookOpen size={14} />;
            default: return <FileText size={14} />;
        }
    };

    const deleteTemplate = (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        setTemplates(prev => prev.filter(t => t.id !== id));
    };

    // Stats
    const stats = {
        total: templates.length,
        projects: templates.filter(t => t.type === 'project').length,
        scenes: templates.filter(t => t.type === 'scene').length,
        shots: templates.filter(t => t.type === 'shot').length,
        totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Templates</h1>
                    <p className="text-sm text-gray-500">Manage project and scene templates</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg text-sm">
                    <Plus size={14} />
                    New Template
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-4">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Total Templates</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Project Templates</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.projects}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Scene Templates</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.scenes}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Shot Templates</p>
                    <p className="text-2xl font-bold text-green-400">{stats.shots}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Total Usage</p>
                    <p className="text-2xl font-bold text-white">{stats.totalUsage.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                    />
                </div>
                
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                    <option value="all">All Types</option>
                    <option value="project">Project</option>
                    <option value="scene">Scene</option>
                    <option value="shot">Shot</option>
                    <option value="script">Script</option>
                </select>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                    <div
                        key={template.id}
                        className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
                    >
                        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <Film size={40} className="text-gray-600" />
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-full text-xs text-gray-400">
                                    {getTypeIcon(template.type)}
                                    {template.type}
                                </span>
                                <span className="text-xs text-gray-500">{template.category}</span>
                                {template.isSystem && (
                                    <span className="text-xs text-yellow-500">System</span>
                                )}
                            </div>
                            <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{template.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{template.usageCount.toLocaleString()} uses</span>
                                <div className="flex items-center gap-1">
                                    <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                                        <Eye size={14} />
                                    </button>
                                    <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                                        <Copy size={14} />
                                    </button>
                                    <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                                        <Edit2 size={14} />
                                    </button>
                                    {!template.isSystem && (
                                        <button
                                            onClick={() => deleteTemplate(template.id)}
                                            className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
