'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
    MousePointer2, Hand, Paintbrush, Eraser, Square, Circle, Type, Crop,
    Wand2, Sparkles, Palette, ZoomIn, ZoomOut, RotateCcw, RotateCw,
    FlipHorizontal, FlipVertical, Layers, Eye, EyeOff, Lock, Unlock,
    Plus, Trash2, Copy, Download, Upload, Undo2, Redo2, Save, History,
    ChevronLeft, ChevronRight, GitBranch, Loader2, Maximize2, Minimize2,
    SunMedium, Contrast, Droplets, Blend, Focus, ImagePlus, Scissors,
    Move, PenTool, Pipette, PaintBucket, Stamp, Expand, ArrowUpRight,
    Settings2, Grid3X3, Magnet
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Layer {
    id: string;
    name: string;
    type: 'image' | 'adjustment' | 'ai_edit' | 'text' | 'shape';
    visible: boolean;
    locked: boolean;
    opacity: number;
    blendMode: string;
    data: string | null; // base64 or canvas data
    thumbnail?: string;
    position: { x: number; y: number };
    transform: { scaleX: number; scaleY: number; rotation: number };
}

interface Version {
    id: string;
    name: string;
    timestamp: Date;
    thumbnail: string;
    layers: Layer[];
    isCurrent: boolean;
    parentId?: string;
    description?: string;
}

interface AIOperation {
    id: string;
    type: 'inpaint' | 'outpaint' | 'enhance' | 'style_transfer' | 'remove_bg' | 'upscale' | 'colorize' | 'denoise' | 'face_fix' | 'generative_fill';
    prompt?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
}

interface HistoryEntry {
    id: string;
    action: string;
    timestamp: Date;
    snapshot: string;
}

type Tool = 'select' | 'move' | 'hand' | 'brush' | 'eraser' | 'pen' | 'shape' | 
            'text' | 'crop' | 'eyedropper' | 'bucket' | 'clone' | 'healing' | 
            'dodge' | 'burn' | 'marquee' | 'lasso' | 'magic_wand';

interface ImageEditingStudioProps {
    imageUrl: string;
    shotId: string;
    shotName?: string;
    onSave?: (data: { imageData: string; versions: Version[] }) => Promise<void>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ImageEditingStudio({ imageUrl, shotId, shotName }: ImageEditingStudioProps) {
    // Canvas refs
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Tool state
    const [activeTool, setActiveTool] = useState<Tool>('select');
    const [brushSize, setBrushSize] = useState(20);
    const [brushHardness, setBrushHardness] = useState(100);
    const [brushOpacity, setBrushOpacity] = useState(100);
    const [primaryColor, setPrimaryColor] = useState('#ffffff');
    const [secondaryColor, setSecondaryColor] = useState('#000000');
    
    // Canvas state
    const [zoom, setZoom] = useState(100);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [snapToGrid, setSnapToGrid] = useState(false);
    
    // Layers
    const [layers, setLayers] = useState<Layer[]>([]);
    const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
    
    // Versions (branching)
    const [versions, setVersions] = useState<Version[]>([]);
    const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
    
    // History (undo/redo)
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    
    // AI Operations
    const [aiOperations, setAiOperations] = useState<AIOperation[]>([]);
    const [aiPrompt, setAiPrompt] = useState('');
    const [selectedAiTool, setSelectedAiTool] = useState<AIOperation['type']>('inpaint');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // UI State
    const [showLayers, setShowLayers] = useState(true);
    const [showHistory, setShowHistory] = useState(true);
    const [showAiPanel, setShowAiPanel] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showVersionBranches, setShowVersionBranches] = useState(false);
    
    // Selection state
    const [selection, setSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);

    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    
    useEffect(() => {
        loadImage();
    }, [imageUrl]);
    
    const loadImage = async () => {
        if (!imageUrl) return;
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = mainCanvasRef.current;
            if (!canvas) return;
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            ctx.drawImage(img, 0, 0);
            
            // Create initial layer
            const baseLayer: Layer = {
                id: crypto.randomUUID(),
                name: 'Background',
                type: 'image',
                visible: true,
                locked: true,
                opacity: 100,
                blendMode: 'normal',
                data: canvas.toDataURL('image/png'),
                thumbnail: canvas.toDataURL('image/png', 0.1),
                position: { x: 0, y: 0 },
                transform: { scaleX: 1, scaleY: 1, rotation: 0 }
            };
            
            setLayers([baseLayer]);
            setActiveLayerId(baseLayer.id);
            
            // Create initial version
            const initialVersion: Version = {
                id: crypto.randomUUID(),
                name: 'Original',
                timestamp: new Date(),
                thumbnail: canvas.toDataURL('image/png', 0.1),
                layers: [baseLayer],
                isCurrent: true
            };
            
            setVersions([initialVersion]);
            setCurrentVersionId(initialVersion.id);
            
            // Setup overlay canvas
            const overlay = overlayCanvasRef.current;
            if (overlay) {
                overlay.width = img.width;
                overlay.height = img.height;
            }
        };
        img.src = imageUrl;
    };

    // ========================================================================
    // CANVAS DRAWING
    // ========================================================================
    
    const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = mainCanvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };
    
    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const coords = getCanvasCoords(e);
        
        if (activeTool === 'hand' || e.button === 1) {
            setIsPanning(true);
            return;
        }
        
        if (activeTool === 'marquee') {
            setSelectionStart(coords);
            setSelection(null);
            return;
        }
        
        if (['brush', 'eraser', 'healing', 'clone'].includes(activeTool)) {
            setIsDrawing(true);
            const overlay = overlayCanvasRef.current;
            if (!overlay) return;
            
            const ctx = overlay.getContext('2d');
            if (!ctx) return;
            
            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
            ctx.strokeStyle = activeTool === 'eraser' ? 'rgba(255,255,255,0.8)' : primaryColor;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = brushOpacity / 100;
        }
    };
    
    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const coords = getCanvasCoords(e);
        
        if (isPanning) {
            setPan(prev => ({
                x: prev.x + e.movementX,
                y: prev.y + e.movementY
            }));
            return;
        }
        
        if (activeTool === 'marquee' && selectionStart) {
            setSelection({
                x: Math.min(selectionStart.x, coords.x),
                y: Math.min(selectionStart.y, coords.y),
                width: Math.abs(coords.x - selectionStart.x),
                height: Math.abs(coords.y - selectionStart.y)
            });
            return;
        }
        
        if (isDrawing) {
            const overlay = overlayCanvasRef.current;
            if (!overlay) return;
            
            const ctx = overlay.getContext('2d');
            if (!ctx) return;
            
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
        }
    };
    
    const handleCanvasMouseUp = () => {
        setIsPanning(false);
        setIsDrawing(false);
        setSelectionStart(null);
        
        // If we were drawing, save to history
        if (isDrawing) {
            addToHistory('Brush stroke');
        }
    };

    // ========================================================================
    // HISTORY (UNDO/REDO)
    // ========================================================================
    
    const addToHistory = (action: string) => {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        
        const entry: HistoryEntry = {
            id: crypto.randomUUID(),
            action,
            timestamp: new Date(),
            snapshot: canvas.toDataURL('image/png')
        };
        
        // Remove any redo history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(entry);
        
        // Keep only last 50 entries
        if (newHistory.length > 50) newHistory.shift();
        
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };
    
    const undo = () => {
        if (historyIndex <= 0) return;
        setHistoryIndex(prev => prev - 1);
        restoreFromHistory(historyIndex - 1);
    };
    
    const redo = () => {
        if (historyIndex >= history.length - 1) return;
        setHistoryIndex(prev => prev + 1);
        restoreFromHistory(historyIndex + 1);
    };
    
    const restoreFromHistory = (index: number) => {
        const entry = history[index];
        if (!entry) return;
        
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = entry.snapshot;
    };

    // ========================================================================
    // VERSION CONTROL
    // ========================================================================
    
    const createVersion = (name?: string) => {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        
        // Mark all versions as not current
        const updatedVersions = versions.map(v => ({ ...v, isCurrent: false }));
        
        const newVersion: Version = {
            id: crypto.randomUUID(),
            name: name || `Version ${versions.length + 1}`,
            timestamp: new Date(),
            thumbnail: canvas.toDataURL('image/png', 0.1),
            layers: [...layers],
            isCurrent: true,
            parentId: currentVersionId || undefined
        };
        
        setVersions([...updatedVersions, newVersion]);
        setCurrentVersionId(newVersion.id);
    };
    
    const switchToVersion = (versionId: string) => {
        const version = versions.find(v => v.id === versionId);
        if (!version) return;
        
        setLayers(version.layers);
        setActiveLayerId(version.layers[0]?.id || null);
        
        // Update current flags
        setVersions(prev => prev.map(v => ({
            ...v,
            isCurrent: v.id === versionId
        })));
        setCurrentVersionId(versionId);
        
        // Restore canvas
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const baseLayer = version.layers.find(l => l.type === 'image');
        if (baseLayer?.data) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = baseLayer.data;
        }
    };

    // ========================================================================
    // LAYER MANAGEMENT
    // ========================================================================
    
    const addLayer = (type: Layer['type'] = 'image') => {
        const newLayer: Layer = {
            id: crypto.randomUUID(),
            name: `Layer ${layers.length + 1}`,
            type,
            visible: true,
            locked: false,
            opacity: 100,
            blendMode: 'normal',
            data: null,
            position: { x: 0, y: 0 },
            transform: { scaleX: 1, scaleY: 1, rotation: 0 }
        };
        
        setLayers(prev => [newLayer, ...prev]);
        setActiveLayerId(newLayer.id);
        addToHistory(`Add ${type} layer`);
    };
    
    const deleteLayer = (layerId: string) => {
        if (layers.length <= 1) return;
        
        setLayers(prev => prev.filter(l => l.id !== layerId));
        if (activeLayerId === layerId) {
            setActiveLayerId(layers.find(l => l.id !== layerId)?.id || null);
        }
        addToHistory('Delete layer');
    };
    
    const toggleLayerVisibility = (layerId: string) => {
        setLayers(prev => prev.map(l => 
            l.id === layerId ? { ...l, visible: !l.visible } : l
        ));
    };
    
    const toggleLayerLock = (layerId: string) => {
        setLayers(prev => prev.map(l => 
            l.id === layerId ? { ...l, locked: !l.locked } : l
        ));
    };
    
    const updateLayerOpacity = (layerId: string, opacity: number) => {
        setLayers(prev => prev.map(l => 
            l.id === layerId ? { ...l, opacity } : l
        ));
    };

    // ========================================================================
    // AI OPERATIONS (Nano Banana Pro / Gemini)
    // ========================================================================
    
    const runAiOperation = async (type: AIOperation['type']) => {
        if (!aiPrompt && ['inpaint', 'generative_fill', 'style_transfer'].includes(type)) {
            return;
        }
        
        setIsProcessing(true);
        
        const operationId = crypto.randomUUID();
        const operation: AIOperation = {
            id: operationId,
            type,
            prompt: aiPrompt,
            status: 'processing',
            progress: 0
        };
        
        setAiOperations(prev => [operation, ...prev]);
        
        try {
            const canvas = mainCanvasRef.current;
            const overlay = overlayCanvasRef.current;
            if (!canvas) throw new Error('Canvas not found');
            
            // Get mask from overlay if available
            let maskBase64 = null;
            if (overlay && ['inpaint', 'generative_fill'].includes(type)) {
                maskBase64 = overlay.toDataURL('image/png');
            }
            
            // Call API
            const response = await fetch('/api/ai/image-edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shot_id: shotId,
                    operation: type,
                    prompt: aiPrompt,
                    image_base64: canvas.toDataURL('image/png'),
                    mask_base64: maskBase64,
                    selection: selection
                })
            });
            
            const data = await response.json();
            
            if (data.status === 'success' && data.result_image) {
                // Apply result to canvas
                const img = new Image();
                img.onload = () => {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        
                        // Add as new layer
                        const aiLayer: Layer = {
                            id: crypto.randomUUID(),
                            name: `AI: ${type}`,
                            type: 'ai_edit',
                            visible: true,
                            locked: false,
                            opacity: 100,
                            blendMode: 'normal',
                            data: data.result_image,
                            thumbnail: data.result_image,
                            position: { x: 0, y: 0 },
                            transform: { scaleX: 1, scaleY: 1, rotation: 0 }
                        };
                        
                        setLayers(prev => [aiLayer, ...prev]);
                        addToHistory(`AI: ${type}`);
                        
                        // Clear overlay
                        if (overlay) {
                            const overlayCtx = overlay.getContext('2d');
                            overlayCtx?.clearRect(0, 0, overlay.width, overlay.height);
                        }
                    }
                };
                img.src = data.result_image;
                
                setAiOperations(prev => prev.map(op => 
                    op.id === operationId ? { ...op, status: 'completed' } : op
                ));
            } else {
                throw new Error(data.detail || 'AI operation failed');
            }
        } catch (error) {
            console.error('AI operation failed:', error);
            setAiOperations(prev => prev.map(op => 
                op.id === operationId ? { ...op, status: 'failed' } : op
            ));
        } finally {
            setIsProcessing(false);
            setAiPrompt('');
        }
    };
    
    const clearMask = () => {
        const overlay = overlayCanvasRef.current;
        if (!overlay) return;
        
        const ctx = overlay.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, overlay.width, overlay.height);
        }
        setSelection(null);
    };

    // ========================================================================
    // ZOOM & PAN
    // ========================================================================
    
    const handleZoom = (delta: number) => {
        setZoom(prev => Math.max(10, Math.min(500, prev + delta)));
    };
    
    const fitToScreen = () => {
        const container = containerRef.current;
        const canvas = mainCanvasRef.current;
        if (!container || !canvas) return;
        
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        
        const scaleX = containerWidth / canvas.width;
        const scaleY = containerHeight / canvas.height;
        const scale = Math.min(scaleX, scaleY) * 100;
        
        setZoom(Math.round(scale));
        setPan({ x: 0, y: 0 });
    };

    // ========================================================================
    // EXPORT & SAVE
    // ========================================================================
    
    const exportImage = (format: 'png' | 'jpg' | 'webp' = 'png') => {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        
        const link = document.createElement('a');
        link.download = `${shotName || 'edited'}_${Date.now()}.${format}`;
        link.href = canvas.toDataURL(`image/${format}`, format === 'jpg' ? 0.9 : 1);
        link.click();
    };
    
    const saveCurrentState = async () => {
        createVersion('Auto-save');
        // Could also call onSave prop here
    };

    // ========================================================================
    // KEYBOARD SHORTCUTS
    // ========================================================================
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            
            // Tool shortcuts
            if (e.key === 'v') setActiveTool('select');
            if (e.key === 'h') setActiveTool('hand');
            if (e.key === 'b') setActiveTool('brush');
            if (e.key === 'e') setActiveTool('eraser');
            if (e.key === 'm') setActiveTool('marquee');
            if (e.key === 'c') setActiveTool('crop');
            if (e.key === 't') setActiveTool('text');
            if (e.key === 'i') setActiveTool('eyedropper');
            if (e.key === 'j') setActiveTool('healing');
            if (e.key === 's') setActiveTool('clone');
            
            // Undo/Redo
            if (e.metaKey || e.ctrlKey) {
                if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
                if (e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
                if (e.key === 's') { e.preventDefault(); saveCurrentState(); }
            }
            
            // Zoom
            if (e.key === '+' || e.key === '=') handleZoom(10);
            if (e.key === '-') handleZoom(-10);
            if (e.key === '0') fitToScreen();
            
            // Space for hand tool
            if (e.key === ' ' && !isDrawing) {
                e.preventDefault();
                setActiveTool('hand');
            }
            
            // Escape to deselect
            if (e.key === 'Escape') {
                setSelection(null);
                clearMask();
            }
            
            // Delete selection
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selection) {
                    // Fill selection with transparent
                    const canvas = mainCanvasRef.current;
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.clearRect(selection.x, selection.y, selection.width, selection.height);
                            addToHistory('Delete selection');
                        }
                    }
                }
            }
        };
        
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === ' ') setActiveTool('select');
        };
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [historyIndex, selection, isDrawing]);

    // ========================================================================
    // TOOL DEFINITIONS
    // ========================================================================
    
    const tools: { id: Tool; icon: React.ReactNode; label: string; shortcut: string }[] = [
        { id: 'select', icon: <MousePointer2 size={18} />, label: 'Select', shortcut: 'V' },
        { id: 'move', icon: <Move size={18} />, label: 'Move', shortcut: 'V' },
        { id: 'hand', icon: <Hand size={18} />, label: 'Hand', shortcut: 'H' },
        { id: 'marquee', icon: <Square size={18} />, label: 'Marquee', shortcut: 'M' },
        { id: 'lasso', icon: <PenTool size={18} />, label: 'Lasso', shortcut: 'L' },
        { id: 'magic_wand', icon: <Wand2 size={18} />, label: 'Magic Wand', shortcut: 'W' },
        { id: 'crop', icon: <Crop size={18} />, label: 'Crop', shortcut: 'C' },
        { id: 'eyedropper', icon: <Pipette size={18} />, label: 'Eyedropper', shortcut: 'I' },
        { id: 'brush', icon: <Paintbrush size={18} />, label: 'Brush', shortcut: 'B' },
        { id: 'eraser', icon: <Eraser size={18} />, label: 'Eraser', shortcut: 'E' },
        { id: 'bucket', icon: <PaintBucket size={18} />, label: 'Fill', shortcut: 'G' },
        { id: 'clone', icon: <Stamp size={18} />, label: 'Clone Stamp', shortcut: 'S' },
        { id: 'healing', icon: <Blend size={18} />, label: 'Healing', shortcut: 'J' },
        { id: 'text', icon: <Type size={18} />, label: 'Text', shortcut: 'T' },
        { id: 'shape', icon: <Circle size={18} />, label: 'Shape', shortcut: 'U' },
    ];
    
    const aiTools: { type: AIOperation['type']; icon: React.ReactNode; label: string; description: string; needsPrompt: boolean }[] = [
        { type: 'inpaint', icon: <Paintbrush size={18} />, label: 'Inpaint', description: 'Paint over & describe replacement', needsPrompt: true },
        { type: 'generative_fill', icon: <Sparkles size={18} />, label: 'Generative Fill', description: 'AI-powered content-aware fill', needsPrompt: true },
        { type: 'remove_bg', icon: <Scissors size={18} />, label: 'Remove Background', description: 'Automatically remove background', needsPrompt: false },
        { type: 'enhance', icon: <SunMedium size={18} />, label: 'Enhance', description: 'Auto-enhance image quality', needsPrompt: false },
        { type: 'upscale', icon: <Expand size={18} />, label: 'Upscale 4x', description: 'AI upscale to higher resolution', needsPrompt: false },
        { type: 'face_fix', icon: <Focus size={18} />, label: 'Fix Faces', description: 'Restore and enhance faces', needsPrompt: false },
        { type: 'denoise', icon: <Droplets size={18} />, label: 'Denoise', description: 'Remove noise and grain', needsPrompt: false },
        { type: 'colorize', icon: <Palette size={18} />, label: 'Colorize', description: 'Add color to B&W images', needsPrompt: false },
        { type: 'style_transfer', icon: <ArrowUpRight size={18} />, label: 'Style Transfer', description: 'Apply artistic style', needsPrompt: true },
        { type: 'outpaint', icon: <ImagePlus size={18} />, label: 'Outpaint', description: 'Extend image beyond borders', needsPrompt: true },
    ];

    // ========================================================================
    // RENDER
    // ========================================================================
    
    return (
        <div className={`flex flex-col h-full bg-[#0a0a0a] text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
            {/* Top Toolbar */}
            <div className="h-12 bg-[#1a1a1a] border-b border-white/5 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <h2 className="font-bold text-yellow-500 flex items-center gap-2">
                        <Sparkles size={20} />
                        Repair Studio
                        <span className="text-xs font-normal text-gray-500 ml-2">Powered by Nano Banana Pro</span>
                    </h2>
                    {shotName && <span className="text-sm text-gray-400">• {shotName}</span>}
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className="p-2 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
                        title="Undo (Cmd+Z)"
                    >
                        <Undo2 size={18} />
                    </button>
                    <button
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        className="p-2 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
                        title="Redo (Cmd+Shift+Z)"
                    >
                        <Redo2 size={18} />
                    </button>
                    
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    
                    <div className="flex items-center gap-1 bg-black/30 rounded px-2 py-1">
                        <button onClick={() => handleZoom(-10)} className="p-1 hover:bg-white/10 rounded">
                            <ZoomOut size={16} />
                        </button>
                        <span className="text-sm w-14 text-center">{zoom}%</span>
                        <button onClick={() => handleZoom(10)} className="p-1 hover:bg-white/10 rounded">
                            <ZoomIn size={16} />
                        </button>
                        <button onClick={fitToScreen} className="p-1 hover:bg-white/10 rounded ml-1" title="Fit to screen">
                            <Maximize2 size={16} />
                        </button>
                    </div>
                    
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`p-2 rounded transition-colors ${showGrid ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-white/10'}`}
                        title="Toggle Grid"
                    >
                        <Grid3X3 size={18} />
                    </button>
                    <button
                        onClick={() => setSnapToGrid(!snapToGrid)}
                        className={`p-2 rounded transition-colors ${snapToGrid ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-white/10'}`}
                        title="Snap to Grid"
                    >
                        <Magnet size={18} />
                    </button>
                    
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    
                    <button
                        onClick={() => createVersion()}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm flex items-center gap-2 transition-colors"
                    >
                        <GitBranch size={16} />
                        Save Version
                    </button>
                    
                    <button
                        onClick={() => exportImage('png')}
                        className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <Download size={16} />
                        Export
                    </button>
                    
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 rounded hover:bg-white/10 transition-colors"
                    >
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                </div>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
                {/* Left Toolbar */}
                <div className="w-12 bg-[#1a1a1a] border-r border-white/5 flex flex-col items-center py-2 gap-1">
                    {tools.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id)}
                            className={`w-9 h-9 rounded flex items-center justify-center transition-colors group relative
                                ${activeTool === tool.id 
                                    ? 'bg-yellow-500/20 text-yellow-400' 
                                    : 'hover:bg-white/10 text-gray-400 hover:text-white'
                                }`}
                            title={`${tool.label} (${tool.shortcut})`}
                        >
                            {tool.icon}
                            <span className="absolute left-full ml-2 px-2 py-1 bg-black/90 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                                {tool.label} ({tool.shortcut})
                            </span>
                        </button>
                    ))}
                    
                    <div className="w-8 h-px bg-white/10 my-2" />
                    
                    {/* Color swatches */}
                    <div className="relative w-9 h-9">
                        <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div
                            className="w-6 h-6 rounded border-2 border-white absolute top-0 left-0"
                            style={{ backgroundColor: primaryColor }}
                        />
                        <div
                            className="w-6 h-6 rounded border border-white/50 absolute bottom-0 right-0"
                            style={{ backgroundColor: secondaryColor }}
                            onClick={() => {
                                const temp = primaryColor;
                                setPrimaryColor(secondaryColor);
                                setSecondaryColor(temp);
                            }}
                        />
                    </div>
                </div>
                
                {/* Tool Options Bar */}
                <div className="flex flex-col flex-1">
                    <div className="h-10 bg-[#151515] border-b border-white/5 flex items-center px-4 gap-4">
                        {['brush', 'eraser', 'healing', 'clone'].includes(activeTool) && (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Size:</span>
                                    <input
                                        type="range"
                                        min="1"
                                        max="200"
                                        value={brushSize}
                                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                        className="w-24 accent-yellow-500"
                                    />
                                    <span className="text-xs w-8">{brushSize}px</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Hardness:</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={brushHardness}
                                        onChange={(e) => setBrushHardness(parseInt(e.target.value))}
                                        className="w-24 accent-yellow-500"
                                    />
                                    <span className="text-xs w-8">{brushHardness}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Opacity:</span>
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={brushOpacity}
                                        onChange={(e) => setBrushOpacity(parseInt(e.target.value))}
                                        className="w-24 accent-yellow-500"
                                    />
                                    <span className="text-xs w-8">{brushOpacity}%</span>
                                </div>
                            </>
                        )}
                        
                        {activeTool === 'marquee' && selection && (
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span>Selection: {Math.round(selection.width)} × {Math.round(selection.height)}</span>
                                <button
                                    onClick={() => setSelection(null)}
                                    className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Main Canvas Area */}
                    <div 
                        ref={containerRef}
                        className="flex-1 overflow-hidden bg-[#0d0d0d] relative flex items-center justify-center"
                        style={{ 
                            backgroundImage: showGrid ? 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)' : undefined,
                            backgroundSize: showGrid ? '20px 20px' : undefined
                        }}
                    >
                        {/* Checkerboard background for transparency */}
                        <div 
                            className="relative shadow-2xl"
                            style={{
                                transform: `scale(${zoom / 100}) translate(${pan.x}px, ${pan.y}px)`,
                                transformOrigin: 'center'
                            }}
                        >
                            <div 
                                className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage: 'linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)',
                                    backgroundSize: '20px 20px',
                                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                                }}
                            />
                            
                            {/* Main canvas */}
                            <canvas
                                ref={mainCanvasRef}
                                className="relative z-10"
                                style={{ 
                                    maxWidth: 'none',
                                    cursor: activeTool === 'hand' ? 'grab' : 
                                           activeTool === 'brush' || activeTool === 'eraser' ? 'crosshair' :
                                           activeTool === 'eyedropper' ? 'cell' :
                                           activeTool === 'move' ? 'move' : 'default'
                                }}
                            />
                            
                            {/* Overlay canvas for masks/selections */}
                            <canvas
                                ref={overlayCanvasRef}
                                onMouseDown={handleCanvasMouseDown}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                                onMouseLeave={handleCanvasMouseUp}
                                className="absolute inset-0 z-20"
                                style={{ 
                                    cursor: activeTool === 'hand' ? (isPanning ? 'grabbing' : 'grab') : 
                                           activeTool === 'brush' || activeTool === 'eraser' ? 'crosshair' :
                                           activeTool === 'marquee' ? 'crosshair' :
                                           activeTool === 'eyedropper' ? 'cell' :
                                           activeTool === 'move' ? 'move' : 'default'
                                }}
                            />
                            
                            {/* Selection overlay */}
                            {selection && (
                                <div
                                    className="absolute z-30 border-2 border-dashed border-white/70 pointer-events-none"
                                    style={{
                                        left: selection.x * (100 / zoom),
                                        top: selection.y * (100 / zoom),
                                        width: selection.width * (100 / zoom),
                                        height: selection.height * (100 / zoom),
                                        animation: 'marching-ants 0.5s linear infinite'
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Right Panel */}
                <div className="w-72 bg-[#1a1a1a] border-l border-white/5 flex flex-col overflow-hidden">
                    {/* AI Tools Panel */}
                    <div className={`border-b border-white/5 ${showAiPanel ? '' : 'h-10'} transition-all`}>
                        <button
                            onClick={() => setShowAiPanel(!showAiPanel)}
                            className="w-full h-10 px-3 flex items-center justify-between text-sm font-medium hover:bg-white/5"
                        >
                            <span className="flex items-center gap-2">
                                <Sparkles size={16} className="text-yellow-400" />
                                AI Tools
                            </span>
                            {showAiPanel ? <ChevronLeft size={16} className="rotate-90" /> : <ChevronRight size={16} className="-rotate-90" />}
                        </button>
                        
                        {showAiPanel && (
                            <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-2">
                                    {aiTools.map(tool => (
                                        <button
                                            key={tool.type}
                                            onClick={() => setSelectedAiTool(tool.type)}
                                            className={`p-2 rounded text-left transition-colors ${
                                                selectedAiTool === tool.type
                                                    ? 'bg-yellow-500/20 border border-yellow-500/50'
                                                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                {tool.icon}
                                                <span className="text-xs font-medium">{tool.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                
                                {/* Prompt input */}
                                {aiTools.find(t => t.type === selectedAiTool)?.needsPrompt && (
                                    <textarea
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder={`Describe what to ${selectedAiTool === 'inpaint' ? 'replace with' : selectedAiTool === 'style_transfer' ? 'style like' : 'generate'}...`}
                                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm resize-none h-20 focus:border-yellow-500/50 focus:outline-none"
                                    />
                                )}
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => runAiOperation(selectedAiTool)}
                                        disabled={isProcessing || (aiTools.find(t => t.type === selectedAiTool)?.needsPrompt && !aiPrompt)}
                                        className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium rounded text-sm flex items-center justify-center gap-2 transition-colors"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} />
                                                Apply
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={clearMask}
                                        className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                                
                                <p className="text-xs text-gray-500">
                                    {aiTools.find(t => t.type === selectedAiTool)?.description}
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* Layers Panel */}
                    <div className={`border-b border-white/5 flex-1 flex flex-col min-h-0 ${showLayers ? '' : 'h-10 flex-none'}`}>
                        <button
                            onClick={() => setShowLayers(!showLayers)}
                            className="w-full h-10 px-3 flex items-center justify-between text-sm font-medium hover:bg-white/5 flex-shrink-0"
                        >
                            <span className="flex items-center gap-2">
                                <Layers size={16} />
                                Layers
                            </span>
                            {showLayers ? <ChevronLeft size={16} className="rotate-90" /> : <ChevronRight size={16} className="-rotate-90" />}
                        </button>
                        
                        {showLayers && (
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex items-center gap-1 p-2 border-b border-white/5">
                                    <button
                                        onClick={() => addLayer('image')}
                                        className="p-1.5 hover:bg-white/10 rounded"
                                        title="Add Layer"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <button
                                        onClick={() => activeLayerId && deleteLayer(activeLayerId)}
                                        disabled={layers.length <= 1}
                                        className="p-1.5 hover:bg-white/10 rounded disabled:opacity-30"
                                        title="Delete Layer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button className="p-1.5 hover:bg-white/10 rounded" title="Duplicate Layer">
                                        <Copy size={16} />
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {layers.map(layer => (
                                        <div
                                            key={layer.id}
                                            onClick={() => setActiveLayerId(layer.id)}
                                            className={`p-2 rounded flex items-center gap-2 cursor-pointer transition-colors ${
                                                activeLayerId === layer.id
                                                    ? 'bg-yellow-500/20 border border-yellow-500/30'
                                                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                            }`}
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                                                className="p-1 hover:bg-white/10 rounded"
                                            >
                                                {layer.visible ? <Eye size={14} /> : <EyeOff size={14} className="text-gray-500" />}
                                            </button>
                                            
                                            <div className="w-8 h-8 bg-black rounded overflow-hidden flex-shrink-0">
                                                {layer.thumbnail && (
                                                    <img src={layer.thumbnail} alt="" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs truncate">{layer.name}</p>
                                                <p className="text-[10px] text-gray-500">{layer.type}</p>
                                            </div>
                                            
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
                                                className="p-1 hover:bg-white/10 rounded"
                                            >
                                                {layer.locked ? <Lock size={14} className="text-yellow-400" /> : <Unlock size={14} className="text-gray-500" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Layer opacity */}
                                {activeLayerId && (
                                    <div className="p-2 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Opacity:</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={layers.find(l => l.id === activeLayerId)?.opacity || 100}
                                                onChange={(e) => updateLayerOpacity(activeLayerId, parseInt(e.target.value))}
                                                className="flex-1 accent-yellow-500"
                                            />
                                            <span className="text-xs w-8">{layers.find(l => l.id === activeLayerId)?.opacity || 100}%</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Version History */}
                    <div className={`${showHistory ? '' : 'h-10'} transition-all`}>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="w-full h-10 px-3 flex items-center justify-between text-sm font-medium hover:bg-white/5"
                        >
                            <span className="flex items-center gap-2">
                                <GitBranch size={16} />
                                Versions ({versions.length})
                            </span>
                            {showHistory ? <ChevronLeft size={16} className="rotate-90" /> : <ChevronRight size={16} className="-rotate-90" />}
                        </button>
                        
                        {showHistory && (
                            <div className="p-2 space-y-2 max-h-48 overflow-y-auto">
                                {versions.map(version => (
                                    <div
                                        key={version.id}
                                        onClick={() => switchToVersion(version.id)}
                                        className={`p-2 rounded flex items-center gap-2 cursor-pointer transition-colors ${
                                            version.isCurrent
                                                ? 'bg-yellow-500/20 border border-yellow-500/30'
                                                : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                        }`}
                                    >
                                        <div className="w-10 h-6 bg-black rounded overflow-hidden flex-shrink-0">
                                            <img src={version.thumbnail} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs truncate">{version.name}</p>
                                            <p className="text-[10px] text-gray-500">
                                                {version.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                        {version.isCurrent && (
                                            <span className="text-[10px] bg-yellow-500/30 text-yellow-400 px-1.5 py-0.5 rounded">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Bottom Status Bar */}
            <div className="h-6 bg-[#1a1a1a] border-t border-white/5 flex items-center justify-between px-4 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                    <span>Tool: {tools.find(t => t.id === activeTool)?.label}</span>
                    <span>•</span>
                    <span>Zoom: {zoom}%</span>
                    {selection && (
                        <>
                            <span>•</span>
                            <span>Selection: {Math.round(selection.width)} × {Math.round(selection.height)}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <span>Layers: {layers.length}</span>
                    <span>•</span>
                    <span>History: {history.length} states</span>
                    <span>•</span>
                    <span>Versions: {versions.length}</span>
                </div>
            </div>
            
            {/* CSS for marching ants animation */}
            <style jsx>{`
                @keyframes marching-ants {
                    0% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: 16; }
                }
            `}</style>
        </div>
    );
}
