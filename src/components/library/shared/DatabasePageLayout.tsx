'use client';

import React, { useState, useMemo, ReactNode } from 'react';
import { Search, Filter, Plus, Grid, List, X, ChevronDown } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface FilterConfig {
    id: string;
    label: string;
    options: { value: string; label: string; color?: string }[];
}

export interface StatusConfig {
    [key: string]: { label: string; color: string };
}

export interface DatabasePageLayoutProps<T> {
    // Data
    items: T[];
    loading?: boolean;
    
    // Header
    title: string;
    icon: ReactNode;
    iconBgColor?: string;
    description?: string;
    
    // Search
    searchPlaceholder?: string;
    searchFields: (keyof T)[];
    
    // Filters
    filters?: FilterConfig[];
    
    // View options
    defaultView?: 'grid' | 'list';
    allowViewToggle?: boolean;
    
    // Actions
    onAdd?: () => void;
    addLabel?: string;
    
    // Rendering
    renderCard: (item: T, index: number) => ReactNode;
    renderListItem?: (item: T, index: number) => ReactNode;
    renderEmptyState?: () => ReactNode;
    
    // Stats (optional sidebar)
    stats?: { label: string; value: string | number; color?: string }[];
    
    // Custom actions
    headerActions?: ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DatabasePageLayout<T extends { id: string }>({
    items,
    loading = false,
    title,
    icon,
    iconBgColor = 'bg-gradient-to-br from-purple-500 to-blue-500',
    description,
    searchPlaceholder = 'Search...',
    searchFields,
    filters = [],
    defaultView = 'grid',
    allowViewToggle = true,
    onAdd,
    addLabel = 'Add New',
    renderCard,
    renderListItem,
    renderEmptyState,
    stats,
    headerActions,
}: DatabasePageLayoutProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

    // Filter and search items
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matches = searchFields.some(field => {
                    const value = item[field];
                    return typeof value === 'string' && value.toLowerCase().includes(query);
                });
                if (!matches) return false;
            }

            // Apply custom filters
            for (const [filterId, filterValue] of Object.entries(activeFilters)) {
                if (filterValue && filterValue !== 'all') {
                    const itemValue = (item as any)[filterId];
                    if (itemValue !== filterValue) return false;
                }
            }

            return true;
        });
    }, [items, searchQuery, searchFields, activeFilters]);

    const handleFilterChange = (filterId: string, value: string) => {
        setActiveFilters(prev => ({ ...prev, [filterId]: value }));
    };

    const clearFilters = () => {
        setActiveFilters({});
        setSearchQuery('');
    };

    const hasActiveFilters = searchQuery || Object.values(activeFilters).some(v => v && v !== 'all');

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] -m-6">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${iconBgColor} flex items-center justify-center text-white`}>
                            {icon}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">{title}</h1>
                            {description && (
                                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {headerActions}
                        {onAdd && (
                            <button
                                onClick={onAdd}
                                className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-medium text-sm transition-colors"
                            >
                                <Plus size={18} />
                                {addLabel}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between gap-4 bg-white/[0.02]">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full pl-10 pr-8 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Filters */}
                    {filters.map(filter => (
                        <div key={filter.id} className="relative">
                            <select
                                value={activeFilters[filter.id] || 'all'}
                                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                                className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 cursor-pointer"
                            >
                                <option value="all">{filter.label}</option>
                                {filter.options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                    ))}

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-3 py-2 text-xs text-gray-400 hover:text-white"
                        >
                            Clear filters
                        </button>
                    )}

                    {/* View toggle */}
                    {allowViewToggle && renderListItem && (
                        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Grid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                <List size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Stats Sidebar (optional) */}
                {stats && stats.length > 0 && (
                    <div className="w-56 border-r border-white/5 p-4 overflow-y-auto">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Quick Stats
                        </div>
                        <div className="space-y-3">
                            {stats.map((stat, i) => (
                                <div key={i} className="p-3 rounded-lg bg-white/5">
                                    <div className={`text-xl font-bold ${stat.color || 'text-white'}`}>
                                        {stat.value}
                                    </div>
                                    <div className="text-xs text-gray-500">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Results count */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500">
                            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                            {searchQuery && ` matching "${searchQuery}"`}
                        </span>
                    </div>

                    {/* Loading */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredItems.length === 0 ? (
                        /* Empty state */
                        renderEmptyState ? renderEmptyState() : (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <Search size={24} className="text-gray-600" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">No items found</h3>
                                <p className="text-sm text-gray-500 text-center max-w-md">
                                    {searchQuery 
                                        ? 'Try adjusting your search or filters.'
                                        : 'Get started by adding your first item.'}
                                </p>
                                {onAdd && (
                                    <button
                                        onClick={onAdd}
                                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-medium"
                                    >
                                        <Plus size={16} />
                                        {addLabel}
                                    </button>
                                )}
                            </div>
                        )
                    ) : viewMode === 'grid' ? (
                        /* Grid view */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredItems.map((item, index) => renderCard(item, index))}
                        </div>
                    ) : (
                        /* List view */
                        <div className="space-y-2">
                            {filteredItems.map((item, index) => 
                                renderListItem ? renderListItem(item, index) : renderCard(item, index)
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
