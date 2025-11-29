'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Grid, List, Plus, MoreVertical, ChevronDown } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface DataGridColumn<T> {
    id: string;
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    sortable?: boolean;
    width?: string;
    className?: string;
}

export interface DataGridProps<T extends { id: string }> {
    data: T[];
    columns: DataGridColumn<T>[];
    searchPlaceholder?: string;
    searchFields?: (keyof T)[];
    emptyMessage?: string;
    emptyIcon?: React.ReactNode;
    onAdd?: () => void;
    addLabel?: string;
    renderCard?: (item: T, index: number) => React.ReactNode;
    renderActions?: (item: T) => React.ReactNode;
    filters?: {
        id: string;
        label: string;
        options: { value: string; label: string }[];
    }[];
    defaultView?: 'grid' | 'list';
    allowViewToggle?: boolean;
    itemsPerPage?: number;
    className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DataGrid<T extends { id: string }>({
    data,
    columns,
    searchPlaceholder = 'Search...',
    searchFields,
    emptyMessage = 'No items found',
    emptyIcon,
    onAdd,
    addLabel = 'Add New',
    renderCard,
    renderActions,
    filters = [],
    defaultView = 'grid',
    allowViewToggle = true,
    itemsPerPage = 20,
    className = '',
}: DataGridProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const [page, setPage] = useState(1);

    // Filter and search data
    const filteredData = useMemo(() => {
        let result = [...data];

        // Apply search
        if (searchQuery && searchFields) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item => 
                searchFields.some(field => {
                    const value = item[field];
                    return typeof value === 'string' && value.toLowerCase().includes(query);
                })
            );
        }

        // Apply filters
        Object.entries(activeFilters).forEach(([filterId, filterValue]) => {
            if (filterValue && filterValue !== 'all') {
                result = result.filter(item => {
                    const value = (item as any)[filterId];
                    return value === filterValue;
                });
            }
        });

        // Apply sorting
        if (sortColumn) {
            const column = columns.find(c => c.id === sortColumn);
            if (column) {
                result.sort((a, b) => {
                    const accessor = column.accessor;
                    const aVal = typeof accessor === 'function' ? '' : String(a[accessor] || '');
                    const bVal = typeof accessor === 'function' ? '' : String(b[accessor] || '');
                    const comparison = aVal.localeCompare(bVal);
                    return sortDirection === 'asc' ? comparison : -comparison;
                });
            }
        }

        return result;
    }, [data, searchQuery, searchFields, activeFilters, sortColumn, sortDirection, columns]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handleSort = (columnId: string) => {
        if (sortColumn === columnId) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnId);
            setSortDirection('asc');
        }
    };

    const getCellValue = (item: T, column: DataGridColumn<T>) => {
        if (typeof column.accessor === 'function') {
            return column.accessor(item);
        }
        return item[column.accessor] as React.ReactNode;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        placeholder={searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-500/50"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {/* Filters */}
                    {filters.map(filter => (
                        <div key={filter.id} className="relative">
                            <select
                                value={activeFilters[filter.id] || 'all'}
                                onChange={(e) => {
                                    setActiveFilters(prev => ({ ...prev, [filter.id]: e.target.value }));
                                    setPage(1);
                                }}
                                className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yellow-500/50 cursor-pointer"
                            >
                                <option value="all">{filter.label}</option>
                                {filter.options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    ))}

                    {/* View Toggle */}
                    {allowViewToggle && renderCard && (
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

                    {/* Add Button */}
                    {onAdd && (
                        <button
                            onClick={onAdd}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg text-sm font-medium transition-colors"
                        >
                            <Plus size={16} />
                            {addLabel}
                        </button>
                    )}
                </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-500">
                {filteredData.length} {filteredData.length === 1 ? 'item' : 'items'}
                {searchQuery && ` matching "${searchQuery}"`}
            </div>

            {/* Content */}
            {paginatedData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    {emptyIcon && <div className="mb-4 text-gray-600">{emptyIcon}</div>}
                    <p className="text-gray-400">{emptyMessage}</p>
                    {onAdd && (
                        <button
                            onClick={onAdd}
                            className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm transition-colors"
                        >
                            <Plus size={16} />
                            {addLabel}
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' && renderCard ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedData.map((item, index) => renderCard(item, index))}
                </div>
            ) : (
                <div className="rounded-xl border border-white/10 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5">
                                {columns.map(column => (
                                    <th
                                        key={column.id}
                                        className={`text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider ${column.className || ''}`}
                                        style={{ width: column.width }}
                                    >
                                        {column.sortable ? (
                                            <button
                                                onClick={() => handleSort(column.id)}
                                                className="flex items-center gap-1 hover:text-white"
                                            >
                                                {column.header}
                                                {sortColumn === column.id && (
                                                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </button>
                                        ) : (
                                            column.header
                                        )}
                                    </th>
                                ))}
                                {renderActions && <th className="w-12"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedData.map(item => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    {columns.map(column => (
                                        <td key={column.id} className={`p-4 ${column.className || ''}`}>
                                            {getCellValue(item, column)}
                                        </td>
                                    ))}
                                    {renderActions && (
                                        <td className="p-4 text-right">
                                            {renderActions(item)}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
