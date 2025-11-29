'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div 
                className="w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col bg-[#121212] border border-white/10"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h2 className="font-bold text-white">
                        {template ? 'Edit Template' : 'Create Template'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                        <X size={16} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-auto p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-400">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-400">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as EmailTemplate['category'])}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                            >
                                <option value="transactional">Transactional</option>
                                <option value="marketing">Marketing</option>
                                <option value="notification">Notification</option>
                                <option value="onboarding">Onboarding</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">HTML Content</label>
                        <textarea
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            rows={15}
                            className="w-full px-4 py-2 rounded-lg font-mono text-sm bg-white/5 border border-white/10 text-white"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-white/5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name || !subject || saving}
                        className="px-4 py-2 rounded-lg font-medium disabled:opacity-50 bg-yellow-500 hover:bg-yellow-400 text-black"
                    >
                        {saving ? 'Saving...' : 'Save Template'}
                    </button>
                </div>
            </div>
        </div>
    );
}
