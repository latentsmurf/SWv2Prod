'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
    id: string;
    message: string;
    type: 'success' | 'processing' | 'error';
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (message: string, type: 'success' | 'processing' | 'error') => void;
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (message: string, type: 'success' | 'processing' | 'error') => {
        const id = Math.random().toString(36).substring(7);
        const notif = { id, message, type };

        setNotifications(prev => [...prev, notif]);

        // Auto dismiss
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
