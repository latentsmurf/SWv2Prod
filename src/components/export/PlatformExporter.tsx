'use client';

import React, { useState } from 'react';
import {
    Download, Smartphone, Youtube, Instagram, Film, Tv,
    Check, Loader2, ChevronRight, Settings, AlertCircle,
    FileVideo, Clock, HardDrive, Zap
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ExportPlatform {
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
    specs: {
        aspect_ratio: string;
        resolution: string;
        max_duration?: string;
        file_format: string;
        max_file_size?: string;
    };
    color: string;
    category: 'micro-drama' | 'social' | 'broadcast' | 'streaming';
}

interface ExportJob {
    id: string;
    platform_id: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    output_url?: string;
    error?: string;
}

interface PlatformExporterProps {
    projectId: string;
    onExportComplete?: (job: ExportJob) => void;
}

// ============================================================================
// PLATFORMS
// ============================================================================

const PLATFORMS: ExportPlatform[] = [
    // Micro Drama Platforms
    {
        id: 'reelshort',
        name: 'ReelShort',
        icon: <Smartphone size={20} />,
        description: 'Optimized for ReelShort micro drama platform',
        specs: { aspect_ratio: '9:16', resolution: '1080x1920', max_duration: '3 min/episode', file_format: 'MP4 H.264' },
        color: 'from-pink-500/20 to-rose-500/20',
        category: 'micro-drama'
    },
    {
        id: 'dramabox',
        name: 'DramaBox',
        icon: <Smartphone size={20} />,
        description: 'DramaBox vertical series format',
        specs: { aspect_ratio: '9:16', resolution: '1080x1920', max_duration: '2 min/episode', file_format: 'MP4 H.264' },
        color: 'from-purple-500/20 to-pink-500/20',
        category: 'micro-drama'
    },
    {
        id: 'shortmax',
        name: 'ShortMax',
        icon: <Smartphone size={20} />,
        description: 'ShortMax vertical video specs',
        specs: { aspect_ratio: '9:16', resolution: '1080x1920', file_format: 'MP4 H.264' },
        color: 'from-orange-500/20 to-red-500/20',
        category: 'micro-drama'
    },

    // Social Platforms
    {
        id: 'youtube-shorts',
        name: 'YouTube Shorts',
        icon: <Youtube size={20} />,
        description: 'Vertical shorts under 60 seconds',
        specs: { aspect_ratio: '9:16', resolution: '1080x1920', max_duration: '60 sec', file_format: 'MP4' },
        color: 'from-red-500/20 to-red-600/20',
        category: 'social'
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        icon: <Smartphone size={20} />,
        description: 'TikTok optimized vertical video',
        specs: { aspect_ratio: '9:16', resolution: '1080x1920', max_duration: '10 min', file_format: 'MP4', max_file_size: '287MB' },
        color: 'from-cyan-500/20 to-pink-500/20',
        category: 'social'
    },
    {
        id: 'instagram-reels',
        name: 'Instagram Reels',
        icon: <Instagram size={20} />,
        description: 'Instagram Reels format',
        specs: { aspect_ratio: '9:16', resolution: '1080x1920', max_duration: '90 sec', file_format: 'MP4' },
        color: 'from-purple-500/20 to-pink-500/20',
        category: 'social'
    },
    {
        id: 'youtube-standard',
        name: 'YouTube',
        icon: <Youtube size={20} />,
        description: 'Standard YouTube video',
        specs: { aspect_ratio: '16:9', resolution: '1920x1080 / 4K', file_format: 'MP4 H.264' },
        color: 'from-red-500/20 to-red-600/20',
        category: 'streaming'
    },

    // Broadcast/Streaming
    {
        id: 'broadcast-hd',
        name: 'Broadcast HD',
        icon: <Tv size={20} />,
        description: 'Television broadcast standard',
        specs: { aspect_ratio: '16:9', resolution: '1920x1080', file_format: 'ProRes 422' },
        color: 'from-blue-500/20 to-cyan-500/20',
        category: 'broadcast'
    },
    {
        id: 'netflix',
        name: 'Netflix',
        icon: <Film size={20} />,
        description: 'Netflix delivery specs',
        specs: { aspect_ratio: '16:9 / 2.39:1', resolution: '4K HDR', file_format: 'ProRes 4444' },
        color: 'from-red-600/20 to-red-700/20',
        category: 'streaming'
    },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PlatformExporter({
    projectId,
    onExportComplete
}: PlatformExporterProps) {
    const [selectedPlatform, setSelectedPlatform] = useState<ExportPlatform | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Advanced settings
    const [settings, setSettings] = useState({
        include_subtitles: true,
        include_audio: true,
        quality: 'high',
        watermark: false
    });

    const categories = [
        { id: 'all', label: 'All Platforms' },
        { id: 'micro-drama', label: 'Micro Drama' },
        { id: 'social', label: 'Social Media' },
        { id: 'streaming', label: 'Streaming' },
        { id: 'broadcast', label: 'Broadcast' },
    ];

    const filteredPlatforms = activeCategory === 'all'
        ? PLATFORMS
        : PLATFORMS.filter(p => p.category === activeCategory);

    const startExport = async () => {
        if (!selectedPlatform) return;

        setIsExporting(true);
        const jobId = crypto.randomUUID();

        const job: ExportJob = {
            id: jobId,
            platform_id: selectedPlatform.id,
            status: 'queued',
            progress: 0
        };

        setExportJobs(prev => [job, ...prev]);

        try {
            // Simulate export progress
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(r => setTimeout(r, 500));
                setExportJobs(prev => prev.map(j => 
                    j.id === jobId ? { ...j, status: 'processing', progress: i } : j
                ));
            }

            // API call would go here
            const res = await fetch(`/api/projects/${projectId}/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platform: selectedPlatform.id,
                    settings
                })
            });

            const finalJob: ExportJob = {
                ...job,
                status: 'completed',
                progress: 100,
                output_url: '/exports/demo.mp4' // Would come from API
            };

            setExportJobs(prev => prev.map(j => j.id === jobId ? finalJob : j));
            onExportComplete?.(finalJob);

        } catch (error) {
            setExportJobs(prev => prev.map(j => 
                j.id === jobId ? { ...j, status: 'failed', error: 'Export failed' } : j
            ));
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center">
                        <Download size={20} className="text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Export to Platform</h2>
                        <p className="text-xs text-gray-500">One-click export optimized for each platform</p>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-2 mt-6 flex-wrap">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${activeCategory === cat.id 
                                    ? 'bg-white text-black' 
                                    : 'bg-white/5 text-gray-400 hover:text-white'}
                            `}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Platform Selection */}
                <div className="w-96 border-r border-white/5 overflow-y-auto p-6">
                    <div className="grid gap-3">
                        {filteredPlatforms.map(platform => {
                            const isSelected = selectedPlatform?.id === platform.id;

                            return (
                                <button
                                    key={platform.id}
                                    onClick={() => setSelectedPlatform(platform)}
                                    className={`
                                        p-4 rounded-xl text-left transition-all
                                        bg-gradient-to-br ${platform.color}
                                        ${isSelected 
                                            ? 'ring-2 ring-white/30' 
                                            : 'hover:ring-1 hover:ring-white/20'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-white">{platform.icon}</div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-medium">{platform.name}</h3>
                                            <p className="text-xs text-gray-400">{platform.specs.aspect_ratio} • {platform.specs.resolution}</p>
                                        </div>
                                        {isSelected && (
                                            <Check size={18} className="text-green-400" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Export Settings */}
                <div className="flex-1 overflow-y-auto p-6">
                    {selectedPlatform ? (
                        <div className="max-w-lg mx-auto space-y-6">
                            {/* Platform Info */}
                            <div className={`p-6 rounded-2xl bg-gradient-to-br ${selectedPlatform.color}`}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-white">{selectedPlatform.icon}</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{selectedPlatform.name}</h3>
                                        <p className="text-sm text-gray-300">{selectedPlatform.description}</p>
                                    </div>
                                </div>

                                {/* Specs */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-black/20 rounded-lg p-3">
                                        <p className="text-xs text-gray-400">Resolution</p>
                                        <p className="text-sm text-white font-medium">{selectedPlatform.specs.resolution}</p>
                                    </div>
                                    <div className="bg-black/20 rounded-lg p-3">
                                        <p className="text-xs text-gray-400">Aspect Ratio</p>
                                        <p className="text-sm text-white font-medium">{selectedPlatform.specs.aspect_ratio}</p>
                                    </div>
                                    <div className="bg-black/20 rounded-lg p-3">
                                        <p className="text-xs text-gray-400">Format</p>
                                        <p className="text-sm text-white font-medium">{selectedPlatform.specs.file_format}</p>
                                    </div>
                                    {selectedPlatform.specs.max_duration && (
                                        <div className="bg-black/20 rounded-lg p-3">
                                            <p className="text-xs text-gray-400">Max Duration</p>
                                            <p className="text-sm text-white font-medium">{selectedPlatform.specs.max_duration}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Settings */}
                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                                >
                                    <Settings size={14} />
                                    Advanced Settings
                                    <ChevronRight size={14} className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                                </button>

                                {showAdvanced && (
                                    <div className="space-y-3 pl-6">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.include_subtitles}
                                                onChange={e => setSettings(s => ({ ...s, include_subtitles: e.target.checked }))}
                                                className="w-4 h-4 rounded accent-green-500"
                                            />
                                            <span className="text-sm text-white">Include subtitles</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.include_audio}
                                                onChange={e => setSettings(s => ({ ...s, include_audio: e.target.checked }))}
                                                className="w-4 h-4 rounded accent-green-500"
                                            />
                                            <span className="text-sm text-white">Include audio</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.watermark}
                                                onChange={e => setSettings(s => ({ ...s, watermark: e.target.checked }))}
                                                className="w-4 h-4 rounded accent-green-500"
                                            />
                                            <span className="text-sm text-white">Add watermark</span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Export Button */}
                            <button
                                onClick={startExport}
                                disabled={isExporting}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download size={20} />
                                        Export for {selectedPlatform.name}
                                    </>
                                )}
                            </button>

                            {/* Export Jobs */}
                            {exportJobs.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-gray-400">Recent Exports</h4>
                                    {exportJobs.map(job => {
                                        const platform = PLATFORMS.find(p => p.id === job.platform_id);
                                        return (
                                            <div
                                                key={job.id}
                                                className="p-4 bg-[#121212] border border-white/5 rounded-xl"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {job.status === 'completed' ? (
                                                        <Check className="text-green-400" size={18} />
                                                    ) : job.status === 'failed' ? (
                                                        <AlertCircle className="text-red-400" size={18} />
                                                    ) : (
                                                        <Loader2 className="text-blue-400 animate-spin" size={18} />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-sm text-white">{platform?.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {job.status === 'processing' ? `${job.progress}%` : job.status}
                                                        </p>
                                                    </div>
                                                    {job.output_url && (
                                                        <a
                                                            href={job.output_url}
                                                            download
                                                            className="p-2 text-gray-500 hover:text-white"
                                                        >
                                                            <Download size={16} />
                                                        </a>
                                                    )}
                                                </div>
                                                {job.status === 'processing' && (
                                                    <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-blue-500 transition-all"
                                                            style={{ width: `${job.progress}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <Download className="mx-auto text-gray-600 mb-4" size={48} />
                                <h3 className="text-lg font-semibold text-white mb-2">Select a Platform</h3>
                                <p className="text-sm text-gray-500">Choose where you want to publish your content</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
