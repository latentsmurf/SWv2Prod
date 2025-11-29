'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    ArrowLeft, Calendar, Clock, User, Share2, Twitter, 
    Facebook, Linkedin, Link2, Check, Tag, ChevronRight 
} from 'lucide-react';
import { BlogPost } from '@/lib/blog';
import NewsletterSignup from '@/components/marketing/NewsletterSignup';

export default function BlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    
    const [post, setPost] = useState<BlogPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchPost();
    }, [slug]);

    const fetchPost = async () => {
        try {
            const res = await fetch(`/api/blog/posts/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setPost(data.post);
                
                // Fetch related posts
                if (data.post?.categories?.[0]) {
                    const relatedRes = await fetch(`/api/blog/posts?category=${encodeURIComponent(data.post.categories[0])}&limit=3`);
                    if (relatedRes.ok) {
                        const relatedData = await relatedRes.json();
                        setRelatedPosts(relatedData.posts.filter((p: BlogPost) => p.id !== data.post.id).slice(0, 2));
                    }
                }
            } else {
                router.push('/blog');
            }
        } catch (error) {
            console.error('Failed to fetch post:', error);
        }
        setLoading(false);
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Post not found</h1>
                    <Link href="/blog" className="text-yellow-400 hover:underline">
                        ← Back to blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            {/* Header */}
            <header className="border-b border-white/10 sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/blog" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                            <span>Back to blog</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`, '_blank')}
                                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                                title="Share on Twitter"
                            >
                                <Twitter size={18} />
                            </button>
                            <button
                                onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`, '_blank')}
                                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                                title="Share on LinkedIn"
                            >
                                <Linkedin size={18} />
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                                title="Copy link"
                            >
                                {copied ? <Check size={18} className="text-green-400" /> : <Link2 size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <div className="relative">
                {post.coverImage ? (
                    <div className="relative h-[40vh] md:h-[50vh]">
                        <img 
                            src={post.coverImage} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />
                    </div>
                ) : (
                    <div className="h-32 bg-gradient-to-br from-yellow-500/20 to-purple-500/20" />
                )}
            </div>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
                {/* Post Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        {post.categories.map((cat, i) => (
                            <Link 
                                key={i}
                                href={`/blog?category=${encodeURIComponent(cat)}`}
                                className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium hover:bg-yellow-500/30 transition-colors"
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            {post.author.avatar ? (
                                <img src={post.author.avatar} alt="" className="w-10 h-10 rounded-full" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                    <User size={18} className="text-yellow-400" />
                                </div>
                            )}
                            <div>
                                <div className="text-white font-medium">{post.author.name}</div>
                                <div className="text-sm text-gray-500">{post.author.email}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                {post.publishedAt && new Date(post.publishedAt).toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                })}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock size={14} />
                                {post.readingTime} min read
                            </div>
                        </div>
                    </div>
                </div>

                {/* Article Content */}
                <article 
                    className="prose prose-invert prose-lg max-w-none
                        prose-headings:text-white prose-headings:font-bold
                        prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                        prose-p:text-gray-300 prose-p:leading-relaxed
                        prose-a:text-yellow-400 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-white
                        prose-ul:text-gray-300 prose-ol:text-gray-300
                        prose-li:marker:text-yellow-500
                        prose-blockquote:border-yellow-500 prose-blockquote:bg-white/5 
                        prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl
                        prose-blockquote:not-italic prose-blockquote:text-gray-300
                        prose-code:text-yellow-400 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                        prose-pre:bg-[#12121a] prose-pre:border prose-pre:border-white/10"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                {post.tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag size={16} className="text-gray-500" />
                            {post.tags.map((tag, i) => (
                                <Link
                                    key={i}
                                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                                    className="px-3 py-1 rounded-full bg-white/5 text-gray-400 text-sm hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Author Bio */}
                <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-start gap-4">
                        {post.author.avatar ? (
                            <img src={post.author.avatar} alt="" className="w-16 h-16 rounded-full" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <User size={24} className="text-yellow-400" />
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                                Written by {post.author.name}
                            </h3>
                            <p className="text-gray-400 text-sm mb-3">
                                Creating the future of AI-powered filmmaking at SceneWeaver.
                            </p>
                            <Link 
                                href={`/blog?author=${encodeURIComponent(post.author.name)}`}
                                className="text-yellow-400 text-sm hover:underline"
                            >
                                View all posts →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Newsletter CTA */}
                <div className="mt-12">
                    <NewsletterSignup 
                        variant="default"
                        title="Enjoyed this article?"
                        description="Subscribe to get more insights on AI filmmaking delivered to your inbox."
                        tags={['blog', 'subscriber']}
                    />
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {relatedPosts.map(relatedPost => (
                                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group">
                                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4">
                                        {relatedPost.coverImage ? (
                                            <img 
                                                src={relatedPost.coverImage} 
                                                alt={relatedPost.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors line-clamp-2">
                                        {relatedPost.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                                        {relatedPost.excerpt}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <Link href="/blog" className="text-yellow-400 hover:underline">
                        ← Back to all posts
                    </Link>
                    <p className="text-gray-500 text-sm mt-4">
                        © {new Date().getFullYear()} SceneWeaver. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
