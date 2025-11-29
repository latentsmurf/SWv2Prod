'use client';

import React, { useState } from 'react';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div 
                className="w-full max-w-lg rounded-xl p-6"
                style={{ backgroundColor: 'var(--sw-background-secondary)', border: '1px solid var(--sw-border)' }}
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--sw-foreground)' }}>
                    Create Campaign
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>
                            Campaign Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., March Newsletter"
                            className="w-full px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>
                            Subject Line
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g., 🚀 New Features This Month"
                            className="w-full px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>
                            Template
                        </label>
                        <select
                            value={templateId}
                            onChange={(e) => setTemplateId(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        >
                            <option value="">Select a template</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg"
                        style={{ color: 'var(--sw-foreground-muted)' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!name || !subject || !templateId || saving}
                        className="px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                        style={{ backgroundColor: 'var(--sw-accent)', color: 'var(--sw-accent-foreground)' }}
                    >
                        {saving ? 'Creating...' : 'Create Campaign'}
                    </button>
                </div>
            </div>
        </div>
    );
}
