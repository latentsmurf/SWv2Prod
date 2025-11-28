'use client';

import React, { useState } from 'react';
import {
    Check, X, Trash2, Download, RefreshCw, Tag, Move,
    Copy, Archive, Share2, Loader2, ChevronDown
} from 'lucide-react';

interface BatchOperationsProps<T> {
    selectedItems: T[];
    onClearSelection: () => void;
    onDelete?: (items: T[]) => Promise<void>;
    onExport?: (items: T[]) => Promise<void>;
    onRegenerate?: (items: T[]) => Promise<void>;
    onMove?: (items: T[], targetId: string) => Promise<void>;
    onTag?: (items: T[], tags: string[]) => Promise<void>;
    onDuplicate?: (items: T[]) => Promise<void>;
    onArchive?: (items: T[]) => Promise<void>;
    moveTargets?: { id: string; name: string }[];
    availableTags?: string[];
    itemType?: string;
}

export default function BatchOperations<T extends { id: string }>({
    selectedItems,
    onClearSelection,
    onDelete,
    onExport,
    onRegenerate,
    onMove,
    onTag,
    onDuplicate,
    onArchive,
    moveTargets = [],
    availableTags = [],
    itemType = 'item'
}: BatchOperationsProps<T>) {
    const [loading, setLoading] = useState<string | null>(null);
    const [showMoveDropdown, setShowMoveDropdown] = useState(false);
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    if (selectedItems.length === 0) return null;

    const handleAction = async (action: string, fn: () => Promise<void>) => {
        setLoading(action);
        try {
            await fn();
        } catch (error) {
            console.error(`Error during ${action}:`, error);
        } finally {
            setLoading(null);
        }
    };

    const ActionButton = ({
        action,
        icon: Icon,
        label,
        onClick,
        variant = 'default',
        disabled = false
    }: {
        action: string;
        icon: React.ElementType;
        label: string;
        onClick: () => void;
        variant?: 'default' | 'danger';
        disabled?: boolean;
    }) => (
        <button
            onClick={onClick}
            disabled={loading !== null || disabled}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                variant === 'danger'
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-gray-300 hover:bg-white/10'
            }`}
        >
            {loading === action ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <Icon size={16} />
            )}
            <span className="text-sm">{label}</span>
        </button>
    );

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl flex items-center gap-2 px-4 py-2">
                {/* Selection count */}
                <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                    <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Check size={14} className="text-yellow-500" />
                    </div>
                    <span className="text-sm text-white font-medium">
                        {selectedItems.length} {itemType}{selectedItems.length !== 1 ? 's' : ''} selected
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    {/* Regenerate */}
                    {onRegenerate && (
                        <ActionButton
                            action="regenerate"
                            icon={RefreshCw}
                            label="Regenerate"
                            onClick={() => handleAction('regenerate', () => onRegenerate(selectedItems))}
                        />
                    )}

                    {/* Export */}
                    {onExport && (
                        <ActionButton
                            action="export"
                            icon={Download}
                            label="Export"
                            onClick={() => handleAction('export', () => onExport(selectedItems))}
                        />
                    )}

                    {/* Duplicate */}
                    {onDuplicate && (
                        <ActionButton
                            action="duplicate"
                            icon={Copy}
                            label="Duplicate"
                            onClick={() => handleAction('duplicate', () => onDuplicate(selectedItems))}
                        />
                    )}

                    {/* Move */}
                    {onMove && moveTargets.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => setShowMoveDropdown(!showMoveDropdown)}
                                className="flex items-center gap-2 px-3 py-1.5 text-gray-300 hover:bg-white/10 rounded-lg"
                            >
                                <Move size={16} />
                                <span className="text-sm">Move</span>
                                <ChevronDown size={14} />
                            </button>
                            
                            {showMoveDropdown && (
                                <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-xl">
                                    {moveTargets.map((target) => (
                                        <button
                                            key={target.id}
                                            onClick={() => {
                                                setShowMoveDropdown(false);
                                                handleAction('move', () => onMove(selectedItems, target.id));
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5"
                                        >
                                            {target.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tag */}
                    {onTag && availableTags.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => setShowTagDropdown(!showTagDropdown)}
                                className="flex items-center gap-2 px-3 py-1.5 text-gray-300 hover:bg-white/10 rounded-lg"
                            >
                                <Tag size={16} />
                                <span className="text-sm">Tag</span>
                                <ChevronDown size={14} />
                            </button>
                            
                            {showTagDropdown && (
                                <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-xl">
                                    {availableTags.map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => {
                                                setSelectedTags(prev => 
                                                    prev.includes(tag) 
                                                        ? prev.filter(t => t !== tag)
                                                        : [...prev, tag]
                                                );
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center justify-between"
                                        >
                                            {tag}
                                            {selectedTags.includes(tag) && (
                                                <Check size={14} className="text-yellow-500" />
                                            )}
                                        </button>
                                    ))}
                                    {selectedTags.length > 0 && (
                                        <div className="border-t border-white/5 p-2">
                                            <button
                                                onClick={() => {
                                                    setShowTagDropdown(false);
                                                    handleAction('tag', () => onTag(selectedItems, selectedTags));
                                                    setSelectedTags([]);
                                                }}
                                                className="w-full px-3 py-1.5 bg-yellow-500 text-black text-sm font-medium rounded-lg"
                                            >
                                                Apply Tags
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Archive */}
                    {onArchive && (
                        <ActionButton
                            action="archive"
                            icon={Archive}
                            label="Archive"
                            onClick={() => handleAction('archive', () => onArchive(selectedItems))}
                        />
                    )}

                    {/* Delete */}
                    {onDelete && (
                        <ActionButton
                            action="delete"
                            icon={Trash2}
                            label="Delete"
                            variant="danger"
                            onClick={() => {
                                if (confirm(`Delete ${selectedItems.length} ${itemType}${selectedItems.length !== 1 ? 's' : ''}?`)) {
                                    handleAction('delete', () => onDelete(selectedItems));
                                }
                            }}
                        />
                    )}
                </div>

                {/* Clear selection */}
                <button
                    onClick={onClearSelection}
                    className="ml-2 p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}

// Hook for managing multi-select state
export function useMultiSelect<T extends { id: string }>() {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const selectAll = (items: T[]) => {
        setSelectedIds(new Set(items.map(item => item.id)));
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    const isSelected = (id: string) => selectedIds.has(id);

    const getSelectedItems = (items: T[]) => 
        items.filter(item => selectedIds.has(item.id));

    return {
        selectedIds,
        selectedCount: selectedIds.size,
        toggleSelection,
        selectAll,
        clearSelection,
        isSelected,
        getSelectedItems
    };
}

// Selectable wrapper component
export function SelectableItem({
    id,
    isSelected,
    onToggle,
    children
}: {
    id: string;
    isSelected: boolean;
    onToggle: (id: string) => void;
    children: React.ReactNode;
}) {
    return (
        <div
            className={`relative group ${isSelected ? 'ring-2 ring-yellow-500' : ''}`}
            onClick={(e) => {
                if (e.shiftKey || e.metaKey || e.ctrlKey) {
                    e.preventDefault();
                    onToggle(id);
                }
            }}
        >
            {/* Selection checkbox */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle(id);
                }}
                className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected
                        ? 'bg-yellow-500 border-yellow-500'
                        : 'bg-black/50 border-white/30 opacity-0 group-hover:opacity-100'
                }`}
            >
                {isSelected && <Check size={12} className="text-black" />}
            </button>
            {children}
        </div>
    );
}
