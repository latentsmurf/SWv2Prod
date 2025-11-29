'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Calendar, Clock, ArrowRight, Tag, ChevronRight, User } from 'lucide-react';
import { BlogPost, BlogCategory } from '@/lib/blog';
import NewsletterSignup from '@/components/marketing/NewsletterSignup';

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [postsRes, categoriesRes, tagsRes] = await Promise.all([
                fetch('/api/blog/posts'),
                fetch('/api/blog/categories'),
                fetch('/api/blog/tags'),
            ]);

            if (postsRes.ok) {
                const data = await postsRes.json();
                setPosts(data.posts || []);
            }
            if (categoriesRes.ok) {
                const data = await categoriesRes.json();
                setCategories(data.categories || []);
            }
            if (tagsRes.ok) {
                const data = await tagsRes.json();
                setTags(data.tags || []);
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
        const matchesCategory = !selectedCategory || post.categories.includes(selectedCategory);
        return matchesSearch && matchesCategory;
    });

    const featuredPost = filteredPosts[0];
    const recentPosts = filteredPosts.slice(1);

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            {/* Header */}
            <header className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                                <span className="text-black font-bold text-lg">SW</span>
                            </div>
                            <span className="text-white font-semibold text-xl">Blog</span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
                            <Link href="/blog" className="text-white font-medium">Blog</Link>
                            <Link href="/production" className="text-gray-400 hover:text-white transition-colors">Studio</Link>
                        </nav>
                        <Link 
                            href="/login"
                            className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-medium text-sm transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        SceneWeaver Blog
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                        Insights, tutorials, and updates from the future of AI filmmaking
                    </p>

                    {/* Search */}
                    <div className="max-w-xl mx-auto relative">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
                        />
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="px-4 sm:px-6 lg:px-8 pb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                !selectedCategory 
                                    ? 'bg-yellow-500 text-black' 
                                    : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                        >
                            All Posts
                        </button>
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.name)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                    selectedCategory === category.name
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-white/5 text-gray-400 hover:text-white'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Content */}
            <main className="px-4 sm:px-6 lg:px-8 pb-20">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-400">No posts found</p>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Featured Post */}
                                {featuredPost && (
                                    <article className="group">
                                        <Link href={`/blog/${featuredPost.slug}`}>
                                            <div className="relative aspect-[2/1] rounded-2xl overflow-hidden mb-6">
                                                {featuredPost.coverImage ? (
                                                    <img 
                                                        src={featuredPost.coverImage} 
                                                        alt={featuredPost.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-yellow-500/20 to-purple-500/20" />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                                <div className="absolute bottom-6 left-6 right-6">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        {featuredPost.categories.slice(0, 2).map((cat, i) => (
                                                            <span 
                                                                key={i}
                                                                className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium"
                                                            >
                                                                {cat}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                                                        {featuredPost.title}
                                                    </h2>
                                                    <p className="text-gray-300 line-clamp-2">
                                                        {featuredPost.excerpt}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                {featuredPost.author.avatar ? (
                                                    <img src={featuredPost.author.avatar} alt="" className="w-6 h-6 rounded-full" />
                                                ) : (
                                                    <User size={16} />
                                                )}
                                                <span>{featuredPost.author.name}</span>
                                            </div>
                                            <span>·</span>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {featuredPost.publishedAt && new Date(featuredPost.publishedAt).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    year: 'numeric' 
                                                })}
                                            </div>
                                            <span>·</span>
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {featuredPost.readingTime} min read
                                            </div>
                                        </div>
                                    </article>
                                )}

                                {/* Recent Posts Grid */}
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {recentPosts.map(post => (
                                        <article key={post.id} className="group">
                                            <Link href={`/blog/${post.slug}`}>
                                                <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4">
                                                    {post.coverImage ? (
                                                        <img 
                                                            src={post.coverImage} 
                                                            alt={post.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {post.categories.slice(0, 1).map((cat, i) => (
                                                        <span 
                                                            key={i}
                                                            className="text-yellow-400 text-xs font-medium"
                                                        >
                                                            {cat}
                                                        </span>
                                                    ))}
                                                </div>
                                                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors line-clamp-2">
                                                    {post.title}
                                                </h3>
                                                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                                                    {post.excerpt}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span>{post.author.name}</span>
                                                    <span>·</span>
                                                    <span>{post.readingTime} min read</span>
                                                </div>
                                            </Link>
                                        </article>
                                    ))}
                                </div>
                            </div>

                            {/* Sidebar */}
                            <aside className="space-y-8">
                                {/* Newsletter */}
                                <div className="rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-6">
                                    <h3 className="text-lg font-semibold text-white mb-2">Stay Updated</h3>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Get the latest posts delivered to your inbox.
                                    </p>
                                    <NewsletterSignup variant="footer" tags={['blog']} />
                                </div>

                                {/* Popular Tags */}
                                <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Tag size={18} />
                                        Popular Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.slice(0, 12).map((tag, i) => (
                                            <span 
                                                key={i}
                                                className="px-3 py-1 rounded-full bg-white/5 text-gray-400 text-sm hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Categories List */}
                                <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
                                    <div className="space-y-2">
                                        {categories.map(category => (
                                            <button
                                                key={category.id}
                                                onClick={() => setSelectedCategory(category.name)}
                                                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group"
                                            >
                                                <span className="text-gray-400 group-hover:text-white">
                                                    {category.name}
                                                </span>
                                                <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </aside>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} SceneWeaver. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
