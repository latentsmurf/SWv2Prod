'use client';

import React from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

// ============================================================================
// SEARCH INPUT
// ============================================================================

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchInput({ 
    value, 
    onChange, 
    placeholder = 'Search...', 
    className = '' 
}: SearchInputProps) {
    return (
        <div className={`relative ${className}`}>
            <Search 
                size={16} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" 
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-8 py-2 rounded-lg text-sm 
                    bg-gray-50 dark:bg-white/5 
                    border border-gray-200 dark:border-white/10 
                    text-gray-900 dark:text-white 
                    placeholder:text-gray-400 dark:placeholder:text-gray-600 
                    focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500
                    transition-colors"
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
}

// ============================================================================
// TEXT INPUT
// ============================================================================

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label?: string;
    error?: string;
    hint?: string;
    onChange?: (value: string) => void;
}

export function TextInput({ 
    label, 
    error, 
    hint, 
    className = '', 
    onChange,
    ...props 
}: TextInputProps) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                    {label}
                </label>
            )}
            <input
                {...props}
                onChange={(e) => onChange?.(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm
                    bg-gray-50 dark:bg-white/5
                    border ${error ? 'border-red-500' : 'border-gray-200 dark:border-white/10'}
                    text-gray-900 dark:text-white
                    placeholder:text-gray-400 dark:placeholder:text-gray-600
                    focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20' : 'focus:ring-yellow-500/20'} 
                    ${error ? 'focus:border-red-500' : 'focus:border-yellow-500'}
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
    );
}

// ============================================================================
// TEXTAREA
// ============================================================================

interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
    label?: string;
    error?: string;
    hint?: string;
    onChange?: (value: string) => void;
}

export function TextArea({ 
    label, 
    error, 
    hint, 
    className = '', 
    rows = 4,
    onChange,
    ...props 
}: TextAreaProps) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                    {label}
                </label>
            )}
            <textarea
                {...props}
                rows={rows}
                onChange={(e) => onChange?.(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm resize-none
                    bg-gray-50 dark:bg-white/5
                    border ${error ? 'border-red-500' : 'border-gray-200 dark:border-white/10'}
                    text-gray-900 dark:text-white
                    placeholder:text-gray-400 dark:placeholder:text-gray-600
                    focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20' : 'focus:ring-yellow-500/20'}
                    ${error ? 'focus:border-red-500' : 'focus:border-yellow-500'}
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
    );
}

// ============================================================================
// SELECT
// ============================================================================

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    label?: string;
    placeholder?: string;
    error?: string;
    className?: string;
    disabled?: boolean;
}

export function Select({ 
    value, 
    onChange, 
    options, 
    label, 
    placeholder,
    error, 
    className = '',
    disabled = false,
}: SelectProps) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className={`w-full px-3 py-2 rounded-lg text-sm appearance-none
                        bg-gray-50 dark:bg-white/5
                        border ${error ? 'border-red-500' : 'border-gray-200 dark:border-white/10'}
                        text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20' : 'focus:ring-yellow-500/20'}
                        ${error ? 'focus:border-red-500' : 'focus:border-yellow-500'}
                        transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                >
                    {placeholder && (
                        <option value="" disabled>{placeholder}</option>
                    )}
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <ChevronDown 
                    size={16} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                />
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

// ============================================================================
// CHECKBOX
// ============================================================================

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
    className?: string;
}

export function Checkbox({ 
    checked, 
    onChange, 
    label, 
    description,
    disabled = false,
    className = '' 
}: CheckboxProps) {
    return (
        <label className={`flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
            <div className="relative flex-shrink-0 mt-0.5">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                    className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 transition-colors
                    ${checked 
                        ? 'bg-yellow-500 border-yellow-500' 
                        : 'bg-gray-50 dark:bg-white/5 border-gray-300 dark:border-white/20'
                    }`}
                >
                    {checked && (
                        <svg className="w-full h-full text-black" viewBox="0 0 24 24">
                            <path 
                                fill="currentColor" 
                                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                            />
                        </svg>
                    )}
                </div>
            </div>
            {(label || description) && (
                <div>
                    {label && <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>}
                    {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
                </div>
            )}
        </label>
    );
}

// ============================================================================
// TOGGLE SWITCH
// ============================================================================

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}

export function Toggle({ 
    checked, 
    onChange, 
    label, 
    description,
    disabled = false,
    size = 'md',
    className = '' 
}: ToggleProps) {
    const sizeClasses = {
        sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
        md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    };
    const s = sizeClasses[size];

    return (
        <label className={`flex items-center justify-between cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
            {(label || description) && (
                <div className="flex-1 mr-3">
                    {label && <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>}
                    {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
                </div>
            )}
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => !disabled && onChange(!checked)}
                className={`relative inline-flex flex-shrink-0 ${s.track} rounded-full transition-colors
                    ${checked ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-white/20'}`}
            >
                <span
                    className={`${s.thumb} rounded-full bg-white shadow transform transition-transform
                        ${checked ? s.translate : 'translate-x-0.5'}`}
                    style={{ marginTop: size === 'sm' ? '2px' : '2px' }}
                />
            </button>
        </label>
    );
}

// ============================================================================
// RADIO GROUP
// ============================================================================

interface RadioOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

interface RadioGroupProps {
    value: string;
    onChange: (value: string) => void;
    options: RadioOption[];
    label?: string;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

export function RadioGroup({ 
    value, 
    onChange, 
    options, 
    label,
    orientation = 'vertical',
    className = '' 
}: RadioGroupProps) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                    {label}
                </label>
            )}
            <div className={`${orientation === 'horizontal' ? 'flex items-center gap-4' : 'space-y-2'}`}>
                {options.map(opt => (
                    <label 
                        key={opt.value}
                        className={`flex items-start gap-3 cursor-pointer ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className="relative flex-shrink-0 mt-0.5">
                            <input
                                type="radio"
                                checked={value === opt.value}
                                onChange={() => onChange(opt.value)}
                                disabled={opt.disabled}
                                className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 transition-colors
                                ${value === opt.value 
                                    ? 'border-yellow-500' 
                                    : 'border-gray-300 dark:border-white/20'
                                }`}
                            >
                                {value === opt.value && (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{opt.label}</span>
                            {opt.description && <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>}
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}
