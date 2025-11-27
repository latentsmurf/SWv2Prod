'use client';

import React from 'react';
import { Check, Loader2, X, AlertCircle } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';

export default function GenerationStatus() {
    const { notifications, removeNotification } = useNotification();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            {notifications.map(notif => (
                <div
                    key={notif.id}
                    className={`flex items-center gap-3 border px-4 py-3 rounded-lg shadow-2xl animate-in slide-in-from-right-full duration-300
                        ${notif.type === 'error' ? 'bg-red-900/90 border-red-500/50 text-white' :
                            notif.type === 'processing' ? 'bg-blue-900/90 border-blue-500/50 text-white' :
                                'bg-[#1a1a1a] border-white/10 text-white'}`}
                >
                    <div className={`p-1.5 rounded-full 
                        ${notif.type === 'error' ? 'bg-red-500/20 text-red-500' :
                            notif.type === 'processing' ? 'bg-blue-500/20 text-blue-500' :
                                'bg-green-500/20 text-green-500'}`}>
                        {notif.type === 'error' ? <AlertCircle size={16} strokeWidth={3} /> :
                            notif.type === 'processing' ? <Loader2 size={16} className="animate-spin" /> :
                                <Check size={16} strokeWidth={3} />}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{notif.message}</p>
                    </div>
                    <button
                        onClick={() => removeNotification(notif.id)}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
}
