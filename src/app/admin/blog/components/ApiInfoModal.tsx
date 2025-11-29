'use client';

import React, { useState } from 'react';
import { Code, Check, Copy } from 'lucide-react';

interface ApiInfoModalProps {
    onClose: () => void;
}

const COMPATIBLE_APPS = [
    'MarsEdit (Mac)',
    'Open Live Writer (Windows)',
    'Blogo (Mac)',
    'IA Writer',
    'Ulysses',
    'Byword',
    'Desk (Mac)',
    'Any MetaWeblog client',
];

export default function ApiInfoModal({ onClose }: ApiInfoModalProps) {
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const apiEndpoint = typeof window !== 'undefined' 
        ? `${window.location.origin}/api/blog/xmlrpc`
        : '/api/blog/xmlrpc';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div 
                className="w-full max-w-2xl rounded-xl overflow-hidden bg-[#0f0f0f] border border-white/10"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="font-bold text-white text-lg flex items-center gap-2">
                        <Code size={20} />
                        External Blog Software Setup
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-gray-400">
                        Connect your favorite blog writing software to SceneWeaver using the MetaWeblog API.
                    </p>

                    <div className="space-y-4">
                        <h3 className="text-white font-medium">Connection Settings</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">API Endpoint (XML-RPC URL)</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-yellow-400 text-sm">
                                        {apiEndpoint}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(apiEndpoint, 'endpoint')}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400"
                                    >
                                        {copied === 'endpoint' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Blog ID</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-yellow-400 text-sm">1</code>
                                    <button
                                        onClick={() => copyToClipboard('1', 'blogid')}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400"
                                    >
                                        {copied === 'blogid' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Username</label>
                                <code className="block px-3 py-2 rounded-lg bg-white/5 text-gray-300 text-sm">
                                    Your email or username
                                </code>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Password / API Key</label>
                                <code className="block px-3 py-2 rounded-lg bg-white/5 text-gray-300 text-sm">
                                    Set BLOG_API_KEY in your .env file
                                </code>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-white font-medium">Compatible Software</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {COMPATIBLE_APPS.map((app, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                    <Check size={14} className="text-green-400" />
                                    {app}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-yellow-400 text-sm">
                            <strong>Tip:</strong> Add <code className="px-1 py-0.5 rounded bg-black/30">BLOG_API_KEY=your_secret_key</code> to your .env file for secure authentication.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
