'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Clapperboard, Film, Scissors, Settings, Menu, ChevronLeft, ChevronRight,
    Download, Archive, Eraser, Video, Type, Music, Subtitles, ImageIcon,
    Sticker, FolderOpen, Layout, Home, Search, Bell, HelpCircle,
    Keyboard, Command, FileText, Users, MapPin, Package, Camera,
    Layers, Grid3X3, Zap, Sparkles, Plus
} from 'lucide-react';
import GenerationStatus from '@/components/notifications/GenerationStatus';

// Context for editor panel selection
type EditorPanelType = 'video' | 'text' | 'audio' | 'caption' | 'image' | 'sticker' | 'uploads' | 'templates' | 'settings' | null;

interface EditorPanelContextType {
    activePanel: EditorPanelType;
    setActivePanel: (panel: EditorPanelType) => void;
}

const EditorPanelContext = createContext<EditorPanelContextType | null>(null);

export const useEditorPanel = () => {
    const context = useContext(EditorPanelContext);
    return context;
};

// Sidebar Section Component
const SidebarSection = ({ title, collapsed, children }: { title: string; collapsed: boolean; children: React.ReactNode }) => (
    <div className="mb-4">
        {!collapsed && (
            <div className="px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                {title}
            </div>
        )}
        <div className="space-y-0.5 px-2">
            {children}
        </div>
    </div>
);

const SidebarItem = ({ 
    icon: Icon, 
    label, 
    href, 
    isActive, 
    collapsed,
    badge
}: { 
    icon: any; 
    label: string; 
    href: string; 
    isActive: boolean; 
    collapsed: boolean;
    badge?: string | number;
}) => (
    <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative
            ${isActive
                ? 'bg-yellow-500/10 text-yellow-400 border-l-2 border-yellow-500'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
            }`}
    >
        <Icon size={18} className={isActive ? 'text-yellow-400' : 'text-gray-500 group-hover:text-gray-300'} />
        {!collapsed && (
            <>
                <span className="text-sm font-medium flex-1">{label}</span>
                {badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-gray-500'
                    }`}>
                        {badge}
                    </span>
                )}
            </>
        )}
        
        {/* Tooltip for collapsed mode */}
        {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a1a] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10">
                {label}
            </div>
        )}
    </Link>
);

const EditorToolButton = ({ icon: Icon, label, isActive, collapsed, onClick }: { 
    icon: any; 
    label: string; 
    isActive: boolean; 
    collapsed: boolean;
    onClick: () => void 
}) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full text-left group relative
            ${isActive
                ? 'bg-yellow-500/10 text-yellow-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
    >
        <Icon size={18} className={isActive ? 'text-yellow-400' : 'text-gray-500 group-hover:text-gray-300'} />
        {!collapsed && <span className="text-sm font-medium">{label}</span>}
        
        {/* Tooltip for collapsed mode */}
        {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a1a] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10">
                {label}
            </div>
        )}
    </button>
);

interface ProductionLayoutProps {
    children: React.ReactNode;
    projectName?: string;
}

export default function ProductionLayout({ children, projectName = "Untitled Project" }: ProductionLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [activeEditorPanel, setActiveEditorPanel] = useState<EditorPanelType>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
    const pathname = usePathname();
    const isPostProduction = pathname === '/production/post';

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + K for search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowSearch(true);
            }
            // Cmd/Ctrl + / for keyboard shortcuts
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                setShowKeyboardShortcuts(true);
            }
            // Escape to close modals
            if (e.key === 'Escape') {
                setShowSearch(false);
                setShowKeyboardShortcuts(false);
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Navigation structure - organized by workflow phase
    const mainNavItems = [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
    ];

    const productionPhases = [
        { icon: Clapperboard, label: 'Pre-Production', href: '/production/pre-production' },
        { icon: Film, label: 'Production', href: '/production' },
        { icon: Scissors, label: 'Post-Production', href: '/production/post' },
    ];

    const toolsItems = [
        { icon: Eraser, label: 'Repair Studio', href: '/production/repair' },
        { icon: Archive, label: 'Asset Vault', href: '/production/library' },
    ];

    const systemItems = [
        { icon: Settings, label: 'Settings', href: '/settings/engine' },
    ];

    const editorTools = [
        { icon: Video, label: 'Video', panel: 'video' as EditorPanelType },
        { icon: Type, label: 'Text', panel: 'text' as EditorPanelType },
        { icon: Music, label: 'Audio', panel: 'audio' as EditorPanelType },
        { icon: Subtitles, label: 'Captions', panel: 'caption' as EditorPanelType },
        { icon: ImageIcon, label: 'Images', panel: 'image' as EditorPanelType },
        { icon: Sticker, label: 'Stickers', panel: 'sticker' as EditorPanelType },
        { icon: FolderOpen, label: 'Uploads', panel: 'uploads' as EditorPanelType },
        { icon: Layout, label: 'Templates', panel: 'templates' as EditorPanelType },
    ];

    const handleEditorToolClick = (panel: EditorPanelType) => {
        setActiveEditorPanel(activeEditorPanel === panel ? null : panel);
    };

    // Check if path is active
    const isActive = (href: string) => {
        if (href === '/production') return pathname === '/production';
        return pathname.startsWith(href);
    };

    return (
        <EditorPanelContext.Provider value={{ activePanel: activeEditorPanel, setActivePanel: setActiveEditorPanel }}>
            <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-yellow-500/30">
                {/* Sidebar */}
                <aside
                    className={`relative flex flex-col border-r border-white/5 bg-[#0a0a0a] transition-all duration-300 ease-in-out
                        ${collapsed ? 'w-16' : 'w-56'}
                    `}
                >
                    {/* Logo */}
                    <div className="flex items-center justify-between px-3 h-14 border-b border-white/5">
                        {!collapsed && (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                    <span className="font-bold text-black text-sm">S</span>
                                </div>
                                <span className="font-bold text-sm tracking-tight text-white">
                                    SceneWeaver
                                </span>
                            </div>
                        )}
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                        >
                            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-3 overflow-y-auto">
                        {/* Main */}
                        <SidebarSection title="Main" collapsed={collapsed}>
                            {mainNavItems.map((item) => (
                                <SidebarItem
                                    key={item.href}
                                    {...item}
                                    isActive={isActive(item.href)}
                                    collapsed={collapsed}
                                />
                            ))}
                        </SidebarSection>

                        {/* Production Phases */}
                        <SidebarSection title="Production" collapsed={collapsed}>
                            {productionPhases.map((item) => (
                                <SidebarItem
                                    key={item.href}
                                    {...item}
                                    isActive={isActive(item.href)}
                                    collapsed={collapsed}
                                />
                            ))}
                        </SidebarSection>

                        {/* Tools */}
                        <SidebarSection title="Tools" collapsed={collapsed}>
                            {toolsItems.map((item) => (
                                <SidebarItem
                                    key={item.href}
                                    {...item}
                                    isActive={isActive(item.href)}
                                    collapsed={collapsed}
                                />
                            ))}
                        </SidebarSection>

                        {/* Editor Tools - Only show on Post-Production page */}
                        {isPostProduction && (
                            <SidebarSection title="Editor" collapsed={collapsed}>
                                {editorTools.map((tool) => (
                                    <EditorToolButton
                                        key={tool.panel}
                                        icon={tool.icon}
                                        label={tool.label}
                                        isActive={activeEditorPanel === tool.panel}
                                        collapsed={collapsed}
                                        onClick={() => handleEditorToolClick(tool.panel)}
                                    />
                                ))}
                            </SidebarSection>
                        )}

                        {/* System */}
                        <SidebarSection title="System" collapsed={collapsed}>
                            {systemItems.map((item) => (
                                <SidebarItem
                                    key={item.href}
                                    {...item}
                                    isActive={isActive(item.href)}
                                    collapsed={collapsed}
                                />
                            ))}
                        </SidebarSection>
                    </nav>

                    {/* Bottom Actions */}
                    <div className="p-2 border-t border-white/5">
                        {/* Keyboard Shortcuts Hint */}
                        {!collapsed && (
                            <button
                                onClick={() => setShowKeyboardShortcuts(true)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors text-xs"
                            >
                                <Keyboard size={14} />
                                <span>Shortcuts</span>
                                <kbd className="ml-auto px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">⌘/</kbd>
                            </button>
                        )}
                        
                        {/* User */}
                        <div className={`flex items-center gap-2 p-2 mt-1 rounded-lg bg-white/5 ${collapsed ? 'justify-center' : ''}`}>
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white">JD</span>
                            </div>
                            {!collapsed && (
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-medium text-white truncate">John Doe</span>
                                    <span className="text-[10px] text-gray-500">Pro Plan</span>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#050505]">
                    {/* Header */}
                    <header className="h-12 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-4 sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <h1 className="text-sm font-medium tracking-tight text-white/90">{projectName}</h1>
                            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Saved
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <button 
                                onClick={() => setShowSearch(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs transition-colors"
                            >
                                <Search size={14} />
                                <span className="hidden sm:inline">Search</span>
                                <kbd className="hidden sm:inline px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">⌘K</kbd>
                            </button>
                            
                            {/* Notifications */}
                            <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors relative">
                                <Bell size={16} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
                            </button>
                            
                            {/* Help */}
                            <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                                <HelpCircle size={16} />
                            </button>

                            <div className="w-px h-6 bg-white/10 mx-1" />

                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium transition-all text-white">
                                <Download size={14} />
                                Export
                            </button>
                            <button className="px-4 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs transition-all">
                                Share
                            </button>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className={`flex-1 overflow-hidden relative ${isPostProduction ? '' : 'p-6 overflow-auto'}`}>
                        {/* Background Gradients - only for non-editor pages */}
                        {!isPostProduction && (
                            <div className="fixed inset-0 pointer-events-none z-[-1]">
                                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-yellow-900/5 blur-[120px]" />
                                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/5 blur-[100px]" />
                            </div>
                        )}

                        {children}
                        {!isPostProduction && <GenerationStatus />}
                    </main>
                </div>

                {/* Command Palette / Search Modal */}
                {showSearch && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center pt-[15vh]" onClick={() => setShowSearch(false)}>
                        <div 
                            className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                                <Search size={18} className="text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search anything..."
                                    className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-gray-500"
                                    autoFocus
                                />
                                <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] text-gray-500 font-mono">ESC</kbd>
                            </div>
                            <div className="p-2 max-h-80 overflow-y-auto">
                                <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase">Quick Actions</div>
                                {[
                                    { icon: Plus, label: 'New Scene', shortcut: '⌘N' },
                                    { icon: FileText, label: 'Import Script', shortcut: '⌘I' },
                                    { icon: Camera, label: 'Generate Shot', shortcut: '⌘G' },
                                    { icon: Download, label: 'Export Project', shortcut: '⌘E' },
                                ].map((item, i) => (
                                    <button
                                        key={i}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white text-sm transition-colors"
                                    >
                                        <item.icon size={16} className="text-gray-500" />
                                        <span className="flex-1 text-left">{item.label}</span>
                                        <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono text-gray-500">{item.shortcut}</kbd>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Keyboard Shortcuts Modal */}
                {showKeyboardShortcuts && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setShowKeyboardShortcuts(false)}>
                        <div 
                            className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Keyboard size={20} className="text-yellow-400" />
                                    Keyboard Shortcuts
                                </h2>
                                <button 
                                    onClick={() => setShowKeyboardShortcuts(false)}
                                    className="text-gray-500 hover:text-white"
                                >
                                    <span className="text-xs">ESC</span>
                                </button>
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-8">
                                {[
                                    {
                                        title: 'General',
                                        shortcuts: [
                                            { keys: '⌘ K', label: 'Open search' },
                                            { keys: '⌘ /', label: 'Keyboard shortcuts' },
                                            { keys: '⌘ S', label: 'Save project' },
                                            { keys: '⌘ Z', label: 'Undo' },
                                            { keys: '⌘ ⇧ Z', label: 'Redo' },
                                        ]
                                    },
                                    {
                                        title: 'Navigation',
                                        shortcuts: [
                                            { keys: '⌘ 1', label: 'Pre-Production' },
                                            { keys: '⌘ 2', label: 'Production' },
                                            { keys: '⌘ 3', label: 'Post-Production' },
                                            { keys: '⌘ ,', label: 'Settings' },
                                        ]
                                    },
                                    {
                                        title: 'Editor',
                                        shortcuts: [
                                            { keys: 'Space', label: 'Play/Pause' },
                                            { keys: '← →', label: 'Frame step' },
                                            { keys: 'J K L', label: 'Playback control' },
                                            { keys: '⌘ ⇧ E', label: 'Export' },
                                        ]
                                    },
                                    {
                                        title: 'Tools',
                                        shortcuts: [
                                            { keys: 'V', label: 'Select tool' },
                                            { keys: 'B', label: 'Brush tool' },
                                            { keys: 'E', label: 'Eraser tool' },
                                            { keys: 'T', label: 'Text tool' },
                                        ]
                                    },
                                ].map((section) => (
                                    <div key={section.title}>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{section.title}</h3>
                                        <div className="space-y-2">
                                            {section.shortcuts.map((shortcut, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-300">{shortcut.label}</span>
                                                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono text-gray-400">{shortcut.keys}</kbd>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </EditorPanelContext.Provider>
    );
}
