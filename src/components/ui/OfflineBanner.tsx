'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            if (wasOffline) {
                setShowReconnected(true);
                setTimeout(() => setShowReconnected(false), 3000);
            }
            setWasOffline(false);
        };

        const handleOffline = () => {
            setIsOffline(true);
            setWasOffline(true);
        };

        // Set initial state
        setIsOffline(!navigator.onLine);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [wasOffline]);

    if (showReconnected) {
        return (
            <div className="fixed top-0 left-0 right-0 z-[9999] bg-green-500 text-white px-4 py-2 text-center text-sm font-medium animate-in slide-in-from-top duration-300">
                <span>✓ Back online! Your changes will be synced.</span>
            </div>
        );
    }

    if (!isOffline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-orange-500 text-white px-4 py-2 animate-in slide-in-from-top duration-300">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
                <WifiOff size={16} />
                <span className="text-sm font-medium">
                    You're offline. Some features may be unavailable.
                </span>
                <button 
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
                >
                    <RefreshCw size={12} />
                    Retry
                </button>
            </div>
        </div>
    );
}
