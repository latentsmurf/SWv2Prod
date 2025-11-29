'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Edit, Trash2, Eye, EyeOff, ExternalLink, RefreshCw } from 'lucide-react';
import { BlogPost } from '@/lib/blog';

interface PostsTableProps {
    posts: BlogPost[];
    loading: boolean;
    onEdit: (post: BlogPost) => void;
    onDelete: (postId: string) => void;
    onStatusChange: (postId: string, status: BlogPost['status']) => void;
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    published: { bg: 'bg-green-500/20', text: 'text-green-400' },
    draft: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    archived: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
};

function StatusBadge({ status }: { status: BlogPost['status'] }) {
    const style = STATUS_STYLES[status] || STATUS_STYLES.draft;
    return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text} capitalize`}>
            {status}
        </span>
    );
}

export default function PostsTable({ posts, loading, onEdit, onDelete, onStatusChange }: PostsTableProps) {
    if (loading) {
        return (
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
                    <tbody>
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500">
                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                Loading posts...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
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
                    <tbody>
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500">
                                No posts found
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    return (
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
                    {posts.map(post => (
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
                                        onClick={() => onEdit(post)}
                                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                        title="Edit post"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    {post.status === 'published' ? (
                                        <button
                                            onClick={() => onStatusChange(post.id, 'draft')}
                                            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                            title="Unpublish"
                                        >
                                            <EyeOff size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onStatusChange(post.id, 'published')}
                                            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                            title="Publish"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onDelete(post.id)}
                                        className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
