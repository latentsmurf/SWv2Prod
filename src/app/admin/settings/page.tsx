'use client';

import React, { useState, useEffect } from 'react';
import {
    Settings, Globe, Bell, Shield, Database, Zap, Mail, Key,
    Save, RefreshCw, AlertTriangle, CheckCircle, Eye, EyeOff,
    Upload, Download, Trash2, Clock, Server
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface SettingSection {
    id: string;
    name: string;
    icon: any;
    description: string;
}

interface Setting {
    key: string;
    label: string;
    description?: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'password' | 'textarea';
    value: any;
    options?: { value: string; label: string }[];
}

// ============================================================================
// SETTINGS DATA
// ============================================================================

const SECTIONS: SettingSection[] = [
    { id: 'general', name: 'General', icon: Globe, description: 'Basic application settings' },
    { id: 'security', name: 'Security', icon: Shield, description: 'Authentication and access control' },
    { id: 'ai', name: 'AI Services', icon: Zap, description: 'AI provider configuration' },
    { id: 'storage', name: 'Storage', icon: Database, description: 'File storage settings' },
    { id: 'email', name: 'Email', icon: Mail, description: 'Email service configuration' },
    { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Notification preferences' },
    { id: 'maintenance', name: 'Maintenance', icon: Server, description: 'System maintenance tools' },
];

const SETTINGS: Record<string, Setting[]> = {
    general: [
        { key: 'site_name', label: 'Site Name', type: 'text', value: 'SceneWeaver', description: 'The name displayed across the application' },
        { key: 'site_url', label: 'Site URL', type: 'text', value: 'https://app.sceneweaver.ai', description: 'Base URL for the application' },
        { key: 'support_email', label: 'Support Email', type: 'text', value: 'support@sceneweaver.ai' },
        { key: 'default_language', label: 'Default Language', type: 'select', value: 'en', options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'ja', label: 'Japanese' },
        ]},
        { key: 'timezone', label: 'Timezone', type: 'select', value: 'UTC', options: [
            { value: 'UTC', label: 'UTC' },
            { value: 'America/New_York', label: 'Eastern Time' },
            { value: 'America/Los_Angeles', label: 'Pacific Time' },
            { value: 'Europe/London', label: 'London' },
            { value: 'Asia/Tokyo', label: 'Tokyo' },
        ]},
        { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'boolean', value: false, description: 'Enable to show maintenance page to users' },
    ],
    security: [
        { key: 'require_email_verification', label: 'Require Email Verification', type: 'boolean', value: true },
        { key: 'session_timeout', label: 'Session Timeout (hours)', type: 'number', value: 24 },
        { key: 'max_login_attempts', label: 'Max Login Attempts', type: 'number', value: 5, description: 'Before temporary lockout' },
        { key: 'lockout_duration', label: 'Lockout Duration (minutes)', type: 'number', value: 15 },
        { key: 'require_2fa_admin', label: 'Require 2FA for Admins', type: 'boolean', value: true },
        { key: 'allowed_domains', label: 'Allowed Email Domains', type: 'textarea', value: '', description: 'Leave empty to allow all. One domain per line.' },
    ],
    ai: [
        { key: 'openai_api_key', label: 'OpenAI API Key', type: 'password', value: '••••••••••••••••' },
        { key: 'anthropic_api_key', label: 'Anthropic API Key', type: 'password', value: '••••••••••••••••' },
        { key: 'replicate_api_key', label: 'Replicate API Key', type: 'password', value: '••••••••••••••••' },
        { key: 'elevenlabs_api_key', label: 'ElevenLabs API Key', type: 'password', value: '••••••••••••••••' },
        { key: 'default_model', label: 'Default AI Model', type: 'select', value: 'gpt-4o', options: [
            { value: 'gpt-4o', label: 'GPT-4o' },
            { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
            { value: 'claude-3-opus', label: 'Claude 3 Opus' },
            { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
        ]},
        { key: 'rate_limit_per_minute', label: 'Rate Limit (requests/min)', type: 'number', value: 60 },
    ],
    storage: [
        { key: 'storage_provider', label: 'Storage Provider', type: 'select', value: 'gcs', options: [
            { value: 'gcs', label: 'Google Cloud Storage' },
            { value: 's3', label: 'Amazon S3' },
            { value: 'azure', label: 'Azure Blob Storage' },
            { value: 'local', label: 'Local Storage' },
        ]},
        { key: 'gcs_bucket', label: 'GCS Bucket Name', type: 'text', value: 'sceneweaver-media' },
        { key: 'gcs_project_id', label: 'GCS Project ID', type: 'text', value: 'sceneweaver-prod' },
        { key: 'max_upload_size', label: 'Max Upload Size (MB)', type: 'number', value: 500 },
        { key: 'allowed_file_types', label: 'Allowed File Types', type: 'text', value: 'jpg,jpeg,png,gif,mp4,mov,webm,mp3,wav' },
        { key: 'auto_cleanup_days', label: 'Auto Cleanup (days)', type: 'number', value: 90, description: 'Delete unused files after this many days. 0 to disable.' },
    ],
    email: [
        { key: 'email_provider', label: 'Email Provider', type: 'select', value: 'sendgrid', options: [
            { value: 'sendgrid', label: 'SendGrid' },
            { value: 'ses', label: 'Amazon SES' },
            { value: 'mailgun', label: 'Mailgun' },
            { value: 'smtp', label: 'Custom SMTP' },
        ]},
        { key: 'sendgrid_api_key', label: 'SendGrid API Key', type: 'password', value: '••••••••••••••••' },
        { key: 'from_email', label: 'From Email', type: 'text', value: 'noreply@sceneweaver.ai' },
        { key: 'from_name', label: 'From Name', type: 'text', value: 'SceneWeaver' },
        { key: 'reply_to', label: 'Reply To', type: 'text', value: 'support@sceneweaver.ai' },
    ],
    notifications: [
        { key: 'notify_new_user', label: 'New User Signup', type: 'boolean', value: true },
        { key: 'notify_new_subscription', label: 'New Subscription', type: 'boolean', value: true },
        { key: 'notify_payment_failed', label: 'Payment Failed', type: 'boolean', value: true },
        { key: 'notify_api_errors', label: 'API Errors (5xx)', type: 'boolean', value: true },
        { key: 'notify_high_usage', label: 'High Credit Usage', type: 'boolean', value: true },
        { key: 'slack_webhook', label: 'Slack Webhook URL', type: 'text', value: '', description: 'For admin notifications' },
        { key: 'discord_webhook', label: 'Discord Webhook URL', type: 'text', value: '', description: 'For admin notifications' },
    ],
    maintenance: [],
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('general');
    const [settings, setSettings] = useState(SETTINGS);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Fetch settings from API
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                if (res.ok) {
                    const data = await res.json();
                    // Update local settings with API values
                    setSettings(prev => {
                        const updated = { ...prev };
                        Object.keys(data).forEach(section => {
                            if (updated[section]) {
                                updated[section] = updated[section].map(setting => ({
                                    ...setting,
                                    value: data[section][setting.key] ?? setting.value
                                }));
                            }
                        });
                        return updated;
                    });
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSettingChange = (sectionId: string, key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [sectionId]: prev[sectionId].map(s => 
                s.key === key ? { ...s, value } : s
            )
        }));
        setHasChanges(true);
        setSaveMessage(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMessage(null);
        
        try {
            // Save each section that has changes
            const updates: Record<string, any> = {};
            settings[activeSection].forEach(setting => {
                updates[setting.key] = setting.value;
            });
            
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section: activeSection, updates })
            });
            
            if (res.ok) {
                setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
                setHasChanges(false);
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleClearCache = async () => {
        if (confirm('Are you sure you want to clear the cache?')) {
            // Simulate cache clear
            await new Promise(r => setTimeout(r, 500));
            alert('Cache cleared successfully');
        }
    };

    const handleReindexSearch = async () => {
        if (confirm('This may take a while. Continue?')) {
            alert('Search reindex started. You will be notified when complete.');
        }
    };

    const renderSettingInput = (setting: Setting, sectionId: string) => {
        const isPassword = setting.type === 'password';
        const showPass = showPassword[setting.key];

        switch (setting.type) {
            case 'boolean':
                return (
                    <button
                        onClick={() => handleSettingChange(sectionId, setting.key, !setting.value)}
                        className={`w-12 h-6 rounded-full transition-colors ${setting.value ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${setting.value ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                );
            case 'select':
                return (
                    <select
                        value={setting.value}
                        onChange={(e) => handleSettingChange(sectionId, setting.key, e.target.value)}
                        className="w-full md:w-64 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    >
                        {setting.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                );
            case 'textarea':
                return (
                    <textarea
                        value={setting.value}
                        onChange={(e) => handleSettingChange(sectionId, setting.key, e.target.value)}
                        rows={3}
                        className="w-full md:w-96 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
                    />
                );
            case 'password':
                return (
                    <div className="relative w-full md:w-64">
                        <input
                            type={showPass ? 'text' : 'password'}
                            value={setting.value}
                            onChange={(e) => handleSettingChange(sectionId, setting.key, e.target.value)}
                            className="w-full px-4 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg text-white"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(prev => ({ ...prev, [setting.key]: !prev[setting.key] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                );
            default:
                return (
                    <input
                        type={setting.type}
                        value={setting.value}
                        onChange={(e) => handleSettingChange(sectionId, setting.key, setting.type === 'number' ? Number(e.target.value) : e.target.value)}
                        className="w-full md:w-64 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-sm text-gray-500">Configure application settings</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/50 text-black font-semibold rounded-lg text-sm transition-colors"
                >
                    {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Unsaved Changes Warning */}
            {hasChanges && (
                <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm">
                    <AlertTriangle size={16} />
                    You have unsaved changes
                </div>
            )}
            
            {/* Save Message */}
            {saveMessage && (
                <div className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                    saveMessage.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                    {saveMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    {saveMessage.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <nav className="space-y-1">
                        {SECTIONS.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                    activeSection === section.id
                                        ? 'bg-yellow-500/10 text-yellow-400'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <section.icon size={18} />
                                <span className="text-sm font-medium">{section.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
                        <div className="p-4 border-b border-white/5">
                            <h2 className="text-lg font-semibold text-white">
                                {SECTIONS.find(s => s.id === activeSection)?.name}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {SECTIONS.find(s => s.id === activeSection)?.description}
                            </p>
                        </div>

                        {activeSection === 'maintenance' ? (
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={handleClearCache}
                                        className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <RefreshCw size={20} className="text-blue-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-white">Clear Cache</p>
                                            <p className="text-xs text-gray-500">Clear application cache</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleReindexSearch}
                                        className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <div className="p-2 bg-purple-500/10 rounded-lg">
                                            <Database size={20} className="text-purple-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-white">Reindex Search</p>
                                            <p className="text-xs text-gray-500">Rebuild search indices</p>
                                        </div>
                                    </button>

                                    <button className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                        <div className="p-2 bg-green-500/10 rounded-lg">
                                            <Download size={20} className="text-green-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-white">Export Data</p>
                                            <p className="text-xs text-gray-500">Download database backup</p>
                                        </div>
                                    </button>

                                    <button className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                                            <Clock size={20} className="text-yellow-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-white">Run Scheduled Jobs</p>
                                            <p className="text-xs text-gray-500">Execute pending cron jobs</p>
                                        </div>
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <h3 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h3>
                                    <button className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors">
                                        <div className="p-2 bg-red-500/20 rounded-lg">
                                            <Trash2 size={20} className="text-red-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-red-400">Purge Deleted Data</p>
                                            <p className="text-xs text-gray-500">Permanently delete soft-deleted records</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 space-y-6">
                                {settings[activeSection]?.map(setting => (
                                    <div key={setting.key} className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                        <div className="flex-1">
                                            <label className="text-sm font-medium text-white">{setting.label}</label>
                                            {setting.description && (
                                                <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
                                            )}
                                        </div>
                                        {renderSettingInput(setting, activeSection)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
