'use client';

import React, { useState } from 'react';
import { BlogPost, BlogCategory } from '@/lib/blog';

interface PostEditorModalProps {
    post: BlogPost | null;
    categories: BlogCategory[];
    onClose: () => void;
    onSaved: () => void;
}

export default function PostEditorModal({ post, categories, onClose, onSaved }: PostEditorModalProps) {
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
