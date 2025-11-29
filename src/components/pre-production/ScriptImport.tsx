'use client';

import React, { useState, useRef } from 'react';
import {
    Upload, FileText, File, Check, X, Loader2, AlertCircle,
    ChevronRight, FileCode, Download, Eye
} from 'lucide-react';

interface ImportedScript {
    title: string;
    content: string;
    scenes: ImportedScene[];
    characters: string[];
    format: string;
}

interface ImportedScene {
    heading: string;
    content: string;
    characters: string[];
}

interface ScriptImportProps {
    projectId: string;
    onImport: (script: ImportedScript) => void;
    onClose: () => void;
}

const SUPPORTED_FORMATS = [
    { id: 'fdx', label: 'Final Draft (.fdx)', ext: '.fdx', icon: FileCode },
    { id: 'fountain', label: 'Fountain (.fountain)', ext: '.fountain', icon: FileText },
    { id: 'txt', label: 'Plain Text (.txt)', ext: '.txt', icon: File },
    { id: 'pdf', label: 'PDF (.pdf)', ext: '.pdf', icon: FileText },
];

export default function ScriptImport({ projectId, onImport, onClose }: ScriptImportProps) {
    const [file, setFile] = useState<File | null>(null);
    const [parsing, setParsing] = useState(false);
    const [parsed, setParsed] = useState<ImportedScript | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<'raw' | 'structured'>('structured');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection
    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setError(null);
        setParsing(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const res = await fetch('/api/scripts/parse', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to parse script');
            }

            const result = await res.json();
            setParsed(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse script');
        } finally {
            setParsing(false);
        }
    };

    // Handle import
    const handleImport = () => {
        if (parsed) {
            onImport(parsed);
        }
    };

    // Get file extension
    const getFileExtension = (filename: string) => {
        return filename.split('.').pop()?.toLowerCase() || '';
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-gray-50 dark:bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-xl">
                            <Upload className="text-yellow-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Import Script</h2>
                            <p className="text-sm text-gray-500">Import from Final Draft, Fountain, or text</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!file ? (
                        // File Selection
                        <div>
                            {/* Supported formats */}
                            <p className="text-sm text-gray-400 mb-4">Supported formats:</p>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {SUPPORTED_FORMATS.map((format) => {
                                    const Icon = format.icon;
                                    return (
                                        <div
                                            key={format.id}
                                            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                                        >
                                            <Icon className="text-gray-500" size={20} />
                                            <div>
                                                <p className="text-sm text-white">{format.label}</p>
                                                <p className="text-xs text-gray-500">{format.ext}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Drop zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-white/20 hover:border-yellow-500/50 rounded-2xl p-12 text-center cursor-pointer transition-colors"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".fdx,.fountain,.txt,.pdf"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleFileSelect(f);
                                    }}
                                    className="hidden"
                                />
                                <Upload className="mx-auto text-gray-500 mb-4" size={48} />
                                <p className="text-white font-medium mb-1">
                                    Drop your script file here
                                </p>
                                <p className="text-sm text-gray-500">
                                    or click to browse
                                </p>
                            </div>
                        </div>
                    ) : parsing ? (
                        // Parsing
                        <div className="text-center py-12">
                            <Loader2 className="mx-auto animate-spin text-yellow-500 mb-4" size={48} />
                            <p className="text-white font-medium">Parsing script...</p>
                            <p className="text-sm text-gray-500 mt-2">{file.name}</p>
                        </div>
                    ) : error ? (
                        // Error
                        <div className="text-center py-12">
                            <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
                            <p className="text-white font-medium mb-2">Failed to parse script</p>
                            <p className="text-sm text-red-400 mb-6">{error}</p>
                            <button
                                onClick={() => {
                                    setFile(null);
                                    setError(null);
                                }}
                                className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white"
                            >
                                Try Another File
                            </button>
                        </div>
                    ) : parsed ? (
                        // Preview
                        <div>
                            {/* File info */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-green-400" size={20} />
                                    <div>
                                        <p className="text-white font-medium">{parsed.title || file.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {parsed.scenes.length} scenes • {parsed.characters.length} characters
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                                    <button
                                        onClick={() => setPreviewMode('structured')}
                                        className={`px-3 py-1 rounded text-sm ${
                                            previewMode === 'structured'
                                                ? 'bg-yellow-500 text-black'
                                                : 'text-gray-400'
                                        }`}
                                    >
                                        Structured
                                    </button>
                                    <button
                                        onClick={() => setPreviewMode('raw')}
                                        className={`px-3 py-1 rounded text-sm ${
                                            previewMode === 'raw'
                                                ? 'bg-yellow-500 text-black'
                                                : 'text-gray-400'
                                        }`}
                                    >
                                        Raw
                                    </button>
                                </div>
                            </div>

                            {/* Preview content */}
                            <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl max-h-80 overflow-y-auto">
                                {previewMode === 'structured' ? (
                                    <div className="divide-y divide-white/5">
                                        {parsed.scenes.map((scene, index) => (
                                            <div key={index} className="p-4">
                                                <p className="text-xs text-yellow-500 font-mono mb-2">
                                                    {scene.heading}
                                                </p>
                                                <p className="text-sm text-gray-400 line-clamp-3">
                                                    {scene.content.slice(0, 200)}...
                                                </p>
                                                {scene.characters.length > 0 && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {scene.characters.slice(0, 3).map((char, i) => (
                                                            <span
                                                                key={i}
                                                                className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-500"
                                                            >
                                                                {char}
                                                            </span>
                                                        ))}
                                                        {scene.characters.length > 3 && (
                                                            <span className="text-xs text-gray-600">
                                                                +{scene.characters.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <pre className="p-4 text-sm text-gray-400 font-mono whitespace-pre-wrap">
                                        {parsed.content.slice(0, 2000)}
                                        {parsed.content.length > 2000 && '...'}
                                    </pre>
                                )}
                            </div>

                            {/* Detected info */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-2">Detected Scenes</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{parsed.scenes.length}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-2">Detected Characters</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{parsed.characters.length}</p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-white/5">
                    <button
                        onClick={() => {
                            setFile(null);
                            setParsed(null);
                            setError(null);
                        }}
                        className="text-gray-400 hover:text-white"
                        disabled={!file}
                    >
                        {file ? 'Choose Different File' : ''}
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={!parsed}
                            className="flex items-center gap-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50 transition-colors"
                        >
                            <Download size={18} />
                            Import Script
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Fountain parser utility
export function parseFountain(content: string): ImportedScript {
    const scenes: ImportedScene[] = [];
    const characters = new Set<string>();
    
    // Scene heading pattern
    const scenePattern = /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)(.+)$/gim;
    
    // Character pattern (all caps before dialogue)
    const characterPattern = /^([A-Z][A-Z\s]+)$/gm;
    
    // Extract title from first line if it looks like a title
    const lines = content.split('\n');
    let title = '';
    if (lines[0] && !lines[0].match(scenePattern)) {
        title = lines[0].trim();
    }

    // Split by scene headings
    const sceneSplits = content.split(scenePattern);
    
    for (let i = 1; i < sceneSplits.length; i += 3) {
        const prefix = sceneSplits[i] || '';
        const location = sceneSplits[i + 1] || '';
        const sceneContent = sceneSplits[i + 2] || '';
        
        const heading = `${prefix}${location}`.trim();
        
        // Extract characters from scene
        const sceneCharacters: string[] = [];
        let match;
        while ((match = characterPattern.exec(sceneContent)) !== null) {
            const name = match[1].trim();
            if (name.length > 1 && name.length < 30) {
                characters.add(name);
                if (!sceneCharacters.includes(name)) {
                    sceneCharacters.push(name);
                }
            }
        }
        
        scenes.push({
            heading,
            content: sceneContent.trim(),
            characters: sceneCharacters
        });
    }

    return {
        title,
        content,
        scenes,
        characters: Array.from(characters),
        format: 'fountain'
    };
}
