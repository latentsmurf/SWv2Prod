'use client';

import React, { useState } from 'react';
import {
    Download, FileText, Image, Presentation, X, Loader2,
    Check, Grid, FileImage, Film, Settings
} from 'lucide-react';
import { Scene, Shot, StoryboardExportOptions } from '@/types';
import { SHOT_TYPE_LABELS } from '@/lib/coverage-presets';

interface StoryboardExportProps {
    projectId: string;
    projectName: string;
    scenes: Scene[];
    shots: Shot[];
    onClose: () => void;
}

type ExportFormat = 'pdf' | 'png_strip' | 'pitch_deck' | 'fcpxml';

export default function StoryboardExport({
    projectId,
    projectName,
    scenes,
    shots,
    onClose
}: StoryboardExportProps) {
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
    const [options, setOptions] = useState<StoryboardExportOptions>({
        format: 'pdf',
        includeNotes: true,
        includeDialogue: true,
        panelsPerRow: 3,
        paperSize: 'letter'
    });
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    const completedShots = shots.filter(s => s.status === 'completed');

    const formats = [
        {
            id: 'pdf' as const,
            name: 'PDF Storyboard',
            description: 'Traditional storyboard layout with shot panels and descriptions',
            icon: FileText,
            enabled: true
        },
        {
            id: 'png_strip' as const,
            name: 'Image Strips',
            description: 'Horizontal strips per scene, great for quick reference',
            icon: FileImage,
            enabled: true
        },
        {
            id: 'pitch_deck' as const,
            name: 'Pitch Deck',
            description: 'Presentation-ready slides with title and key frames',
            icon: Presentation,
            enabled: true
        },
        {
            id: 'fcpxml' as const,
            name: 'FCPXML / EDL',
            description: 'Import into DaVinci Resolve, Premiere, or Final Cut',
            icon: Film,
            enabled: true
        }
    ];

    const handleExport = async () => {
        setIsExporting(true);
        setExportProgress(0);

        try {
            const response = await fetch('/api/export/storyboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    project_name: projectName,
                    format: selectedFormat,
                    options,
                    scene_ids: scenes.map(s => s.id),
                    shot_ids: completedShots.map(s => s.id)
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;

                // Set filename based on format
                const extensions: Record<ExportFormat, string> = {
                    pdf: 'pdf',
                    png_strip: 'zip',
                    pitch_deck: 'pptx',
                    fcpxml: 'fcpxml'
                };
                link.download = `${projectName.replace(/\s+/g, '_')}_storyboard.${extensions[selectedFormat]}`;
                link.click();
                URL.revokeObjectURL(url);

                setExportProgress(100);
                setTimeout(onClose, 1000);
            } else {
                throw new Error('Export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    // Client-side PDF generation for immediate preview
    const generateClientPDF = async () => {
        // This would use @react-pdf/renderer for client-side generation
        // For now, we'll use the server endpoint
        handleExport();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Download className="text-yellow-500" />
                            Export Storyboard
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {completedShots.length} shots ready for export
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Format Selection */}
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">Export Format</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {formats.map((format) => {
                            const Icon = format.icon;
                            const isSelected = selectedFormat === format.id;
                            return (
                                <button
                                    key={format.id}
                                    onClick={() => setSelectedFormat(format.id)}
                                    disabled={!format.enabled}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                                        isSelected
                                            ? 'border-yellow-500 bg-yellow-500/10'
                                            : format.enabled
                                                ? 'border-white/10 bg-white/5 hover:border-white/20'
                                                : 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/10 text-gray-400'}`}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-white">{format.name}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{format.description}</p>
                                        </div>
                                        {isSelected && (
                                            <Check size={18} className="text-yellow-500" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Options (only for PDF) */}
                {selectedFormat === 'pdf' && (
                    <div className="p-6 border-b border-white/5 space-y-4">
                        <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Settings size={14} />
                            PDF Options
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Panels per row */}
                            <div>
                                <label className="text-xs text-gray-500 block mb-2">Panels per row</label>
                                <div className="flex gap-2">
                                    {[2, 3, 4].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => setOptions(prev => ({ ...prev, panelsPerRow: num }))}
                                            className={`flex-1 py-2 rounded-lg border transition-colors ${
                                                options.panelsPerRow === num
                                                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                                                    : 'border-white/10 bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Paper size */}
                            <div>
                                <label className="text-xs text-gray-500 block mb-2">Paper size</label>
                                <div className="flex gap-2">
                                    {(['letter', 'a4', 'tabloid'] as const).map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setOptions(prev => ({ ...prev, paperSize: size }))}
                                            className={`flex-1 py-2 rounded-lg border transition-colors uppercase text-sm ${
                                                options.paperSize === size
                                                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                                                    : 'border-white/10 bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={options.includeNotes}
                                    onChange={(e) => setOptions(prev => ({ ...prev, includeNotes: e.target.checked }))}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-yellow-500 focus:ring-yellow-500/20"
                                />
                                <span className="text-sm text-gray-300">Include shot notes</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={options.includeDialogue}
                                    onChange={(e) => setOptions(prev => ({ ...prev, includeDialogue: e.target.checked }))}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-yellow-500 focus:ring-yellow-500/20"
                                />
                                <span className="text-sm text-gray-300">Include dialogue</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Preview */}
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">Preview</h3>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className={`grid gap-2 ${
                            selectedFormat === 'pdf' 
                                ? `grid-cols-${options.panelsPerRow}` 
                                : 'grid-cols-6'
                        }`} style={{
                            gridTemplateColumns: `repeat(${selectedFormat === 'pdf' ? options.panelsPerRow : 6}, minmax(0, 1fr))`
                        }}>
                            {completedShots.slice(0, selectedFormat === 'pdf' ? options.panelsPerRow * 2 : 6).map((shot, i) => (
                                <div
                                    key={shot.id}
                                    className="aspect-video bg-black rounded overflow-hidden"
                                >
                                    {shot.proxy_path ? (
                                        <img
                                            src={shot.proxy_path}
                                            alt={`Shot ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <Grid size={16} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {completedShots.length > (selectedFormat === 'pdf' ? options.panelsPerRow * 2 : 6) && (
                            <p className="text-xs text-gray-500 text-center mt-3">
                                +{completedShots.length - (selectedFormat === 'pdf' ? options.panelsPerRow * 2 : 6)} more shots
                            </p>
                        )}
                    </div>
                </div>

                {/* Progress */}
                {isExporting && (
                    <div className="px-6 py-4 bg-yellow-500/10 border-b border-yellow-500/20">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-yellow-500 flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" />
                                Exporting...
                            </span>
                            <span className="text-yellow-500 font-mono">{exportProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-yellow-500/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-yellow-500 transition-all duration-300"
                                style={{ width: `${exportProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="p-6 flex items-center justify-between bg-white/5">
                    <div className="text-sm text-gray-500">
                        {completedShots.length === 0 ? (
                            <span className="text-orange-400">No completed shots to export</span>
                        ) : (
                            <span>{completedShots.length} shots • {scenes.length} scenes</span>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={isExporting || completedShots.length === 0}
                            className="flex items-center gap-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download size={16} />
                                    Export {selectedFormat.toUpperCase()}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// PDF Document Component (for @react-pdf/renderer)
// This would be used for client-side PDF generation
export function StoryboardPDFDocument({
    projectName,
    scenes,
    shots,
    options
}: {
    projectName: string;
    scenes: Scene[];
    shots: Shot[];
    options: StoryboardExportOptions;
}) {
    // This would be implemented with @react-pdf/renderer
    // For now, we use server-side generation
    return null;
}
