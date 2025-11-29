'use client';

import React from 'react';
import { EmailTemplate } from '@/lib/email';

interface TemplatePreviewModalProps {
    template: EmailTemplate;
    onClose: () => void;
}

export default function TemplatePreviewModal({ template, onClose }: TemplatePreviewModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div 
                className="w-full max-w-3xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col"
                style={{ backgroundColor: 'var(--sw-background-secondary)', border: '1px solid var(--sw-border)' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--sw-border)' }}>
                    <div>
                        <h2 className="font-bold" style={{ color: 'var(--sw-foreground)' }}>{template.name}</h2>
                        <p className="text-sm" style={{ color: 'var(--sw-foreground-muted)' }}>{template.subject}</p>
                    </div>
                    <button onClick={onClose} className="text-2xl" style={{ color: 'var(--sw-foreground-muted)' }}>×</button>
                </div>
                <div className="flex-1 overflow-auto">
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
