'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    FileText, Plus, Search, Filter, MoreVertical, Edit, Trash2, 
    Eye, EyeOff, Calendar, Clock, ExternalLink, RefreshCw, 
    Check, X, Globe, Code, Copy, Settings
} from 'lucide-react';
import { BlogPost, BlogCategory } from '@/lib/blog';

type StatusFilter = 'all' | 'published' | 'draft' | 'scheduled' | 'archived';

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [showEditor, setShowEditor] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [showApiInfo, setShowApiInfo] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [postsRes, categoriesRes] = await Promise.all([
                fetch('/api/blog/posts?status=all'),
                fetch('/api/blog/categories'),
            ]);

            if (postsRes.ok) {
                const data = await postsRes.json();
                setPosts(data.posts || []);
            }
            if (categoriesRes.ok) {
                const data = await categoriesRes.json();
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Failed to fetch blog data:', error);
        }
        setLoading(false);
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = !searchQuery || 
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        
        try {
            const res = await fetch(`/api/blog/posts/${postId}`, { method: 'DELETE' });
            if (res.ok) {
                setPosts(posts.filter(p => p.id !== postId));
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
        }
    };

    const handleStatusChange = async (postId: string, newStatus: BlogPost['status']) => {
        try {
            const res = await fetch(`/api/blog/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setPosts(posts.map(p => p.id === postId ? { ...p, status: newStatus } : p));
            }
        } catch (error) {
            console.error('Failed to update post status:', error);
        }
    };

    const stats = {
        total: posts.length,
        published: posts.filter(p => p.status === 'published').length,
        draft: posts.filter(p => p.status === 'draft').length,
        scheduled: posts.filter(p => p.status === 'scheduled').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        Blog Management
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Create, edit, and manage blog posts
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowApiInfo(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors bg-white/5 text-gray-400 hover:text-white"
                    >
                        <Code size={16} />
                        API Setup
                    </button>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors bg-white/5 text-gray-400 hover:text-white"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button
                        onClick={() => { setEditingPost(null); setShowEditor(true); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-yellow-500 text-black hover:bg-yellow-400"
                    >
                        <Plus size={16} />
                        New Post
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Posts', value: stats.total, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Published', value: stats.published, color: 'from-green-500 to-emerald-500' },
                    { label: 'Drafts', value: stats.draft, color: 'from-yellow-500 to-orange-500' },
                    { label: 'Scheduled', value: stats.scheduled, color: 'from-purple-500 to-pink-500' },
                ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-500/50"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            {/* Posts Table */}
            <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="text-left p-4 text-sm font-medium text-gray-400">Post</th>
                            <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                            <th className="text-left p-4 text-sm font-medium text-gray-400">Author</th>
                            <th className="text-left p-4 text-sm font-medium text-gray-400">Date</th>
                            <th className="text-left p-4 text-sm font-medium text-gray-400">Views</th>
                            <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Loading posts...
                                </td>
                            </tr>
                        ) : filteredPosts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No posts found
                                </td>
                            </tr>
                        ) : (
                            filteredPosts.map(post => (
                                <tr key={post.id} className="hover:bg-white/5">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {post.coverImage ? (
                                                <img 
                                                    src={post.coverImage} 
                                                    alt=""
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                                                    <FileText size={20} className="text-gray-500" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-white line-clamp-1">
                                                    {post.title}
                                                </div>
                                                <div className="text-sm text-gray-500 line-clamp-1">
                                                    {post.slug}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={post.status} />
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">
                                        {post.author.name}
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">
                                        {post.publishedAt 
                                            ? new Date(post.publishedAt).toLocaleDateString()
                                            : new Date(post.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">
                                        {post.viewCount.toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                target="_blank"
                                                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                                title="View post"
                                            >
                                                <ExternalLink size={16} />
                                            </Link>
                                            <button
                                                onClick={() => { setEditingPost(post); setShowEditor(true); }}
                                                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                                title="Edit post"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {post.status === 'published' ? (
                                                <button
                                                    onClick={() => handleStatusChange(post.id, 'draft')}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                                    title="Unpublish"
                                                >
                                                    <EyeOff size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleStatusChange(post.id, 'published')}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                                    title="Publish"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Post Editor Modal */}
            {showEditor && (
                <PostEditorModal
                    post={editingPost}
                    categories={categories}
                    onClose={() => { setShowEditor(false); setEditingPost(null); }}
                    onSaved={() => {
                        setShowEditor(false);
                        setEditingPost(null);
                        fetchData();
                    }}
                />
            )}

            {/* API Info Modal */}
            {showApiInfo && (
                <ApiInfoModal onClose={() => setShowApiInfo(false)} />
            )}
        </div>
    );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: BlogPost['status'] }) {
    const styles: Record<string, { bg: string; text: string }> = {
        published: { bg: 'bg-green-500/20', text: 'text-green-400' },
        draft: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
        scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
        archived: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
    };

    const style = styles[status] || styles.draft;

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text} capitalize`}>
            {status}
        </span>
    );
}

// ============================================================================
// POST EDITOR MODAL
// ============================================================================

function PostEditorModal({ post, categories, onClose, onSaved }: {
    post: BlogPost | null;
    categories: BlogCategory[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const [title, setTitle] = useState(post?.title || '');
    const [slug, setSlug] = useState(post?.slug || '');
    const [content, setContent] = useState(post?.content || '');
    const [excerpt, setExcerpt] = useState(post?.excerpt || '');
    const [coverImage, setCoverImage] = useState(post?.coverImage || '');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(post?.categories || []);
    const [tags, setTags] = useState(post?.tags?.join(', ') || '');
    const [status, setStatus] = useState<BlogPost['status']>(post?.status || 'draft');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!title || !content) return;
        setSaving(true);

        try {
            const method = post ? 'PUT' : 'POST';
            const url = post ? `/api/blog/posts/${post.id}` : '/api/blog/posts';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                    content,
                    excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
                    coverImage,
                    categories: selectedCategories,
                    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                    status,
                }),
            });

            if (res.ok) {
                onSaved();
            }
        } catch (error) {
            console.error('Failed to save post:', error);
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div 
                className="w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col bg-[#0f0f0f] border border-white/10"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="font-bold text-white text-lg">
                        {post ? 'Edit Post' : 'Create New Post'}
                    </h2>
                    <div className="flex items-center gap-2">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as BlogPost['status'])}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="scheduled">Scheduled</option>
                        </select>
                        <button
                            onClick={handleSave}
                            disabled={!title || !content || saving}
                            className="px-4 py-1.5 rounded-lg bg-yellow-500 text-black font-medium text-sm disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl px-2">×</button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Post title"
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="auto-generated-from-title"
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-1">Cover Image URL</label>
                        <input
                            type="text"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-1">Excerpt</label>
                        <textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Brief description..."
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-1">Content (HTML)</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="<p>Your content here...</p>"
                            rows={12}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 font-mono text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Categories</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            if (selectedCategories.includes(cat.name)) {
                                                setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
                                            } else {
                                                setSelectedCategories([...selectedCategories, cat.name]);
                                            }
                                        }}
                                        className={`px-3 py-1 rounded-lg text-sm ${
                                            selectedCategories.includes(cat.name)
                                                ? 'bg-yellow-500 text-black'
                                                : 'bg-white/5 text-gray-400'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="tutorial, guide, ai"
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// API INFO MODAL
// ============================================================================

function ApiInfoModal({ onClose }: { onClose: () => void }) {
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
                            {[
                                'MarsEdit (Mac)',
                                'Open Live Writer (Windows)',
                                'Blogo (Mac)',
                                'IA Writer',
                                'Ulysses',
                                'Byword',
                                'Desk (Mac)',
                                'Any MetaWeblog client',
                            ].map((app, i) => (
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
