'use client';

import React, { useState } from 'react';
import { Save, Plus, Key, Settings, Sliders } from 'lucide-react';

export default function EngineSettings() {
    const [apiKeys, setApiKeys] = useState({
        openai: '',
        replicate: '',
        elevenlabs: ''
    });

    const [newPreset, setNewPreset] = useState({
        name: '',
        description: '',
        prompt_injection: '',
        parameter_overrides: ''
    });

    const [saving, setSaving] = useState(false);

    const handleSaveKeys = () => {
        setSaving(true);
        // In a real app, save to secure storage or user profile
        localStorage.setItem('sw_api_keys', JSON.stringify(apiKeys));
        setTimeout(() => setSaving(false), 1000);
    };

    const handleAddPreset = async () => {
        if (!newPreset.name || !newPreset.prompt_injection) return;

        try {
            const res = await fetch('/api/style_presets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newPreset,
                    is_public: false,
                    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300&h=200'
                })
            });

            if (res.ok) {
                // Reset form
                setNewPreset({
                    name: '',
                    description: '',
                    prompt_injection: '',
                    parameter_overrides: ''
                });
                alert('Preset added successfully!');
            } else {
                console.error('Error adding preset');
                alert('Failed to add preset.');
            }
        } catch (error) {
            console.error('Error adding preset:', error);
            alert('Failed to add preset.');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/5 p-6 flex flex-col gap-2">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Settings className="text-yellow-500" /> Engine Room
                </h2>
                <nav className="space-y-1">
                    <button className="w-full text-left px-4 py-2 rounded-lg bg-white/10 text-white font-medium">
                        General Settings
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                        Team & Billing
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                        Integrations
                    </button>
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-12 overflow-y-auto">
                <div className="max-w-3xl space-y-12">

                    {/* API Keys Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Key className="text-yellow-500" size={24} />
                            <h3 className="text-2xl font-bold">API Configuration</h3>
                        </div>
                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">OpenAI API Key</label>
                                <input
                                    type="password"
                                    value={apiKeys.openai}
                                    onChange={e => setApiKeys({ ...apiKeys, openai: e.target.value })}
                                    placeholder="sk-..."
                                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Replicate API Token</label>
                                <input
                                    type="password"
                                    value={apiKeys.replicate}
                                    onChange={e => setApiKeys({ ...apiKeys, replicate: e.target.value })}
                                    placeholder="r8_..."
                                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveKeys}
                                    className="flex items-center gap-2 px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <Save size={18} /> {saving ? 'Saving...' : 'Save Keys'}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Style Presets Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Sliders className="text-yellow-500" size={24} />
                            <h3 className="text-2xl font-bold">Custom Style Presets</h3>
                        </div>
                        <div className="bg-[#121212] border border-white/5 rounded-xl p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-400">Preset Name</label>
                                    <input
                                        type="text"
                                        value={newPreset.name}
                                        onChange={e => setNewPreset({ ...newPreset, name: e.target.value })}
                                        placeholder="e.g. Neo-Noir Detective"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-yellow-500 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-400">Description</label>
                                    <input
                                        type="text"
                                        value={newPreset.description}
                                        onChange={e => setNewPreset({ ...newPreset, description: e.target.value })}
                                        placeholder="Short description..."
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-yellow-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Prompt Injection (The "Secret Sauce")</label>
                                <textarea
                                    value={newPreset.prompt_injection}
                                    onChange={e => setNewPreset({ ...newPreset, prompt_injection: e.target.value })}
                                    placeholder="e.g. cinematic lighting, high contrast, 35mm film grain, directed by Ridley Scott..."
                                    rows={3}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-yellow-500 focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Parameter Overrides</label>
                                <input
                                    type="text"
                                    value={newPreset.parameter_overrides}
                                    onChange={e => setNewPreset({ ...newPreset, parameter_overrides: e.target.value })}
                                    placeholder="e.g. --ar 2.35:1 --stylize 500"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-yellow-500 focus:outline-none"
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    onClick={handleAddPreset}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                                >
                                    <Plus size={18} /> Add New Preset
                                </button>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
