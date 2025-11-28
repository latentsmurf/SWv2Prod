'use client';

import React, { useState, useEffect } from 'react';
import { 
    Save, Plus, Key, Settings, Sliders, Check, Loader2, 
    Bell, Moon, Sun, Monitor, Palette, Film, Image, 
    Volume2, Download, Trash2, RefreshCw, Shield, User,
    CreditCard, Users, Zap, HardDrive, Globe, Eye, EyeOff
} from 'lucide-react';

type SettingsTab = 'general' | 'api' | 'defaults' | 'notifications' | 'billing';

interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    defaultCoverage: string;
    defaultStyleMode: 'storyboard' | 'cinematic';
    autoSaveInterval: number;
    showTutorials: boolean;
    soundEffects: boolean;
    emailNotifications: boolean;
    browserNotifications: boolean;
    defaultExportFormat: string;
    defaultResolution: string;
}

export default function EngineSettings() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [apiKeys, setApiKeys] = useState({
        openai: '',
        replicate: '',
        elevenlabs: '',
        runway: '',
        suno: ''
    });
    const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

    const [preferences, setPreferences] = useState<UserPreferences>({
        theme: 'dark',
        defaultCoverage: 'standard',
        defaultStyleMode: 'cinematic',
        autoSaveInterval: 30,
        showTutorials: true,
        soundEffects: true,
        emailNotifications: true,
        browserNotifications: false,
        defaultExportFormat: 'mp4',
        defaultResolution: '1080p'
    });

    const [newPreset, setNewPreset] = useState({
        name: '',
        description: '',
        prompt_injection: '',
        parameter_overrides: ''
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Load saved preferences
    useEffect(() => {
        const savedPrefs = localStorage.getItem('sw_preferences');
        if (savedPrefs) {
            setPreferences(JSON.parse(savedPrefs));
        }
        const savedKeys = localStorage.getItem('sw_api_keys');
        if (savedKeys) {
            setApiKeys(JSON.parse(savedKeys));
        }
    }, []);

    const handleSavePreferences = async () => {
        setSaving(true);
        try {
            localStorage.setItem('sw_preferences', JSON.stringify(preferences));
            await fetch('/api/account/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferences)
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Error saving preferences:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveKeys = async () => {
        setSaving(true);
        try {
            localStorage.setItem('sw_api_keys', JSON.stringify(apiKeys));
            await fetch('/api/account/api-keys', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiKeys)
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Error saving API keys:', error);
        } finally {
            setSaving(false);
        }
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
                setNewPreset({
                    name: '',
                    description: '',
                    prompt_injection: '',
                    parameter_overrides: ''
                });
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (error) {
            console.error('Error adding preset:', error);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'api', label: 'API Keys', icon: Key },
        { id: 'defaults', label: 'Defaults', icon: Sliders },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'billing', label: 'Billing', icon: CreditCard },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/5 p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Settings className="text-yellow-500" /> Settings
                </h2>
                <nav className="space-y-1 flex-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as SettingsTab)}
                                className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-yellow-500/10 text-yellow-500 font-medium'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Save Status */}
                {saved && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg text-sm">
                        <Check size={16} />
                        Saved successfully
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 p-12 overflow-y-auto">
                <div className="max-w-3xl">
                    {/* General Settings Tab */}
                    {activeTab === 'general' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">General Settings</h3>
                                <p className="text-gray-500">Customize your SceneWeaver experience</p>
                            </div>

                            {/* Theme */}
                            <div className="bg-[#121212] border border-white/5 rounded-xl p-6">
                                <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                                    <Palette size={18} className="text-yellow-500" />
                                    Appearance
                                </h4>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'light', label: 'Light', icon: Sun },
                                        { id: 'dark', label: 'Dark', icon: Moon },
                                        { id: 'system', label: 'System', icon: Monitor },
                                    ].map((theme) => {
                                        const Icon = theme.icon;
                                        return (
                                            <button
                                                key={theme.id}
                                                onClick={() => setPreferences({ ...preferences, theme: theme.id as any })}
                                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                                                    preferences.theme === theme.id
                                                        ? 'border-yellow-500 bg-yellow-500/10'
                                                        : 'border-white/10 hover:border-white/20'
                                                }`}
                                            >
                                                <Icon size={24} className={preferences.theme === theme.id ? 'text-yellow-500' : 'text-gray-400'} />
                                                <span className="text-sm">{theme.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Preferences */}
                            <div className="bg-[#121212] border border-white/5 rounded-xl p-6 space-y-4">
                                <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                                    <Settings size={18} className="text-yellow-500" />
                                    Preferences
                                </h4>
                                
                                <label className="flex items-center justify-between py-3 border-b border-white/5">
                                    <div>
                                        <p className="text-white">Show tutorials</p>
                                        <p className="text-xs text-gray-500">Display helpful tips for new features</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.showTutorials}
                                        onChange={(e) => setPreferences({ ...preferences, showTutorials: e.target.checked })}
                                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-yellow-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between py-3 border-b border-white/5">
                                    <div>
                                        <p className="text-white">Sound effects</p>
                                        <p className="text-xs text-gray-500">Play sounds for actions and notifications</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.soundEffects}
                                        onChange={(e) => setPreferences({ ...preferences, soundEffects: e.target.checked })}
                                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-yellow-500"
                                    />
                                </label>

                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="text-white">Auto-save interval</p>
                                        <p className="text-xs text-gray-500">How often to save your work automatically</p>
                                    </div>
                                    <select
                                        value={preferences.autoSaveInterval}
                                        onChange={(e) => setPreferences({ ...preferences, autoSaveInterval: Number(e.target.value) })}
                                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                                    >
                                        <option value={15}>15 seconds</option>
                                        <option value={30}>30 seconds</option>
                                        <option value={60}>1 minute</option>
                                        <option value={300}>5 minutes</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSavePreferences}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {/* API Keys Tab */}
                    {activeTab === 'api' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">API Configuration</h3>
                                <p className="text-gray-500">Connect your own API keys for generation services</p>
                            </div>

                            <div className="bg-[#121212] border border-white/5 rounded-xl p-6 space-y-6">
                                {[
                                    { key: 'openai', label: 'OpenAI API Key', placeholder: 'sk-...', description: 'For GPT text generation' },
                                    { key: 'replicate', label: 'Replicate API Token', placeholder: 'r8_...', description: 'For image generation' },
                                    { key: 'elevenlabs', label: 'ElevenLabs API Key', placeholder: 'xi_...', description: 'For voice-over generation' },
                                    { key: 'runway', label: 'Runway API Key', placeholder: 'run_...', description: 'For video generation' },
                                    { key: 'suno', label: 'Suno API Key', placeholder: 'suno_...', description: 'For music generation' },
                                ].map((api) => (
                                    <div key={api.key} className="space-y-2">
                                        <label className="flex items-center justify-between">
                                            <div>
                                                <span className="text-sm font-medium text-white">{api.label}</span>
                                                <p className="text-xs text-gray-500">{api.description}</p>
                                            </div>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showApiKeys[api.key] ? 'text' : 'password'}
                                                value={apiKeys[api.key as keyof typeof apiKeys]}
                                                onChange={(e) => setApiKeys({ ...apiKeys, [api.key]: e.target.value })}
                                                placeholder={api.placeholder}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 pr-12 focus:border-yellow-500 focus:outline-none"
                                            />
                                            <button
                                                onClick={() => setShowApiKeys({ ...showApiKeys, [api.key]: !showApiKeys[api.key] })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                            >
                                                {showApiKeys[api.key] ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                                <Shield className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="text-sm text-yellow-500 font-medium">Your keys are encrypted</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        API keys are stored securely and never shared. Using your own keys bypasses credit usage.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveKeys}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save API Keys
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Defaults Tab */}
                    {activeTab === 'defaults' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Default Settings</h3>
                                <p className="text-gray-500">Set defaults for new projects</p>
                            </div>

                            <div className="bg-[#121212] border border-white/5 rounded-xl p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Default Coverage</label>
                                        <select
                                            value={preferences.defaultCoverage}
                                            onChange={(e) => setPreferences({ ...preferences, defaultCoverage: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white"
                                        >
                                            <option value="minimal">Minimal (2-4 shots)</option>
                                            <option value="standard">Standard (4-8 shots)</option>
                                            <option value="heavy">Heavy (8-15 shots)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Default Style Mode</label>
                                        <select
                                            value={preferences.defaultStyleMode}
                                            onChange={(e) => setPreferences({ ...preferences, defaultStyleMode: e.target.value as any })}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white"
                                        >
                                            <option value="storyboard">Storyboard (Line Art)</option>
                                            <option value="cinematic">Cinematic (Full Color)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Default Export Format</label>
                                        <select
                                            value={preferences.defaultExportFormat}
                                            onChange={(e) => setPreferences({ ...preferences, defaultExportFormat: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white"
                                        >
                                            <option value="mp4">MP4 (H.264)</option>
                                            <option value="mov">MOV (ProRes)</option>
                                            <option value="webm">WebM</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Default Resolution</label>
                                        <select
                                            value={preferences.defaultResolution}
                                            onChange={(e) => setPreferences({ ...preferences, defaultResolution: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white"
                                        >
                                            <option value="720p">720p (HD)</option>
                                            <option value="1080p">1080p (Full HD)</option>
                                            <option value="4k">4K (Ultra HD)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Style Presets */}
                            <div className="bg-[#121212] border border-white/5 rounded-xl p-6 space-y-4">
                                <h4 className="font-medium text-white flex items-center gap-2">
                                    <Sliders size={18} className="text-yellow-500" />
                                    Custom Style Preset
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Preset Name</label>
                                        <input
                                            type="text"
                                            value={newPreset.name}
                                            onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })}
                                            placeholder="e.g. Neo-Noir Detective"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Description</label>
                                        <input
                                            type="text"
                                            value={newPreset.description}
                                            onChange={(e) => setNewPreset({ ...newPreset, description: e.target.value })}
                                            placeholder="Short description..."
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Prompt Injection</label>
                                    <textarea
                                        value={newPreset.prompt_injection}
                                        onChange={(e) => setNewPreset({ ...newPreset, prompt_injection: e.target.value })}
                                        placeholder="e.g. cinematic lighting, high contrast, 35mm film grain..."
                                        rows={3}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2"
                                    />
                                </div>
                                <button
                                    onClick={handleAddPreset}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
                                >
                                    <Plus size={18} /> Add Preset
                                </button>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSavePreferences}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Defaults
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Notification Settings</h3>
                                <p className="text-gray-500">Control how you receive updates</p>
                            </div>

                            <div className="bg-[#121212] border border-white/5 rounded-xl p-6 space-y-4">
                                <label className="flex items-center justify-between py-3 border-b border-white/5">
                                    <div>
                                        <p className="text-white">Email notifications</p>
                                        <p className="text-xs text-gray-500">Receive updates about renders and exports via email</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.emailNotifications}
                                        onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-yellow-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="text-white">Browser notifications</p>
                                        <p className="text-xs text-gray-500">Show desktop notifications when tasks complete</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.browserNotifications}
                                        onChange={(e) => setPreferences({ ...preferences, browserNotifications: e.target.checked })}
                                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-yellow-500"
                                    />
                                </label>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSavePreferences}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Notifications
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Billing Tab */}
                    {activeTab === 'billing' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Billing & Subscription</h3>
                                <p className="text-gray-500">Manage your plan and payment methods</p>
                            </div>

                            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-yellow-500/80">Current Plan</p>
                                        <p className="text-2xl font-bold text-white">Free</p>
                                    </div>
                                    <Zap className="text-yellow-500" size={32} />
                                </div>
                                <p className="text-sm text-gray-400 mb-4">50 credits per month • Basic features</p>
                                <button className="w-full py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400">
                                    Upgrade to Pro
                                </button>
                            </div>

                            <div className="bg-[#121212] border border-white/5 rounded-xl p-6">
                                <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                                    <CreditCard size={18} className="text-yellow-500" />
                                    Payment Method
                                </h4>
                                <p className="text-gray-500 text-sm">No payment method on file</p>
                                <button className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white">
                                    Add Payment Method
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
