'use client';

import React from 'react';
import { X, Upload, Zap } from 'lucide-react';

interface UploadModalProps {
    onClose: () => void;
}

export default function UploadModal({ onClose }: UploadModalProps) {
    return (
        <div 
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8" 
            onClick={onClose}
        >
            <div 
                className="w-full max-w-xl bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Upload References</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center hover:border-purple-500/30 transition-colors cursor-pointer">
                        <Upload size={40} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-white font-medium mb-2">Drop images here or click to browse</p>
                        <p className="text-xs text-gray-500">Supports JPG, PNG, WebP up to 10MB</p>
                        <input type="file" className="hidden" accept="image/*" multiple />
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <Zap size={14} className="text-purple-400" />
                        <span className="text-xs text-gray-500">AI will automatically analyze and tag your images</span>
                    </div>
                </div>
                <div className="p-4 border-t border-white/5 flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-gray-400 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg font-medium">
                        Upload & Analyze
                    </button>
                </div>
            </div>
        </div>
    );
}
