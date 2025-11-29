'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { EmailTemplate } from '@/lib/email';

interface CreateCampaignModalProps {
    templates: EmailTemplate[];
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateCampaignModal({ templates, onClose, onCreated }: CreateCampaignModalProps) {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [templateId, setTemplateId] = useState('');
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (!name || !subject || !templateId) return;
        setSaving(true);

        try {
            const res = await fetch('/api/admin/email/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, subject, templateId }),
            });
            if (res.ok) {
                onCreated();
            }
        } catch (error) {
            console.error('Failed to create campaign:', error);
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="w-full max-w-lg rounded-xl bg-[#121212] border border-white/10"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Create Campaign</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                        <X size={16} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">
                            Campaign Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., March Newsletter"
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">
                            Subject Line
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g., 🚀 New Features This Month"
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">
                            Template
                        </label>
                        <select
                            value={templateId}
                            onChange={(e) => setTemplateId(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                        >
                            <option value="">Select a template</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!name || !subject || !templateId || saving}
                        className="px-4 py-2 rounded-lg font-medium disabled:opacity-50 bg-yellow-500 hover:bg-yellow-400 text-black"
                    >
                        {saving ? 'Creating...' : 'Create Campaign'}
                    </button>
                </div>
            </div>
        </div>
    );
}
