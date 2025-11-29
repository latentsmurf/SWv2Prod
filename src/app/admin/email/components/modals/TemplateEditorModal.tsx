'use client';

import React, { useState } from 'react';
import { EmailTemplate } from '@/lib/email';

interface TemplateEditorModalProps {
    template: EmailTemplate | null;
    onClose: () => void;
    onSaved: () => void;
}

export default function TemplateEditorModal({ template, onClose, onSaved }: TemplateEditorModalProps) {
    const [name, setName] = useState(template?.name || '');
    const [subject, setSubject] = useState(template?.subject || '');
    const [description, setDescription] = useState(template?.description || '');
    const [htmlContent, setHtmlContent] = useState(template?.htmlContent || '');
    const [category, setCategory] = useState(template?.category || 'marketing');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const method = template ? 'PUT' : 'POST';
            const body = template 
                ? { id: template.id, name, subject, description, htmlContent, category }
                : { name, subject, description, htmlContent, category, variables: [] };

            const res = await fetch('/api/admin/email/templates', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                onSaved();
            }
        } catch (error) {
            console.error('Failed to save template:', error);
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div 
                className="w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col"
                style={{ backgroundColor: 'var(--sw-background-secondary)', border: '1px solid var(--sw-border)' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--sw-border)' }}>
                    <h2 className="font-bold" style={{ color: 'var(--sw-foreground)' }}>
                        {template ? 'Edit Template' : 'Create Template'}
                    </h2>
                    <button onClick={onClose} className="text-2xl" style={{ color: 'var(--sw-foreground-muted)' }}>×</button>
                </div>
                
                <div className="flex-1 overflow-auto p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg"
                                style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as EmailTemplate['category'])}
                                className="w-full px-3 py-2 rounded-lg"
                                style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                            >
                                <option value="transactional">Transactional</option>
                                <option value="marketing">Marketing</option>
                                <option value="notification">Notification</option>
                                <option value="onboarding">Onboarding</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>HTML Content</label>
                        <textarea
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            rows={15}
                            className="w-full px-3 py-2 rounded-lg font-mono text-sm"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        />
                    </div>
                </div>

                <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--sw-border)' }}>
                    <button onClick={onClose} className="px-4 py-2 rounded-lg" style={{ color: 'var(--sw-foreground-muted)' }}>
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name || !subject || saving}
                        className="px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                        style={{ backgroundColor: 'var(--sw-accent)', color: 'var(--sw-accent-foreground)' }}
                    >
                        {saving ? 'Saving...' : 'Save Template'}
                    </button>
                </div>
            </div>
        </div>
    );
}
