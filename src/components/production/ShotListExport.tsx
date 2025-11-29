'use client';

import React, { useState } from 'react';
import {
    FileText, Download, Loader2, Check, Settings, Image,
    Film, List, Table, Grid, ChevronDown
} from 'lucide-react';
import { Shot, Scene } from '@/types';

interface ShotListExportProps {
    projectId: string;
    projectName: string;
    scenes: Scene[];
    shots: Shot[];
    onClose: () => void;
}

interface ExportOptions {
    format: 'pdf' | 'csv' | 'xlsx';
    layout: 'detailed' | 'compact' | 'storyboard';
    includeImages: boolean;
    includeThumbnails: boolean;
    includeNotes: boolean;
    includeTimecodes: boolean;
    groupByScene: boolean;
    pageSize: 'letter' | 'a4' | 'legal';
    orientation: 'portrait' | 'landscape';
}

const FORMAT_OPTIONS = [
    { id: 'pdf', label: 'PDF Document', icon: FileText, description: 'Best for printing and sharing' },
    { id: 'csv', label: 'CSV Spreadsheet', icon: Table, description: 'Import to Excel, Sheets' },
    { id: 'xlsx', label: 'Excel Workbook', icon: Table, description: 'Full formatting support' },
];

const LAYOUT_OPTIONS = [
    { id: 'detailed', label: 'Detailed', icon: List, description: 'Full information per shot' },
    { id: 'compact', label: 'Compact', icon: Table, description: 'Condensed table view' },
    { id: 'storyboard', label: 'Storyboard', icon: Grid, description: 'Visual grid with images' },
];

export default function ShotListExport({
    projectId,
    projectName,
    scenes,
    shots,
    onClose
}: ShotListExportProps) {
    const [options, setOptions] = useState<ExportOptions>({
        format: 'pdf',
        layout: 'detailed',
        includeImages: true,
        includeThumbnails: true,
        includeNotes: true,
        includeTimecodes: true,
        groupByScene: true,
        pageSize: 'letter',
        orientation: 'portrait'
    });
    const [exporting, setExporting] = useState(false);
    const [exported, setExported] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Handle export
    const handleExport = async () => {
        setExporting(true);

        try {
            const res = await fetch(`/api/projects/${projectId}/export/shot-list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    options,
                    scenes: scenes.map(s => s.id),
                    shots: shots.map(s => s.id)
                })
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${projectName.replace(/\s+/g, '_')}_shot_list.${options.format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setExported(true);
            }
        } catch (error) {
            console.error('Error exporting:', error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-500/10 rounded-xl">
                            <FileText className="text-yellow-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Export Shot List</h2>
                            <p className="text-sm text-gray-500">
                                {shots.length} shots from {scenes.length} scenes
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Format Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3">Export Format</label>
                        <div className="grid grid-cols-3 gap-3">
                            {FORMAT_OPTIONS.map((format) => {
                                const Icon = format.icon;
                                return (
                                    <button
                                        key={format.id}
                                        onClick={() => setOptions({ ...options, format: format.id as any })}
                                        className={`p-4 rounded-xl border text-left transition-colors ${
                                            options.format === format.id
                                                ? 'border-yellow-500 bg-yellow-500/10'
                                                : 'border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <Icon size={24} className={options.format === format.id ? 'text-yellow-500' : 'text-gray-400'} />
                                        <p className="text-sm font-medium text-white mt-2">{format.label}</p>
                                        <p className="text-xs text-gray-500 mt-1">{format.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Layout Selection (PDF only) */}
                    {options.format === 'pdf' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-3">Layout Style</label>
                            <div className="grid grid-cols-3 gap-3">
                                {LAYOUT_OPTIONS.map((layout) => {
                                    const Icon = layout.icon;
                                    return (
                                        <button
                                            key={layout.id}
                                            onClick={() => setOptions({ ...options, layout: layout.id as any })}
                                            className={`p-4 rounded-xl border text-left transition-colors ${
                                                options.layout === layout.id
                                                    ? 'border-yellow-500 bg-yellow-500/10'
                                                    : 'border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <Icon size={24} className={options.layout === layout.id ? 'text-yellow-500' : 'text-gray-400'} />
                                            <p className="text-sm font-medium text-white mt-2">{layout.label}</p>
                                            <p className="text-xs text-gray-500 mt-1">{layout.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Quick Options */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10">
                            <input
                                type="checkbox"
                                checked={options.includeImages}
                                onChange={(e) => setOptions({ ...options, includeImages: e.target.checked })}
                                className="w-4 h-4 rounded border-white/20"
                            />
                            <div className="flex-1">
                                <p className="text-sm text-white">Include Shot Images</p>
                                <p className="text-xs text-gray-500">Add generated storyboard frames</p>
                            </div>
                            <Image size={18} className="text-gray-500" />
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10">
                            <input
                                type="checkbox"
                                checked={options.groupByScene}
                                onChange={(e) => setOptions({ ...options, groupByScene: e.target.checked })}
                                className="w-4 h-4 rounded border-white/20"
                            />
                            <div className="flex-1">
                                <p className="text-sm text-white">Group by Scene</p>
                                <p className="text-xs text-gray-500">Organize shots under scene headings</p>
                            </div>
                            <Film size={18} className="text-gray-500" />
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10">
                            <input
                                type="checkbox"
                                checked={options.includeNotes}
                                onChange={(e) => setOptions({ ...options, includeNotes: e.target.checked })}
                                className="w-4 h-4 rounded border-white/20"
                            />
                            <div className="flex-1">
                                <p className="text-sm text-white">Include Director Notes</p>
                                <p className="text-xs text-gray-500">Add shot notes and annotations</p>
                            </div>
                        </label>
                    </div>

                    {/* Advanced Options */}
                    <div>
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        >
                            <Settings size={16} />
                            Advanced Options
                            <ChevronDown size={14} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                        </button>

                        {showAdvanced && (
                            <div className="mt-4 p-4 bg-white/5 rounded-xl space-y-4">
                                {options.format === 'pdf' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Page Size</label>
                                                <select
                                                    value={options.pageSize}
                                                    onChange={(e) => setOptions({ ...options, pageSize: e.target.value as any })}
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                                >
                                                    <option value="letter">US Letter</option>
                                                    <option value="a4">A4</option>
                                                    <option value="legal">Legal</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Orientation</label>
                                                <select
                                                    value={options.orientation}
                                                    onChange={(e) => setOptions({ ...options, orientation: e.target.value as any })}
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                                >
                                                    <option value="portrait">Portrait</option>
                                                    <option value="landscape">Landscape</option>
                                                </select>
                                            </div>
                                        </div>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={options.includeTimecodes}
                                                onChange={(e) => setOptions({ ...options, includeTimecodes: e.target.checked })}
                                                className="w-4 h-4 rounded border-white/20"
                                            />
                                            <span className="text-sm text-gray-400">Include Timecodes</span>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={options.includeThumbnails}
                                                onChange={(e) => setOptions({ ...options, includeThumbnails: e.target.checked })}
                                                className="w-4 h-4 rounded border-white/20"
                                            />
                                            <span className="text-sm text-gray-400">Include Reference Thumbnails</span>
                                        </label>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Estimated: {shots.length * (options.includeImages ? 2 : 1)} pages
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={exporting || exported}
                            className="flex items-center gap-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50 transition-colors"
                        >
                            {exporting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Generating...
                                </>
                            ) : exported ? (
                                <>
                                    <Check size={18} />
                                    Downloaded!
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    Export
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
