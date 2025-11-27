"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, User, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function BlogIndex() {
    const posts = [
        {
            slug: 'sample-post',
            title: 'Mastering the Kubrick Look',
            excerpt: 'Learn how to achieve the iconic one-point perspective and cold lighting style in your AI generations.',
            date: 'Nov 25, 2025',
            author: 'Sarah Connor',
            category: 'Tutorial'
        },
        {
            slug: '#',
            title: 'Lighting Techniques for Sci-Fi',
            excerpt: 'A deep dive into neon, chiaroscuro, and volumetric lighting for futuristic scenes.',
            date: 'Nov 20, 2025',
            author: 'Rick Deckard',
            category: 'Guide'
        },
        {
            slug: '#',
            title: 'SceneWeaver v2.0 Release Notes',
            excerpt: 'Everything you need to know about the latest update, including the new Greenlight Wizard.',
            date: 'Nov 15, 2025',
            author: 'Team Nano',
            category: 'News'
        }
    ];

    const [cloned, setCloned] = useState<string | null>(null);

    const handleClone = (e: React.MouseEvent, slug: string) => {
        e.preventDefault();
        e.stopPropagation();
        setCloned(slug);
        setTimeout(() => setCloned(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
            {/* Header */}
            <div className="py-20 px-6 text-center bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
                <h1 className="text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                    The Cutting Room
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Insights, tutorials, and updates from the world of AI filmmaking.
                </p>
            </div>

            {/* Grid */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="group flex flex-col bg-[#121212] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                        >
                            <div className="h-48 bg-white/5 relative overflow-hidden">
                                {/* Placeholder for blog image */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 to-blue-900/20 group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                                    {post.category}
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                                    <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                                </div>

                                <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-400 transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                                    {post.excerpt}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-sm font-medium text-white group-hover:translate-x-2 transition-transform">
                                        Read Article <ArrowRight size={16} className="text-yellow-500" />
                                    </div>
                                    <button
                                        onClick={(e) => handleClone(e, post.slug)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-all"
                                    >
                                        {cloned === post.slug ? (
                                            <>
                                                <Check size={12} className="text-green-400" /> Cloned
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={12} /> Clone Template
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
