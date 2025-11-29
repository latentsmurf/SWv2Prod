'use client';

import React, { useState } from 'react';

interface AddSubscriberModalProps {
    onClose: () => void;
    onAdded: () => void;
}

export default function AddSubscriberModal({ onClose, onAdded }: AddSubscriberModalProps) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [tags, setTags] = useState('');
    const [saving, setSaving] = useState(false);

    const handleAdd = async () => {
        if (!email) return;
        setSaving(true);

        try {
            const res = await fetch('/api/admin/email/subscribers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name: name || undefined,
                    tags: tags ? tags.split(',').map(t => t.trim()) : [],
                }),
            });
            if (res.ok) {
                onAdded();
            }
        } catch (error) {
            console.error('Failed to add subscriber:', error);
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div 
                className="w-full max-w-md rounded-xl p-6"
                style={{ backgroundColor: 'var(--sw-background-secondary)', border: '1px solid var(--sw-border)' }}
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--sw-foreground)' }}>Add Subscriber</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>Email *</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="w-full px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>Tags</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="newsletter, beta (comma separated)"
                            className="w-full px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg" style={{ color: 'var(--sw-foreground-muted)' }}>
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!email || saving}
                        className="px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                        style={{ backgroundColor: 'var(--sw-accent)', color: 'var(--sw-accent-foreground)' }}
                    >
                        {saving ? 'Adding...' : 'Add Subscriber'}
                    </button>
                </div>
            </div>
        </div>
    );
}
