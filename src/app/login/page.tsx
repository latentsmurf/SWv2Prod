'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Film, Sparkles, Zap, Shield, ArrowRight, Loader2 } from 'lucide-react';

// ============================================================================
// GOOGLE ICON
// ============================================================================

function GoogleIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
    );
}

// ============================================================================
// FEATURE CARDS
// ============================================================================

const features = [
    {
        icon: Film,
        title: 'AI Film Production',
        description: 'Generate stunning visuals from your scripts'
    },
    {
        icon: Sparkles,
        title: 'Smart Storyboarding',
        description: 'Turn ideas into visual sequences instantly'
    },
    {
        icon: Zap,
        title: 'Rapid Iteration',
        description: 'Refine and perfect your vision in real-time'
    },
    {
        icon: Shield,
        title: 'Secure & Private',
        description: 'Your projects are always protected'
    }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const callbackUrl = searchParams.get('callbackUrl') || '/production';
    
    // Redirect if already authenticated
    useEffect(() => {
        if (status === 'authenticated') {
            router.push(callbackUrl);
        }
    }, [status, router, callbackUrl]);
    
    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            setError(null);
            await signIn('google', { callbackUrl });
        } catch (err) {
            setError('Failed to sign in. Please try again.');
            setIsLoading(false);
        }
    };
    
    // Show loading while checking session
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                    <p className="text-gray-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex bg-[#0a0a0f]">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-orange-500/10 to-purple-500/20" />
                
                {/* Grid pattern */}
                <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                                         linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                            <Film className="w-6 h-6 text-black" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">
                            SceneWeaver
                        </span>
                    </div>
                    
                    {/* Tagline */}
                    <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
                        Turn your vision into
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                            cinematic reality
                        </span>
                    </h1>
                    
                    <p className="text-lg text-gray-400 mb-12 max-w-md">
                        The AI-powered production studio that transforms scripts into stunning visual sequences.
                    </p>
                    
                    {/* Feature cards */}
                    <div className="grid grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                            >
                                <feature.icon className="w-5 h-5 text-yellow-500 mb-2" />
                                <h3 className="text-sm font-medium text-white mb-1">
                                    {feature.title}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                            <Film className="w-5 h-5 text-black" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">
                            SceneWeaver
                        </span>
                    </div>
                    
                    {/* Card */}
                    <div className="bg-[#12121a] rounded-2xl border border-white/10 p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Welcome back
                            </h2>
                            <p className="text-gray-400">
                                Sign in to continue to your studio
                            </p>
                        </div>
                        
                        {/* Error message */}
                        {error && (
                            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}
                        
                        {/* Google Sign In Button */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <GoogleIcon size={20} />
                            )}
                            {isLoading ? 'Signing in...' : 'Continue with Google'}
                        </button>
                        
                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 bg-[#12121a] text-gray-500">
                                    Secure authentication
                                </span>
                            </div>
                        </div>
                        
                        {/* Info */}
                        <p className="text-center text-xs text-gray-500">
                            By signing in, you agree to our{' '}
                            <a href="/terms" className="text-yellow-500 hover:underline">Terms of Service</a>
                            {' '}and{' '}
                            <a href="/privacy" className="text-yellow-500 hover:underline">Privacy Policy</a>
                        </p>
                    </div>
                    
                    {/* Help link */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Need help?{' '}
                        <a href="/support" className="text-yellow-500 hover:underline">
                            Contact support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
