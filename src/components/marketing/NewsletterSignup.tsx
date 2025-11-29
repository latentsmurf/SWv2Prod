'use client';

import React, { useState } from 'react';
import { Mail, Check, Loader2, ArrowRight, Sparkles } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface NewsletterSignupProps {
    variant?: 'default' | 'compact' | 'hero' | 'footer' | 'inline';
    title?: string;
    description?: string;
    buttonText?: string;
    source?: string;
    tags?: string[];
    className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NewsletterSignup({
    variant = 'default',
    title = 'Stay in the loop',
    description = 'Get the latest updates on new features, tips, and exclusive offers.',
    buttonText = 'Subscribe',
    source = 'website',
    tags = ['newsletter'],
    className = '',
}: NewsletterSignupProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !email.includes('@')) {
            setStatus('error');
            setErrorMessage('Please enter a valid email address');
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source, tags }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setEmail('');
            } else {
                setStatus('error');
                setErrorMessage(data.error || 'Failed to subscribe. Please try again.');
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage('Network error. Please try again.');
        }
    };

    // Render based on variant
    if (variant === 'compact') {
        return (
            <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={status === 'loading' || status === 'success'}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-500"
                />
                <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-medium text-sm transition-colors disabled:opacity-50"
                >
                    {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> :
                     status === 'success' ? <Check size={16} /> : buttonText}
                </button>
            </form>
        );
    }

    if (variant === 'inline') {
        return (
            <div className={`flex items-center gap-4 ${className}`}>
                {status === 'success' ? (
                    <div className="flex items-center gap-2 text-green-400">
                        <Check size={20} />
                        <span>Thanks for subscribing!</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex items-center gap-3">
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                disabled={status === 'loading'}
                                className="pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-500 w-64"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-medium text-sm transition-colors disabled:opacity-50"
                        >
                            {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : (
                                <>
                                    {buttonText}
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </form>
                )}
                {status === 'error' && (
                    <span className="text-red-400 text-sm">{errorMessage}</span>
                )}
            </div>
        );
    }

    if (variant === 'footer') {
        return (
            <div className={className}>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-xs text-gray-400 mb-4">{description}</p>
                {status === 'success' ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                        <Check size={16} />
                        <span>Subscribed!</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={status === 'loading'}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-500"
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-medium text-sm transition-colors disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Subscribing...' : buttonText}
                        </button>
                        {status === 'error' && (
                            <p className="text-red-400 text-xs">{errorMessage}</p>
                        )}
                    </form>
                )}
            </div>
        );
    }

    if (variant === 'hero') {
        return (
            <div className={`max-w-2xl mx-auto text-center ${className}`}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-400 text-sm mb-6">
                    <Sparkles size={16} />
                    <span>Join {Math.floor(Math.random() * 5000) + 3000}+ creators</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
                <p className="text-lg text-gray-400 mb-8">{description}</p>
                
                {status === 'success' ? (
                    <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                            <Check size={20} className="text-white" />
                        </div>
                        <div className="text-left">
                            <div className="font-medium text-white">You're on the list!</div>
                            <div className="text-sm text-gray-400">Check your inbox for a welcome email.</div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <div className="relative flex-1">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                disabled={status === 'loading'}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {status === 'loading' ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    {buttonText}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                )}
                
                {status === 'error' && (
                    <p className="mt-3 text-red-400 text-sm">{errorMessage}</p>
                )}
                
                <p className="mt-4 text-xs text-gray-500">
                    No spam, unsubscribe anytime.
                </p>
            </div>
        );
    }

    // Default variant
    return (
        <div 
            className={`rounded-2xl p-6 md:p-8 ${className}`}
            style={{ 
                backgroundColor: 'var(--sw-background-secondary)', 
                border: '1px solid var(--sw-border)' 
            }}
        >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                            <Mail size={20} className="text-black" />
                        </div>
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--sw-foreground)' }}>
                            {title}
                        </h3>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--sw-foreground-muted)' }}>
                        {description}
                    </p>
                </div>
                
                <div className="md:w-96">
                    {status === 'success' ? (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <Check size={20} className="text-green-400" />
                            <span className="text-green-400">Thanks for subscribing!</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                disabled={status === 'loading'}
                                className="flex-1 px-4 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                                style={{
                                    backgroundColor: 'var(--sw-background)',
                                    border: '1px solid var(--sw-border)',
                                    color: 'var(--sw-foreground)'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="px-5 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                                style={{ 
                                    backgroundColor: 'var(--sw-accent)', 
                                    color: 'var(--sw-accent-foreground)' 
                                }}
                            >
                                {status === 'loading' ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <>
                                        {buttonText}
                                        <ArrowRight size={14} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                    {status === 'error' && (
                        <p className="mt-2 text-red-400 text-sm">{errorMessage}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
