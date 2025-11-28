'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
    Upload, Image, Video, Music, File, X, Check, Loader2,
    Cloud, AlertCircle, Trash2, Eye, Plus
} from 'lucide-react';

interface UploadedFile {
    id: string;
    file: File;
    preview?: string;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    url?: string;
    error?: string;
}

interface AssetUploaderProps {
    projectId?: string;
    onUploadComplete?: (assets: { url: string; name: string; type: string }[]) => void;
    acceptedTypes?: string[];
    maxFiles?: number;
    maxSizeMB?: number;
    category?: 'cast' | 'location' | 'wardrobe' | 'prop' | 'image' | 'video' | 'audio';
}

const FILE_TYPE_CONFIG = {
    image: {
        accept: 'image/*',
        icon: Image,
        color: 'text-blue-400',
        extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    },
    video: {
        accept: 'video/*',
        icon: Video,
        color: 'text-purple-400',
        extensions: ['.mp4', '.mov', '.webm', '.avi']
    },
    audio: {
        accept: 'audio/*',
        icon: Music,
        color: 'text-green-400',
        extensions: ['.mp3', '.wav', '.m4a', '.ogg']
    }
};

export default function AssetUploader({
    projectId,
    onUploadComplete,
    acceptedTypes = ['image/*', 'video/*'],
    maxFiles = 10,
    maxSizeMB = 100,
    category
}: AssetUploaderProps) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getFileType = (file: File): 'image' | 'video' | 'audio' | 'other' => {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('video/')) return 'video';
        if (file.type.startsWith('audio/')) return 'audio';
        return 'other';
    };

    const createPreview = (file: File): Promise<string | undefined> => {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            } else {
                resolve(undefined);
            }
        });
    };

    const handleFiles = useCallback(async (newFiles: FileList | File[]) => {
        const fileArray = Array.from(newFiles);
        
        // Validate file count
        if (files.length + fileArray.length > maxFiles) {
            alert(`Maximum ${maxFiles} files allowed`);
            return;
        }

        // Process each file
        const processedFiles: UploadedFile[] = [];
        
        for (const file of fileArray) {
            // Validate file size
            if (file.size > maxSizeMB * 1024 * 1024) {
                processedFiles.push({
                    id: crypto.randomUUID(),
                    file,
                    progress: 0,
                    status: 'failed',
                    error: `File too large (max ${maxSizeMB}MB)`
                });
                continue;
            }

            const preview = await createPreview(file);
            processedFiles.push({
                id: crypto.randomUUID(),
                file,
                preview,
                progress: 0,
                status: 'pending'
            });
        }

        setFiles(prev => [...prev, ...processedFiles]);

        // Auto-start upload for pending files
        for (const pf of processedFiles.filter(f => f.status === 'pending')) {
            uploadFile(pf);
        }
    }, [files.length, maxFiles, maxSizeMB]);

    const uploadFile = async (uploadedFile: UploadedFile) => {
        setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id ? { ...f, status: 'uploading' } : f
        ));

        try {
            const formData = new FormData();
            formData.append('file', uploadedFile.file);
            if (projectId) formData.append('project_id', projectId);
            if (category) formData.append('category', category);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();

            setFiles(prev => prev.map(f => 
                f.id === uploadedFile.id 
                    ? { ...f, status: 'completed', progress: 100, url: data.url }
                    : f
            ));

        } catch (error) {
            setFiles(prev => prev.map(f => 
                f.id === uploadedFile.id 
                    ? { ...f, status: 'failed', error: 'Upload failed' }
                    : f
            ));
        }
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const retryUpload = (id: string) => {
        const file = files.find(f => f.id === id);
        if (file) {
            setFiles(prev => prev.map(f => 
                f.id === id ? { ...f, status: 'pending', error: undefined } : f
            ));
            uploadFile({ ...file, status: 'pending' });
        }
    };

    // Drag and drop handlers
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            handleFiles(droppedFiles);
        }
    };

    const completedFiles = files.filter(f => f.status === 'completed');

    // Notify parent of completed uploads
    React.useEffect(() => {
        if (completedFiles.length > 0) {
            const assets = completedFiles
                .filter(f => f.url)
                .map(f => ({
                    url: f.url!,
                    name: f.file.name,
                    type: getFileType(f.file)
                }));
            onUploadComplete?.(assets);
        }
    }, [completedFiles.length]);

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes.join(',')}
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    className="hidden"
                />

                <Cloud className={`mx-auto mb-4 ${isDragging ? 'text-yellow-500' : 'text-gray-500'}`} size={48} />
                
                <p className="text-white font-medium mb-1">
                    {isDragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
                </p>
                <p className="text-sm text-gray-500">
                    Max {maxFiles} files, up to {maxSizeMB}MB each
                </p>

                <div className="flex items-center justify-center gap-4 mt-4">
                    {Object.entries(FILE_TYPE_CONFIG).map(([type, config]) => {
                        const Icon = config.icon;
                        return (
                            <div key={type} className="flex items-center gap-1 text-xs text-gray-500">
                                <Icon size={14} className={config.color} />
                                {config.extensions.join(', ')}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file) => {
                        const fileType = getFileType(file.file);
                        const config = FILE_TYPE_CONFIG[fileType as keyof typeof FILE_TYPE_CONFIG];
                        const Icon = config?.icon || File;

                        return (
                            <div
                                key={file.id}
                                className={`flex items-center gap-4 p-3 rounded-xl border ${
                                    file.status === 'failed'
                                        ? 'bg-red-500/10 border-red-500/20'
                                        : file.status === 'completed'
                                        ? 'bg-green-500/10 border-green-500/20'
                                        : 'bg-white/5 border-white/10'
                                }`}
                            >
                                {/* Preview/Icon */}
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0">
                                    {file.preview ? (
                                        <img
                                            src={file.preview}
                                            alt={file.file.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center ${config?.color || 'text-gray-500'}`}>
                                            <Icon size={20} />
                                        </div>
                                    )}
                                </div>

                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{file.file.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    
                                    {/* Progress Bar */}
                                    {file.status === 'uploading' && (
                                        <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-yellow-500 transition-all"
                                                style={{ width: `${file.progress}%` }}
                                            />
                                        </div>
                                    )}

                                    {/* Error Message */}
                                    {file.error && (
                                        <p className="text-xs text-red-400 mt-1">{file.error}</p>
                                    )}
                                </div>

                                {/* Status/Actions */}
                                <div className="flex items-center gap-2">
                                    {file.status === 'uploading' && (
                                        <Loader2 size={18} className="animate-spin text-yellow-500" />
                                    )}
                                    {file.status === 'completed' && (
                                        <Check size={18} className="text-green-400" />
                                    )}
                                    {file.status === 'failed' && (
                                        <>
                                            <button
                                                onClick={() => retryUpload(file.id)}
                                                className="p-1.5 text-yellow-500 hover:bg-yellow-500/10 rounded-lg"
                                                title="Retry"
                                            >
                                                <AlertCircle size={16} />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                        title="Remove"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Summary */}
            {files.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                        {completedFiles.length} of {files.length} uploaded
                    </span>
                    {files.some(f => f.status === 'failed') && (
                        <button
                            onClick={() => {
                                files.filter(f => f.status === 'failed').forEach(f => retryUpload(f.id));
                            }}
                            className="text-yellow-500 hover:text-yellow-400"
                        >
                            Retry all failed
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// Compact version for inline use
export function AssetUploadButton({
    onUpload,
    accept = 'image/*',
    children
}: {
    onUpload: (file: File) => void;
    accept?: string;
    children?: React.ReactNode;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        onUpload(file);
                        e.target.value = '';
                    }
                }}
                className="hidden"
            />
            <button
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
            >
                {children || (
                    <>
                        <Plus size={16} />
                        Upload
                    </>
                )}
            </button>
        </>
    );
}
