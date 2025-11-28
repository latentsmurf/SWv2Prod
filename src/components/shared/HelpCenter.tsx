'use client';

import React, { useState } from 'react';
import {
    HelpCircle, X, Search, Book, Video, MessageCircle,
    ChevronRight, ExternalLink, Keyboard, Lightbulb,
    FileText, Users, Image, Film, Settings, Zap
} from 'lucide-react';

interface HelpArticle {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: React.ElementType;
    content?: string;
    videoUrl?: string;
}

interface HelpCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

const HELP_CATEGORIES = [
    { id: 'getting-started', label: 'Getting Started', icon: Lightbulb },
    { id: 'scripts', label: 'Scripts & Scenes', icon: FileText },
    { id: 'library', label: 'Production Library', icon: Users },
    { id: 'generation', label: 'AI Generation', icon: Zap },
    { id: 'export', label: 'Export & Share', icon: Film },
    { id: 'settings', label: 'Settings & Account', icon: Settings },
];

const HELP_ARTICLES: HelpArticle[] = [
    {
        id: 'welcome',
        title: 'Welcome to SceneWeaver',
        description: 'Learn the basics of AI-powered video production',
        category: 'getting-started',
        icon: Lightbulb,
        content: `
## Getting Started with SceneWeaver

SceneWeaver is an AI-powered video production studio that helps you create professional videos from script to screen.

### Key Features
- **Script Editor**: Write and format your screenplay with AI assistance
- **Production Library**: Define your cast, locations, wardrobe, and props
- **AI Shot Generation**: Automatically generate storyboards from your script
- **Export Options**: Share as video, PDF, or project files

### Your First Project
1. Create a new project from the dashboard
2. Write or import your script
3. Define your production assets
4. Generate your storyboard
5. Export and share!
        `
    },
    {
        id: 'script-basics',
        title: 'Writing Scripts',
        description: 'How to write and format scripts in SceneWeaver',
        category: 'scripts',
        icon: FileText,
        content: `
## Script Writing Guide

### Scene Headings
Scene headings (slug lines) are automatically detected. Use the format:
- INT. LOCATION - TIME
- EXT. LOCATION - TIME

### Character Detection
Character names in ALL CAPS before dialogue are automatically extracted.

### Script Sync
Click "Sync to Production" to convert your script into Scene records that can be managed separately.
        `
    },
    {
        id: 'cast-library',
        title: 'Building Your Cast',
        description: 'Define consistent character appearances',
        category: 'library',
        icon: Users,
        content: `
## Cast Management

### Creating Characters
Define each character with:
- Name and role
- Age and appearance
- Personality traits
- Reference images

### Character Consistency
Upload reference images to ensure AI generates consistent character appearances across all shots.

### Linking to Scenes
Assign characters to specific scenes to track who appears where.
        `
    },
    {
        id: 'ai-generation',
        title: 'AI Shot Generation',
        description: 'How AI generates your storyboard',
        category: 'generation',
        icon: Zap,
        content: `
## AI Generation

### Coverage Presets
- **Minimal**: 2-4 shots per scene (quick overview)
- **Standard**: 4-8 shots (balanced coverage)
- **Heavy**: 8-15 shots (detailed coverage)

### Style Modes
- **Storyboard**: Black and white sketches
- **Cinematic**: Full color renders

### Regeneration
Click on any shot to regenerate with different parameters.
        `
    },
    {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        description: 'Work faster with keyboard shortcuts',
        category: 'settings',
        icon: Keyboard,
        content: `
## Keyboard Shortcuts

### Global
- ⌘K - Search
- ⌘/ - Show shortcuts
- ⌘N - New project
- ⌘S - Save

### Navigation
- ⌘1 - Dashboard
- ⌘2 - Production
- ⌘3 - Library

### Editor
- Space - Play/Pause
- ← → - Navigate shots
- ⌘Z - Undo
- ⌘⇧Z - Redo
        `
    },
    {
        id: 'export-options',
        title: 'Export Options',
        description: 'Share your work in various formats',
        category: 'export',
        icon: Film,
        content: `
## Export Formats

### Video Export
- MP4 (H.264) - Universal compatibility
- MOV (ProRes) - Professional quality
- WebM - Web optimized

### Storyboard Export
- PDF - Printable storyboard
- Image Strips - Individual frames
- FCPXML - Import to Final Cut Pro

### Sharing
Create review links for client feedback without account requirements.
        `
    },
];

const FAQ = [
    {
        q: 'How many credits do I need per shot?',
        a: 'Image generation uses 1 credit per shot. Video generation uses 5 credits per clip.'
    },
    {
        q: 'Can I use my own API keys?',
        a: 'Yes! Go to Settings > API Keys to add your own keys and bypass credit usage.'
    },
    {
        q: 'How do I ensure character consistency?',
        a: 'Upload reference images in the Character Consistency panel and use the same character across scenes.'
    },
    {
        q: 'Can I collaborate with my team?',
        a: 'Use Review Links to share projects for feedback. Team collaboration is coming soon!'
    },
    {
        q: 'What video formats are supported?',
        a: 'We support MP4, MOV, and WebM for video export. Import supports most common formats.'
    },
];

export default function HelpCenter({ isOpen, onClose }: HelpCenterProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

    // Filter articles
    const filteredArticles = HELP_ARTICLES.filter(article => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                article.title.toLowerCase().includes(query) ||
                article.description.toLowerCase().includes(query)
            );
        }
        if (selectedCategory) {
            return article.category === selectedCategory;
        }
        return true;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-xl">
                            <HelpCircle className="text-yellow-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Help Center</h2>
                            <p className="text-sm text-gray-500">Learn how to use SceneWeaver</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-64 border-r border-white/5 overflow-y-auto">
                        {/* Search */}
                        <div className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setSelectedCategory(null);
                                        setSelectedArticle(null);
                                    }}
                                    placeholder="Search help..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="px-4 pb-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Categories</p>
                            <div className="space-y-1">
                                {HELP_CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                setSelectedCategory(cat.id);
                                                setSelectedArticle(null);
                                                setSearchQuery('');
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                                selectedCategory === cat.id
                                                    ? 'bg-yellow-500/10 text-yellow-500'
                                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            <span className="text-sm">{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="px-4 pb-4 border-t border-white/5 pt-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Quick Links</p>
                            <div className="space-y-1">
                                <a
                                    href="mailto:support@sceneweaver.ai"
                                    className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                                >
                                    <MessageCircle size={16} />
                                    <span className="text-sm">Contact Support</span>
                                </a>
                                <a
                                    href="https://docs.sceneweaver.ai"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                                >
                                    <Book size={16} />
                                    <span className="text-sm">Full Documentation</span>
                                    <ExternalLink size={12} className="ml-auto" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {selectedArticle ? (
                            // Article View
                            <div>
                                <button
                                    onClick={() => setSelectedArticle(null)}
                                    className="text-sm text-gray-500 hover:text-white mb-4 flex items-center gap-1"
                                >
                                    ← Back to articles
                                </button>
                                <h2 className="text-2xl font-bold text-white mb-2">{selectedArticle.title}</h2>
                                <p className="text-gray-500 mb-6">{selectedArticle.description}</p>
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-300">
                                        {selectedArticle.content}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Article List
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">
                                    {selectedCategory
                                        ? HELP_CATEGORIES.find(c => c.id === selectedCategory)?.label
                                        : searchQuery
                                        ? `Results for "${searchQuery}"`
                                        : 'All Articles'
                                    }
                                </h3>

                                <div className="grid gap-4">
                                    {filteredArticles.map((article) => {
                                        const Icon = article.icon;
                                        return (
                                            <button
                                                key={article.id}
                                                onClick={() => setSelectedArticle(article)}
                                                className="flex items-start gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors group"
                                            >
                                                <div className="p-2 bg-white/5 rounded-lg text-yellow-500">
                                                    <Icon size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-white group-hover:text-yellow-500 transition-colors">
                                                        {article.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {article.description}
                                                    </p>
                                                </div>
                                                <ChevronRight className="text-gray-600 group-hover:text-white" size={20} />
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* FAQ */}
                                {!searchQuery && !selectedCategory && (
                                    <div className="mt-8">
                                        <h3 className="text-lg font-bold text-white mb-4">
                                            Frequently Asked Questions
                                        </h3>
                                        <div className="space-y-4">
                                            {FAQ.map((faq, i) => (
                                                <div key={i} className="p-4 bg-white/5 rounded-xl">
                                                    <p className="font-medium text-white mb-2">{faq.q}</p>
                                                    <p className="text-sm text-gray-400">{faq.a}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Help trigger button
export function HelpButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-yellow-500 hover:bg-yellow-400 rounded-full flex items-center justify-center shadow-lg transition-colors"
        >
            <HelpCircle className="text-black" size={24} />
        </button>
    );
}
