'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Session } from 'next-auth';

// ============================================================================
// TYPES
// ============================================================================

interface AuthContextType {
    // Session state
    session: Session | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
    isLoading: boolean;
    isAuthenticated: boolean;
    
    // User info shortcuts
    user: Session['user'] | null;
    userName: string | null;
    userEmail: string | null;
    userImage: string | null;
    
    // Auth actions
    login: (callbackUrl?: string) => Promise<void>;
    logout: (callbackUrl?: string) => Promise<void>;
    
    // ID token for backend auth
    idToken: string | null;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    
    const isLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated';
    
    const user = session?.user ?? null;
    const userName = user?.name ?? null;
    const userEmail = user?.email ?? null;
    const userImage = user?.image ?? null;
    const idToken = (session as any)?.id_token ?? null;
    
    const login = async (callbackUrl?: string) => {
        await signIn('google', { callbackUrl: callbackUrl || '/production' });
    };
    
    const logout = async (callbackUrl?: string) => {
        await signOut({ callbackUrl: callbackUrl || '/' });
    };
    
    return (
        <AuthContext.Provider value={{
            session,
            status,
            isLoading,
            isAuthenticated,
            user,
            userName,
            userEmail,
            userImage,
            login,
            logout,
            idToken,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// ============================================================================
// REQUIRE AUTH WRAPPER
// ============================================================================

interface RequireAuthProps {
    children: ReactNode;
    fallback?: ReactNode;
    redirectTo?: string;
}

export function RequireAuth({ children, fallback, redirectTo = '/login' }: RequireAuthProps) {
    const { isAuthenticated, isLoading, login } = useAuth();
    
    if (isLoading) {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--sw-background)' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--sw-accent)', borderTopColor: 'transparent' }} />
                    <p className="text-sm" style={{ color: 'var(--sw-foreground-muted)' }}>Loading...</p>
                </div>
            </div>
        );
    }
    
    if (!isAuthenticated) {
        // Auto redirect to login
        if (typeof window !== 'undefined') {
            login(window.location.pathname);
        }
        return fallback || (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--sw-background)' }}>
                <div className="flex flex-col items-center gap-4">
                    <p className="text-sm" style={{ color: 'var(--sw-foreground-muted)' }}>Redirecting to login...</p>
                </div>
            </div>
        );
    }
    
    return <>{children}</>;
}
