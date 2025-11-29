'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="w-full max-w-md rounded-xl bg-[#121212] border border-white/10"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Add Subscriber</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                        <X size={16} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">Email *</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">Tags</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="newsletter, beta (comma separated)"
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400">
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!email || saving}
                        className="px-4 py-2 rounded-lg font-medium disabled:opacity-50 bg-yellow-500 hover:bg-yellow-400 text-black"
                    >
                        {saving ? 'Adding...' : 'Add Subscriber'}
                    </button>
                </div>
            </div>
        </div>
    );
}
