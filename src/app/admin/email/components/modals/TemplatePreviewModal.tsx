'use client';

import React from 'react';
import { X } from 'lucide-react';
import { EmailTemplate } from '@/lib/email';

interface TemplatePreviewModalProps {
    template: EmailTemplate;
    onClose: () => void;
}

export default function TemplatePreviewModal({ template, onClose }: TemplatePreviewModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div 
                className="w-full max-w-3xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col bg-[#121212] border border-white/10"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-white">{template.name}</h2>
                        <p className="text-sm text-gray-500">{template.subject}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                        <X size={16} />
                    </button>
                </div>
                <div className="flex-1 overflow-auto bg-white">
                    <iframe
                        srcDoc={template.htmlContent}
                        className="w-full h-full min-h-[500px]"
                        style={{ border: 'none' }}
                    />
                </div>
            </div>
        </div>
    );
}
