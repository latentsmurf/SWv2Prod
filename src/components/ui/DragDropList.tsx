'use client';

import React, { useState, useRef, useCallback } from 'react';
import { GripVertical } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface DragDropListProps<T> {
    items: T[];
    onReorder: (items: T[]) => void;
    keyExtractor: (item: T) => string;
    renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
    className?: string;
    itemClassName?: string;
    showHandle?: boolean;
    disabled?: boolean;
}

interface DragState {
    isDragging: boolean;
    dragIndex: number | null;
    hoverIndex: number | null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DragDropList<T>({
    items,
    onReorder,
    keyExtractor,
    renderItem,
    className = '',
    itemClassName = '',
    showHandle = true,
    disabled = false
}: DragDropListProps<T>) {
    const [dragState, setDragState] = useState<DragState>({
        isDragging: false,
        dragIndex: null,
        hoverIndex: null
    });

    const dragItemRef = useRef<number | null>(null);
    const dragOverItemRef = useRef<number | null>(null);

    const handleDragStart = useCallback((index: number) => {
        if (disabled) return;
        dragItemRef.current = index;
        setDragState({
            isDragging: true,
            dragIndex: index,
            hoverIndex: null
        });
    }, [disabled]);

    const handleDragEnter = useCallback((index: number) => {
        if (disabled) return;
        dragOverItemRef.current = index;
        setDragState(prev => ({
            ...prev,
            hoverIndex: index
        }));
    }, [disabled]);

    const handleDragEnd = useCallback(() => {
        if (disabled) return;
        
        const dragIndex = dragItemRef.current;
        const dropIndex = dragOverItemRef.current;

        if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
            const newItems = [...items];
            const [draggedItem] = newItems.splice(dragIndex, 1);
            newItems.splice(dropIndex, 0, draggedItem);
            onReorder(newItems);
        }

        dragItemRef.current = null;
        dragOverItemRef.current = null;
        setDragState({
            isDragging: false,
            dragIndex: null,
            hoverIndex: null
        });
    }, [disabled, items, onReorder]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    return (
        <div className={`space-y-2 ${className}`}>
            {items.map((item, index) => {
                const key = keyExtractor(item);
                const isDragging = dragState.dragIndex === index;
                const isHovered = dragState.hoverIndex === index && dragState.dragIndex !== index;

                return (
                    <div
                        key={key}
                        draggable={!disabled}
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        className={`
                            relative transition-all duration-200
                            ${isDragging ? 'opacity-50 scale-[0.98]' : ''}
                            ${isHovered ? 'translate-y-2' : ''}
                            ${itemClassName}
                        `}
                    >
                        {/* Drop indicator */}
                        {isHovered && (
                            <div className="absolute -top-1 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
                        )}

                        <div className="flex items-center gap-2">
                            {showHandle && !disabled && (
                                <div 
                                    className="cursor-grab active:cursor-grabbing p-1 text-gray-600 hover:text-gray-400"
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    <GripVertical size={16} />
                                </div>
                            )}
                            <div className="flex-1">
                                {renderItem(item, index, isDragging)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ============================================================================
// SORTABLE ITEM WRAPPER
// ============================================================================

interface SortableItemProps {
    children: React.ReactNode;
    className?: string;
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

export function SortableItem({ 
    children, 
    className = '',
    onDragStart,
    onDragEnd 
}: SortableItemProps) {
    const [isDragging, setIsDragging] = useState(false);

    return (
        <div
            draggable
            onDragStart={() => {
                setIsDragging(true);
                onDragStart?.();
            }}
            onDragEnd={() => {
                setIsDragging(false);
                onDragEnd?.();
            }}
            className={`
                transition-all duration-200
                ${isDragging ? 'opacity-50 scale-[0.98]' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
}

// ============================================================================
// DROP ZONE
// ============================================================================

interface DropZoneProps {
    onDrop: (data: string) => void;
    accept?: string[];
    children: React.ReactNode;
    className?: string;
    activeClassName?: string;
}

export function DropZone({
    onDrop,
    accept = [],
    children,
    className = '',
    activeClassName = 'border-pink-500 bg-pink-500/10'
}: DropZoneProps) {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);
        
        const data = e.dataTransfer.getData('text/plain');
        if (accept.length === 0 || accept.includes(e.dataTransfer.types[0])) {
            onDrop(data);
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                transition-all duration-200 border-2 border-dashed border-white/10 rounded-xl
                ${isOver ? activeClassName : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
}
