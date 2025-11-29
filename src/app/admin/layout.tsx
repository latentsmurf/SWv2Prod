'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Users, FolderOpen, Library, Bot, CreditCard,
    Activity, Settings, ShieldAlert, Flag, FileText, Coins, TestTube,
    Database, Bell, Globe, Palette, BarChart3, Shield, Clock,
    ChevronDown, Search, Menu, X, LogOut, Home, Mail
} from "lucide-react";
import { useState } from "react";

// Navigation structure with sections
const navSections = [
    {
        title: "Overview",
        items: [
            { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
            { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
            { icon: Bell, label: "Notifications", href: "/admin/notifications" },
        ]
    },
    {
        title: "Users & Access",
        items: [
            { icon: Users, label: "User Management", href: "/admin/users" },
            { icon: Shield, label: "Roles & Permissions", href: "/admin/roles" },
            { icon: CreditCard, label: "Memberships", href: "/admin/memberships" },
            { icon: Coins, label: "Credits & Billing", href: "/admin/credits" },
        ]
    },
    {
        title: "Content",
        items: [
            { icon: FolderOpen, label: "Projects", href: "/admin/projects" },
            { icon: Library, label: "Asset Libraries", href: "/admin/libraries" },
            { icon: Palette, label: "Style Presets", href: "/admin/presets" },
            { icon: FileText, label: "Templates", href: "/admin/templates" },
            { icon: Globe, label: "Marketing Pages", href: "/admin/marketing" },
        ]
    },
    {
        title: "Marketing",
        items: [
            { icon: Mail, label: "Email & Newsletters", href: "/admin/email" },
            { icon: FileText, label: "Blog", href: "/admin/blog" },
        ]
    },
    {
        title: "System",
        items: [
            { icon: Bot, label: "AI Services", href: "/admin/ai" },
            { icon: Activity, label: "System Health", href: "/admin/health" },
            { icon: TestTube, label: "API Tester", href: "/admin/api-tester" },
            { icon: Database, label: "Database", href: "/admin/database" },
            { icon: Clock, label: "Job Queue", href: "/admin/jobs" },
        ]
    },
    {
        title: "Administration",
        items: [
            { icon: ShieldAlert, label: "Moderation", href: "/admin/moderation" },
            { icon: FileText, label: "Audit Logs", href: "/admin/logs" },
            { icon: Flag, label: "Feature Flags", href: "/admin/flags" },
            { icon: Globe, label: "Global Settings", href: "/admin/settings" },
        ]
    },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock user - in production this would come from auth
    const user = { email: 'admin@sceneweaver.ai', role: 'super_admin' };

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    return (
        <div className="flex h-screen w-full bg-[#050505] text-white">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} border-r border-white/10 bg-[#0a0a0a] flex flex-col transition-all duration-300`}>
                {/* Logo */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    {sidebarOpen ? (
                        <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-black font-black text-sm">SW</span>
                            <span>Admin</span>
                        </h1>
                    ) : (
                        <span className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-black font-black text-sm mx-auto">SW</span>
                    )}
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white"
                    >
                        {sidebarOpen ? <ChevronDown className="rotate-90" size={16} /> : <Menu size={16} />}
                    </button>
                </div>

                {/* Search */}
                {sidebarOpen && (
                    <div className="p-3 border-b border-white/5">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                            />
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-2 px-2">
                    {navSections.map((section) => (
                        <div key={section.title} className="mb-4">
                            {sidebarOpen && (
                                <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                    {section.title}
                                </div>
                            )}
                            <div className="space-y-0.5">
                                {section.items.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group ${
                                                active
                                                    ? 'bg-yellow-500/10 text-yellow-400'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            <item.icon size={18} className={active ? 'text-yellow-400' : ''} />
                                            {sidebarOpen && <span>{item.label}</span>}
                                            {!sidebarOpen && (
                                                <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a1a] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10">
                                                    {item.label}
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User & Actions */}
                <div className="p-3 border-t border-white/10 space-y-2">
                    <Link 
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5"
                    >
                        <Home size={16} />
                        {sidebarOpen && <span>Back to App</span>}
                    </Link>
                    {sidebarOpen && (
                        <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs font-bold text-yellow-400">
                                {user.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white truncate">{user.email}</p>
                                <p className="text-[10px] text-yellow-400 capitalize">{user.role.replace('_', ' ')}</p>
                            </div>
                            <button className="p-1 text-gray-500 hover:text-white">
                                <LogOut size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col bg-[#050505]">
                {/* Top Bar */}
                <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a]">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-medium text-white">
                            {navSections.flatMap(s => s.items).find(i => isActive(i.href))?.label || 'Admin'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-gray-400">All systems operational</span>
                        </div>
                        <div className="w-px h-4 bg-white/10"></div>
                        <span className="text-xs text-gray-500">
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
