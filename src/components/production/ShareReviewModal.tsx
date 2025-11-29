'use client';

import React, { useState, useEffect } from 'react';
import {
    Share2, Link, Copy, Check, Mail, MessageSquare, Lock,
    Globe, Eye, Clock, Users, X, Loader2, RefreshCw, Settings
} from 'lucide-react';

interface ShareReviewModalProps {
    projectId: string;
    projectName: string;
    onClose: () => void;
}

interface ReviewLink {
    id: string;
    token: string;
    url: string;
    name?: string;
    password_protected: boolean;
    expires_at?: string;
    view_count: number;
    allow_comments: boolean;
    created_at: string;
}

export default function ShareReviewModal({ projectId, projectName, onClose }: ShareReviewModalProps) {
    const [links, setLinks] = useState<ReviewLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

    // Settings for new link
    const [linkName, setLinkName] = useState('');
    const [passwordProtected, setPasswordProtected] = useState(false);
    const [password, setPassword] = useState('');
    const [expiresIn, setExpiresIn] = useState<'never' | '24h' | '7d' | '30d'>('never');
    const [allowComments, setAllowComments] = useState(true);

    // Fetch existing links
    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/review-links`);
                if (res.ok) {
                    setLinks(await res.json());
                }
            } catch (error) {
                console.error('Error fetching review links:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLinks();
    }, [projectId]);

    // Create new review link
    const createLink = async () => {
        setCreating(true);
        try {
            const expiresAt = expiresIn === 'never' ? null : 
                new Date(Date.now() + {
                    '24h': 24 * 60 * 60 * 1000,
                    '7d': 7 * 24 * 60 * 60 * 1000,
                    '30d': 30 * 24 * 60 * 60 * 1000
                }[expiresIn]!).toISOString();

            const res = await fetch(`/api/projects/${projectId}/review-links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: linkName || `Review Link ${links.length + 1}`,
                    password_protected: passwordProtected,
                    password: passwordProtected ? password : undefined,
                    expires_at: expiresAt,
                    allow_comments: allowComments
                })
            });

            if (res.ok) {
                const newLink = await res.json();
                setLinks(prev => [newLink, ...prev]);
                
                // Reset form
                setLinkName('');
                setPasswordProtected(false);
                setPassword('');
                setExpiresIn('never');
                setAllowComments(true);
            }
        } catch (error) {
            console.error('Error creating review link:', error);
        } finally {
            setCreating(false);
        }
    };

    // Copy link to clipboard
    const copyLink = async (link: ReviewLink) => {
        await navigator.clipboard.writeText(link.url);
        setCopiedLinkId(link.id);
        setTimeout(() => setCopiedLinkId(null), 2000);
    };

    // Delete link
    const deleteLink = async (linkId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/review-links/${linkId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setLinks(prev => prev.filter(l => l.id !== linkId));
            }
        } catch (error) {
            console.error('Error deleting link:', error);
        }
    };

    const formatExpiry = (expiresAt?: string) => {
        if (!expiresAt) return 'Never';
        const date = new Date(expiresAt);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        if (diff < 0) return 'Expired';
        if (diff < 24 * 60 * 60 * 1000) return 'Less than 24h';
        if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))} days`;
        return date.toLocaleDateString();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Share2 className="text-yellow-500" />
                            Share for Review
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">{projectName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Create New Link */}
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <h3 className="text-sm font-medium text-white mb-4">Create Review Link</h3>
                        
                        <div className="space-y-4">
                            {/* Link Name */}
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Link Name (optional)</label>
                                <input
                                    type="text"
                                    value={linkName}
                                    onChange={(e) => setLinkName(e.target.value)}
                                    placeholder="e.g., Client Review, Director Cut"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50"
                                />
                            </div>

                            {/* Options Row */}
                            <div className="grid grid-cols-3 gap-4">
                                {/* Expiration */}
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Expires</label>
                                    <select
                                        value={expiresIn}
                                        onChange={(e) => setExpiresIn(e.target.value as any)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                                    >
                                        <option value="never">Never</option>
                                        <option value="24h">24 hours</option>
                                        <option value="7d">7 days</option>
                                        <option value="30d">30 days</option>
                                    </select>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Password</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={passwordProtected}
                                            onChange={(e) => setPasswordProtected(e.target.checked)}
                                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-yellow-500"
                                        />
                                        {passwordProtected && (
                                            <input
                                                type="text"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Set password"
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                                            />
                                        )}
                                        {!passwordProtected && (
                                            <span className="text-sm text-gray-500">No password</span>
                                        )}
                                    </div>
                                </div>

                                {/* Comments */}
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Comments</label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={allowComments}
                                            onChange={(e) => setAllowComments(e.target.checked)}
                                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-yellow-500"
                                        />
                                        <span className="text-sm text-gray-300">Allow comments</span>
                                    </label>
                                </div>
                            </div>

                            {/* Create Button */}
                            <button
                                onClick={createLink}
                                disabled={creating}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
                            >
                                {creating ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Link size={16} />
                                )}
                                Create Link
                            </button>
                        </div>
                    </div>

                    {/* Existing Links */}
                    <div className="p-6">
                        <h3 className="text-sm font-medium text-gray-400 mb-4">
                            Active Links ({links.length})
                        </h3>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin text-yellow-500" size={24} />
                            </div>
                        ) : links.length === 0 ? (
                            <div className="text-center py-8">
                                <Link className="mx-auto text-gray-600 mb-2" size={32} />
                                <p className="text-gray-500 text-sm">No review links yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {links.map((link) => (
                                    <div
                                        key={link.id}
                                        className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-medium">
                                                    {link.name || 'Review Link'}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Eye size={12} />
                                                        {link.view_count} views
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {formatExpiry(link.expires_at)}
                                                    </span>
                                                    {link.password_protected && (
                                                        <span className="flex items-center gap-1 text-yellow-500">
                                                            <Lock size={12} />
                                                            Protected
                                                        </span>
                                                    )}
                                                    {link.allow_comments && (
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare size={12} />
                                                            Comments
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <code className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded truncate flex-1">
                                                        {link.url}
                                                    </code>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => copyLink(link)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        copiedLinkId === link.id
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                                                    }`}
                                                >
                                                    {copiedLinkId === link.id ? (
                                                        <Check size={16} />
                                                    ) : (
                                                        <Copy size={16} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => deleteLink(link.id)}
                                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-white/5 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        Review links allow external collaborators to view and comment on your project.
                    </p>
                    <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
