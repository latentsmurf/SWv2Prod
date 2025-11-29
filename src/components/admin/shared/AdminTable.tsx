'use client';

import React, { useState, useMemo, ReactNode } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, RefreshCw, MoreVertical } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface TableColumn<T> {
    id: string;
    header: string;
    accessor: keyof T | ((item: T) => ReactNode);
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (item: T, value: any) => ReactNode;
}

export interface AdminTableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    loading?: boolean;
    keyField: keyof T;
    
    // Search
    searchable?: boolean;
    searchPlaceholder?: string;
    searchFields?: (keyof T)[];
    
    // Selection
    selectable?: boolean;
    selectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
    
    // Actions
    rowActions?: (item: T) => ReactNode;
    bulkActions?: ReactNode;
    
    // Pagination
    pageSize?: number;
    
    // Sorting
    defaultSort?: { column: string; direction: 'asc' | 'desc' };
    
    // Empty state
    emptyState?: ReactNode;
    loadingRows?: number;
    
    // Callbacks
    onRowClick?: (item: T) => void;
    onRefresh?: () => void;
    
    // Custom styling
    className?: string;
    compact?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminTable<T extends Record<string, any>>({
    data,
    columns,
    loading = false,
    keyField,
    searchable = true,
    searchPlaceholder = 'Search...',
    searchFields,
    selectable = false,
    selectedIds = [],
    onSelectionChange,
    rowActions,
    bulkActions,
    pageSize = 10,
    defaultSort,
    emptyState,
    loadingRows = 5,
    onRowClick,
    onRefresh,
    className = '',
    compact = false,
}: AdminTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState(defaultSort || { column: '', direction: 'asc' as const });
    const [currentPage, setCurrentPage] = useState(1);

    // Filter data
    const filteredData = useMemo(() => {
        if (!searchQuery || !searchFields?.length) return data;
        
        const query = searchQuery.toLowerCase();
        return data.filter(item => 
            searchFields.some(field => {
                const value = item[field];
                return typeof value === 'string' && value.toLowerCase().includes(query);
            })
        );
    }, [data, searchQuery, searchFields]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortConfig.column) return filteredData;
        
        return [...filteredData].sort((a, b) => {
            const column = columns.find(c => c.id === sortConfig.column);
            if (!column) return 0;
            
            const aValue = typeof column.accessor === 'function' 
                ? column.accessor(a) 
                : a[column.accessor];
            const bValue = typeof column.accessor === 'function' 
                ? column.accessor(b) 
                : b[column.accessor];
            
            // Handle null/undefined values
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
            if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
            
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig, columns]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    // Handle sorting
    const handleSort = (columnId: string) => {
        setSortConfig(prev => ({
            column: columnId,
            direction: prev.column === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    // Handle selection
    const handleSelectAll = () => {
        if (!onSelectionChange) return;
        
        const allIds = paginatedData.map(item => String(item[keyField]));
        const allSelected = allIds.every(id => selectedIds.includes(id));
        
        if (allSelected) {
            onSelectionChange(selectedIds.filter(id => !allIds.includes(id)));
        } else {
            onSelectionChange([...new Set([...selectedIds, ...allIds])]);
        }
    };

    const handleSelect = (item: T) => {
        if (!onSelectionChange) return;
        
        const id = String(item[keyField]);
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(i => i !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    // Get cell value
    const getCellValue = (item: T, column: TableColumn<T>) => {
        const value = typeof column.accessor === 'function' 
            ? column.accessor(item) 
            : item[column.accessor];
        
        return column.render ? column.render(item, value) : value;
    };

    const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3';

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Toolbar */}
            {(searchable || bulkActions || onRefresh) && (
                <div className="flex items-center justify-between gap-4">
                    {searchable && (
                        <div className="relative flex-1 max-w-md">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder={searchPlaceholder}
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-500/50"
                            />
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                        {selectedIds.length > 0 && bulkActions && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 rounded-lg">
                                <span className="text-sm text-yellow-400">{selectedIds.length} selected</span>
                                {bulkActions}
                            </div>
                        )}
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-white/5">
                        <tr>
                            {selectable && (
                                <th className={`${cellPadding} w-10`}>
                                    <input
                                        type="checkbox"
                                        checked={paginatedData.length > 0 && paginatedData.every(item => 
                                            selectedIds.includes(String(item[keyField]))
                                        )}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-gray-600 bg-transparent text-yellow-500 focus:ring-yellow-500/50"
                                    />
                                </th>
                            )}
                            {columns.map(column => (
                                <th
                                    key={column.id}
                                    className={`${cellPadding} text-${column.align || 'left'} text-sm font-medium text-gray-400 ${column.sortable ? 'cursor-pointer hover:text-white' : ''}`}
                                    style={{ width: column.width }}
                                    onClick={() => column.sortable && handleSort(column.id)}
                                >
                                    <div className="flex items-center gap-1">
                                        {column.header}
                                        {column.sortable && sortConfig.column === column.id && (
                                            sortConfig.direction === 'asc' 
                                                ? <ChevronUp size={14} /> 
                                                : <ChevronDown size={14} />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {rowActions && (
                                <th className={`${cellPadding} text-right w-20`}></th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            // Loading skeleton
                            Array.from({ length: loadingRows }).map((_, i) => (
                                <tr key={i}>
                                    {selectable && <td className={cellPadding}><div className="w-4 h-4 bg-white/10 rounded animate-pulse" /></td>}
                                    {columns.map(col => (
                                        <td key={col.id} className={cellPadding}>
                                            <div className="h-4 bg-white/10 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                                        </td>
                                    ))}
                                    {rowActions && <td className={cellPadding}></td>}
                                </tr>
                            ))
                        ) : paginatedData.length === 0 ? (
                            // Empty state
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)} className="p-8 text-center">
                                    {emptyState || (
                                        <div className="text-gray-500">
                                            {searchQuery ? 'No results found' : 'No data available'}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            // Data rows
                            paginatedData.map(item => {
                                const id = String(item[keyField]);
                                const isSelected = selectedIds.includes(id);
                                
                                return (
                                    <tr 
                                        key={id}
                                        className={`hover:bg-white/5 transition-colors ${isSelected ? 'bg-yellow-500/5' : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
                                        onClick={() => onRowClick?.(item)}
                                    >
                                        {selectable && (
                                            <td className={cellPadding} onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelect(item)}
                                                    className="w-4 h-4 rounded border-gray-600 bg-transparent text-yellow-500 focus:ring-yellow-500/50"
                                                />
                                            </td>
                                        )}
                                        {columns.map(column => (
                                            <td 
                                                key={column.id} 
                                                className={`${cellPadding} text-${column.align || 'left'} text-sm`}
                                            >
                                                {getCellValue(item, column)}
                                            </td>
                                        ))}
                                        {rowActions && (
                                            <td className={`${cellPadding} text-right`} onClick={e => e.stopPropagation()}>
                                                {rowActions(item)}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-lg bg-white/5 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                            let page: number;
                            if (totalPages <= 5) {
                                page = i + 1;
                            } else if (currentPage <= 3) {
                                page = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                page = totalPages - 4 + i;
                            } else {
                                page = currentPage - 2 + i;
                            }
                            
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded-lg text-sm ${
                                        currentPage === page 
                                            ? 'bg-yellow-500 text-black' 
                                            : 'bg-white/5 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-lg bg-white/5 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
