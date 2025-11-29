// ============================================================================
// IMAGE EDITING STUDIO TYPES & CONSTANTS
// ============================================================================

import React from 'react';

// ============================================================================
// LAYER TYPES
// ============================================================================

export interface Layer {
    id: string;
    name: string;
    type: 'image' | 'adjustment' | 'ai_edit' | 'text' | 'shape';
    visible: boolean;
    locked: boolean;
    opacity: number;
    blendMode: string;
    data: string | null;
    thumbnail?: string;
    position: { x: number; y: number };
    transform: { scaleX: number; scaleY: number; rotation: number };
}

// ============================================================================
// VERSION TYPES
// ============================================================================

export interface Version {
    id: string;
    name: string;
    timestamp: Date;
    thumbnail: string;
    layers: Layer[];
    isCurrent: boolean;
    parentId?: string;
    description?: string;
}

// ============================================================================
// AI OPERATION TYPES
// ============================================================================

export type AIOperationType = 
    | 'inpaint' 
    | 'outpaint' 
    | 'enhance' 
    | 'style_transfer' 
    | 'remove_bg' 
    | 'upscale' 
    | 'colorize' 
    | 'denoise' 
    | 'face_fix' 
    | 'generative_fill';

export interface AIOperation {
    id: string;
    type: AIOperationType;
    prompt?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
}

// ============================================================================
// HISTORY TYPES
// ============================================================================

export interface HistoryEntry {
    id: string;
    action: string;
    timestamp: Date;
    snapshot: string;
}

// ============================================================================
// TOOL TYPES
// ============================================================================

export type Tool = 
    | 'select' | 'move' | 'hand' | 'brush' | 'eraser' | 'pen' | 'shape'
    | 'text' | 'crop' | 'eyedropper' | 'bucket' | 'clone' | 'healing'
    | 'dodge' | 'burn' | 'marquee' | 'lasso' | 'magic_wand';

export interface ToolDefinition {
    id: Tool;
    icon: React.ReactNode;
    label: string;
    shortcut: string;
}

export interface AIToolDefinition {
    type: AIOperationType;
    icon: React.ReactNode;
    label: string;
    description: string;
    needsPrompt: boolean;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface ImageEditingStudioProps {
    imageUrl: string;
    shotId: string;
    shotName?: string;
    onSave?: (data: { imageData: string; versions: Version[] }) => Promise<void>;
}

export interface Selection {
    x: number;
    y: number;
    width: number;
    height: number;
}

// ============================================================================
// TOOL DEFINITIONS (icon names only - render with getToolIcon)
// ============================================================================

export interface ToolConfig {
    id: Tool;
    iconName: string;
    label: string;
    shortcut: string;
}

export interface AIToolConfig {
    type: AIOperationType;
    iconName: string;
    label: string;
    description: string;
    needsPrompt: boolean;
}

export const TOOL_CONFIGS: ToolConfig[] = [
    { id: 'select', iconName: 'MousePointer2', label: 'Select', shortcut: 'V' },
    { id: 'move', iconName: 'Move', label: 'Move', shortcut: 'V' },
    { id: 'hand', iconName: 'Hand', label: 'Hand', shortcut: 'H' },
    { id: 'marquee', iconName: 'Square', label: 'Marquee', shortcut: 'M' },
    { id: 'lasso', iconName: 'PenTool', label: 'Lasso', shortcut: 'L' },
    { id: 'magic_wand', iconName: 'Wand2', label: 'Magic Wand', shortcut: 'W' },
    { id: 'crop', iconName: 'Crop', label: 'Crop', shortcut: 'C' },
    { id: 'eyedropper', iconName: 'Pipette', label: 'Eyedropper', shortcut: 'I' },
    { id: 'brush', iconName: 'Paintbrush', label: 'Brush', shortcut: 'B' },
    { id: 'eraser', iconName: 'Eraser', label: 'Eraser', shortcut: 'E' },
    { id: 'bucket', iconName: 'PaintBucket', label: 'Fill', shortcut: 'G' },
    { id: 'clone', iconName: 'Stamp', label: 'Clone Stamp', shortcut: 'S' },
    { id: 'healing', iconName: 'Blend', label: 'Healing', shortcut: 'J' },
    { id: 'text', iconName: 'Type', label: 'Text', shortcut: 'T' },
    { id: 'shape', iconName: 'Circle', label: 'Shape', shortcut: 'U' },
];

export const AI_TOOL_CONFIGS: AIToolConfig[] = [
    { type: 'inpaint', iconName: 'Paintbrush', label: 'Inpaint', description: 'Paint over & describe replacement', needsPrompt: true },
    { type: 'generative_fill', iconName: 'Sparkles', label: 'Generative Fill', description: 'AI-powered content-aware fill', needsPrompt: true },
    { type: 'remove_bg', iconName: 'Scissors', label: 'Remove Background', description: 'Automatically remove background', needsPrompt: false },
    { type: 'enhance', iconName: 'SunMedium', label: 'Enhance', description: 'Auto-enhance image quality', needsPrompt: false },
    { type: 'upscale', iconName: 'Expand', label: 'Upscale 4x', description: 'AI upscale to higher resolution', needsPrompt: false },
    { type: 'face_fix', iconName: 'Focus', label: 'Fix Faces', description: 'Restore and enhance faces', needsPrompt: false },
    { type: 'denoise', iconName: 'Droplets', label: 'Denoise', description: 'Remove noise and grain', needsPrompt: false },
    { type: 'colorize', iconName: 'Palette', label: 'Colorize', description: 'Add color to B&W images', needsPrompt: false },
    { type: 'style_transfer', iconName: 'ArrowUpRight', label: 'Style Transfer', description: 'Apply artistic style', needsPrompt: true },
    { type: 'outpaint', iconName: 'ImagePlus', label: 'Outpaint', description: 'Extend image beyond borders', needsPrompt: true },
];

// ============================================================================
// BLEND MODES
// ============================================================================

export const BLEND_MODES = [
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
    'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference',
    'exclusion', 'hue', 'saturation', 'color', 'luminosity'
];
