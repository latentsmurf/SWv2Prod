'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
    User, LogOut, Settings, CreditCard, HelpCircle,
    ChevronDown, Palette, Bell, Shield, Loader2
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface UserMenuProps {
    variant?: 'full' | 'compact' | 'avatar-only';
    showCredits?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UserMenu({ variant = 'full', showCredits = true }: UserMenuProps) {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Close on escape
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);
    
    const handleLogout = async () => {
        setIsOpen(false);
        await signOut({ callbackUrl: '/' });
    };
    
    // Loading state
    if (status === 'loading') {
        return (
            <div className="flex items-center gap-2 px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
        );
    }
    
    // Not authenticated - show login button
    if (status === 'unauthenticated' || !session) {
        return (
            <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                    backgroundColor: 'var(--sw-accent)',
                    color: 'var(--sw-accent-foreground)'
                }}
            >
                Sign In
            </Link>
        );
    }
    
    const user = session.user;
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';
    
    return (
        <div ref={menuRef} className="relative">
            {/* Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg transition-colors hover:bg-white/5"
            >
                {/* Avatar */}
                <div className="relative">
                    {user?.image ? (
                        <img
                            src={user.image}
                            alt={user.name || 'User'}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                            style={{ 
                                backgroundColor: 'var(--sw-accent)',
                                color: 'var(--sw-accent-foreground)'
                            }}
                        >
                            {initials}
                        </div>
                    )}
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[var(--sw-background)]" />
                </div>
                
                {/* Name (full variant only) */}
                {variant === 'full' && (
                    <>
                        <div className="text-left hidden sm:block">
                            <div className="text-sm font-medium text-white truncate max-w-[120px]">
                                {user?.name || 'User'}
                            </div>
                            <div className="text-xs text-gray-400 truncate max-w-[120px]">
                                {user?.email}
                            </div>
                        </div>
                        <ChevronDown 
                            size={14} 
                            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </>
                )}
            </button>
            
            {/* Dropdown Menu */}
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{ 
                        backgroundColor: 'var(--sw-background-secondary)',
                        border: '1px solid var(--sw-border)'
                    }}
                >
                    {/* User Info Header */}
                    <div className="p-4 border-b" style={{ borderColor: 'var(--sw-border)' }}>
                        <div className="flex items-center gap-3">
                            {user?.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name || 'User'}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                                    style={{ 
                                        backgroundColor: 'var(--sw-accent)',
                                        color: 'var(--sw-accent-foreground)'
                                    }}
                                >
                                    {initials}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white truncate">
                                    {user?.name || 'User'}
                                </div>
                                <div className="text-xs text-gray-400 truncate">
                                    {user?.email}
                                </div>
                            </div>
                        </div>
                        
                        {/* Credits */}
                        {showCredits && (
                            <div 
                                className="mt-3 p-2 rounded-lg"
                                style={{ backgroundColor: 'var(--sw-background-tertiary)' }}
                            >
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400">Credits remaining</span>
                                    <span className="font-medium text-white">38 / 50</span>
                                </div>
                                <div 
                                    className="mt-1.5 h-1.5 rounded-full overflow-hidden"
                                    style={{ backgroundColor: 'var(--sw-background)' }}
                                >
                                    <div 
                                        className="h-full rounded-full"
                                        style={{ 
                                            width: '76%',
                                            backgroundColor: 'var(--sw-accent)'
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                        <MenuItem 
                            icon={User}
                            label="Profile"
                            href="/settings/profile"
                            onClick={() => setIsOpen(false)}
                        />
                        <MenuItem 
                            icon={CreditCard}
                            label="Subscription"
                            href="/settings/subscription"
                            onClick={() => setIsOpen(false)}
                        />
                        <MenuItem 
                            icon={Palette}
                            label="Appearance"
                            href="/settings/appearance"
                            onClick={() => setIsOpen(false)}
                        />
                        <MenuItem 
                            icon={Bell}
                            label="Notifications"
                            href="/settings/notifications"
                            onClick={() => setIsOpen(false)}
                        />
                        <MenuItem 
                            icon={Settings}
                            label="Settings"
                            href="/settings"
                            onClick={() => setIsOpen(false)}
                        />
                        
                        <div className="my-2 border-t" style={{ borderColor: 'var(--sw-border)' }} />
                        
                        <MenuItem 
                            icon={HelpCircle}
                            label="Help & Support"
                            href="/support"
                            onClick={() => setIsOpen(false)}
                        />
                        
                        <div className="my-2 border-t" style={{ borderColor: 'var(--sw-border)' }} />
                        
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut size={16} />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// MENU ITEM COMPONENT
// ============================================================================

interface MenuItemProps {
    icon: React.ElementType;
    label: string;
    href: string;
    onClick?: () => void;
}

function MenuItem({ icon: Icon, label, href, onClick }: MenuItemProps) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-white/5"
            style={{ color: 'var(--sw-foreground)' }}
        >
            <Icon size={16} className="text-gray-400" />
            {label}
        </Link>
    );
}
