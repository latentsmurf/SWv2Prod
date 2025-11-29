'use client';

import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ModalWrapperProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Called when modal should close */
    onClose: () => void;
    /** Modal title */
    title?: string;
    /** Modal description/subtitle */
    description?: string;
    /** Modal content */
    children: React.ReactNode;
    /** Footer content (buttons, etc.) */
    footer?: React.ReactNode;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Whether clicking backdrop closes modal */
    closeOnBackdropClick?: boolean;
    /** Whether pressing Escape closes modal */
    closeOnEscape?: boolean;
    /** Custom class for the modal content */
    className?: string;
    /** Whether to show close button */
    showCloseButton?: boolean;
}

// ============================================================================
// SIZE CONFIGURATION
// ============================================================================

const SIZE_CLASSES = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw] max-h-[90vh]',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function ModalWrapper({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    closeOnBackdropClick = true,
    closeOnEscape = true,
    className = '',
    showCloseButton = true,
}: ModalWrapperProps) {
    // Handle escape key
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (closeOnEscape && e.key === 'Escape') {
            onClose();
        }
    }, [closeOnEscape, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div 
                className={`
                    w-full ${SIZE_CLASSES[size]} 
                    bg-white dark:bg-[#0a0a0a] 
                    border border-gray-200 dark:border-white/10 
                    rounded-2xl shadow-2xl 
                    overflow-hidden flex flex-col
                    ${className}
                `}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5 flex items-start justify-between gap-4">
                        {title && (
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                    {title}
                                </h2>
                                {description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}
                        {showCloseButton && (
                            <button 
                                onClick={onClose}
                                className="p-2 -m-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// BUTTON PRESETS FOR FOOTER
// ============================================================================

interface ModalButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    loading?: boolean;
}

export function ModalButton({ 
    onClick, 
    children, 
    variant = 'secondary',
    disabled = false,
    loading = false,
}: ModalButtonProps) {
    const variantClasses = {
        primary: 'bg-yellow-500 hover:bg-yellow-400 text-black font-semibold',
        secondary: 'bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-900 dark:text-white',
        danger: 'bg-red-500 hover:bg-red-400 text-white font-semibold',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variantClasses[variant]}
            `}
        >
            {loading ? 'Loading...' : children}
        </button>
    );
}
