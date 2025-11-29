'use client';

import React, { ReactNode } from 'react';
import { X, Loader2 } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface FormField {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'file' | 'custom';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    hint?: string;
    span?: 1 | 2; // Column span
    render?: (value: any, onChange: (value: any) => void) => ReactNode;
}

export interface FormSection {
    title: string;
    fields: FormField[];
}

export interface AddEditModalProps<T> {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<T>) => Promise<void>;
    
    // Header
    title: string;
    editMode?: boolean;
    
    // Form
    sections: FormSection[];
    values: Partial<T>;
    onChange: (field: string, value: any) => void;
    
    // State
    loading?: boolean;
    error?: string;
    
    // Size
    size?: 'md' | 'lg' | 'xl';
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AddEditModal<T>({
    isOpen,
    onClose,
    onSubmit,
    title,
    editMode = false,
    sections,
    values,
    onChange,
    loading = false,
    error,
    size = 'lg',
}: AddEditModalProps<T>) {
    if (!isOpen) return null;

    const sizeClasses = {
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(values);
    };

    const renderField = (field: FormField) => {
        const value = (values as any)[field.id] ?? '';
        const baseInputClass = "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50";

        switch (field.type) {
            case 'textarea':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={3}
                        className={`${baseInputClass} resize-none`}
                    />
                );
            
            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        required={field.required}
                        className={`${baseInputClass} cursor-pointer`}
                    >
                        <option value="">Select {field.label}</option>
                        {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                );
            
            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(field.id, parseFloat(e.target.value) || 0)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className={baseInputClass}
                    />
                );
            
            case 'checkbox':
                return (
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => onChange(field.id, e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                        />
                        <span className="text-sm text-gray-400">{field.hint || field.label}</span>
                    </label>
                );
            
            case 'file':
                return (
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center hover:border-purple-500/30 transition-colors cursor-pointer">
                        <input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    // Create preview URL for images
                                    const url = URL.createObjectURL(file);
                                    onChange(field.id, url);
                                }
                            }}
                            className="hidden"
                            id={`file-${field.id}`}
                        />
                        <label htmlFor={`file-${field.id}`} className="cursor-pointer">
                            <p className="text-sm text-gray-400">
                                {value ? 'Change file' : 'Click to upload'}
                            </p>
                        </label>
                    </div>
                );
            
            case 'custom':
                return field.render?.(value, (v) => onChange(field.id, v));
            
            default:
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className={baseInputClass}
                    />
                );
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className={`w-full ${sizeClasses[size]} bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">
                        {editMode ? `Edit ${title}` : `Add ${title}`}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {sections.map((section, sectionIndex) => (
                            <div key={sectionIndex}>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                    {section.title}
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {section.fields.map((field) => (
                                        <div 
                                            key={field.id} 
                                            className={field.span === 2 ? 'col-span-2' : ''}
                                        >
                                            {field.type !== 'checkbox' && (
                                                <label className="block text-sm font-medium text-white mb-1">
                                                    {field.label}
                                                    {field.required && <span className="text-red-400 ml-1">*</span>}
                                                </label>
                                            )}
                                            {renderField(field)}
                                            {field.hint && field.type !== 'checkbox' && (
                                                <p className="text-xs text-gray-500 mt-1">{field.hint}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mx-6 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="p-4 border-t border-white/5 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {editMode ? 'Save Changes' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
