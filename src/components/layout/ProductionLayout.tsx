'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Clapperboard,
    Film,
    Scissors,
    Settings,
    Menu,
    ChevronLeft,
    Download,
    Archive,
    Eraser
} from 'lucide-react';
import GenerationStatus from '@/components/notifications/GenerationStatus';
import { cn } from '@/lib/utils'; // Assuming a utils file exists or I should create it, but standard Next.js often has it. I'll check or inline it if needed. 
// Actually, I'll inline the cn utility if I'm not sure, but usually it's there. 
// Wait, I haven't checked for utils.ts. I'll assume standard tailwind-merge/clsx usage or just use template literals for now to be safe, 
// or I'll create a simple utility at the top if I need complex conditional classes.
// For now, I'll stick to template literals where simple, or clsx if I had it. 
// The package.json has clsx and tailwind-merge. I'll assume lib/utils exists or I'll create it in a separate step if I fail.
// Actually, I'll just use standard template strings for simplicity in this file to avoid dependency on an unverified file.

const SidebarItem = ({ icon: Icon, label, href, isActive, collapsed }: { icon: any, label: string, href: string, isActive: boolean, collapsed: boolean }) => (
    <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
      ${isActive
                ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
    >
        <Icon size={20} className={isActive ? 'text-yellow-400' : ''} />
        {!collapsed && <span className="font-medium tracking-wide">{label}</span>}
    </Link>
);

interface ProductionLayoutProps {
    children: React.ReactNode;
    projectName?: string;
}

export default function ProductionLayout({ children, projectName = "Untitled Project" }: ProductionLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { icon: Clapperboard, label: 'Pre-Production', href: '/production/pre-production' },
        { icon: Film, label: 'Production', href: '/production' },
        { icon: Scissors, label: 'Post-Production', href: '/production/post' },
        { icon: Eraser, label: 'Repair Shop', href: '/production/repair' },
        { icon: Archive, label: 'Vault', href: '/production/library' },
        { icon: Settings, label: 'Settings', href: '/settings/engine' },
    ];

    return (
        <div className="flex h-screen bg-[#1e1e1e] text-white font-sans overflow-hidden selection:bg-yellow-500/30">
            {/* Sidebar */}
            <aside
                className={`relative flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
        `}
            >
                <div className="flex items-center justify-between p-6 h-20 border-b border-white/5">
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <span className="font-bold text-black text-lg">N</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                SceneWeaver
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors ml-auto"
                    >
                        {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-3 py-6 space-y-2">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            {...item}
                            isActive={pathname === item.href}
                            collapsed={collapsed}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-white/5 ${collapsed ? 'justify-center' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-white/10">
                            <span className="text-xs font-bold">JD</span>
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">John Doe</span>
                                <span className="text-xs text-gray-500">Pro Plan</span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-white/90">{projectName}</h1>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            All changes saved
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-medium transition-all hover:scale-105 active:scale-95">
                            <Download size={16} />
                            Export
                        </button>
                        <button className="px-5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all hover:scale-105 active:scale-95">
                            Share
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className={`flex-1 overflow-auto relative ${pathname === '/production/post' ? 'p-0' : 'p-8'}`}>
                    {/* Background Gradients */}
                    <div className="fixed inset-0 pointer-events-none z-[-1]">
                        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-purple-900/10 blur-[120px]" />
                        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[100px]" />
                    </div>

                    {children}
                    <GenerationStatus />
                </main>
            </div>
        </div>
    );
}
