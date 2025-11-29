'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Code, RefreshCw } from 'lucide-react';
import { BlogPost, BlogCategory } from '@/lib/blog';
import { PostEditorModal, ApiInfoModal, PostsTable } from './components';

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

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setShowEditor(true);
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
            <PostsTable 
                posts={filteredPosts}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
            />

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
