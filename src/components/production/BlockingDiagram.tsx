'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Layout, Plus, Save, Download, Trash2, Move, RotateCw,
    Camera, User, Box, Circle, Square, Triangle, ArrowRight,
    Undo, Redo, Layers, Grid, Eye, ZoomIn, ZoomOut, Lock
} from 'lucide-react';

interface DiagramElement {
    id: string;
    type: 'camera' | 'actor' | 'prop' | 'light' | 'marker' | 'wall' | 'door' | 'window' | 'furniture' | 'arrow';
    x: number;
    y: number;
    rotation: number;
    scale: number;
    label?: string;
    color?: string;
    width?: number;
    height?: number;
    locked: boolean;
}

interface BlockingDiagramProps {
    projectId: string;
    sceneId?: string;
    shotId?: string;
}

const ELEMENT_TYPES = {
    camera: { label: 'Camera', icon: Camera, color: '#3b82f6' },
    actor: { label: 'Actor', icon: User, color: '#eab308' },
    prop: { label: 'Prop', icon: Box, color: '#22c55e' },
    light: { label: 'Light', icon: Circle, color: '#f97316' },
    marker: { label: 'Marker', icon: Circle, color: '#ec4899' },
    wall: { label: 'Wall', icon: Square, color: '#6b7280' },
    door: { label: 'Door', icon: Square, color: '#8b5cf6' },
    window: { label: 'Window', icon: Square, color: '#06b6d4' },
    furniture: { label: 'Furniture', icon: Square, color: '#84cc16' },
    arrow: { label: 'Movement', icon: ArrowRight, color: '#f43f5e' }
};

export default function BlockingDiagram({ projectId, sceneId, shotId }: BlockingDiagramProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [elements, setElements] = useState<DiagramElement[]>([]);
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [selectedTool, setSelectedTool] = useState<string>('select');
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [showGrid, setShowGrid] = useState(true);
    const [gridSize, setGridSize] = useState(20);
    const [history, setHistory] = useState<DiagramElement[][]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [diagramName, setDiagramName] = useState('Untitled Diagram');

    // Save to history
    const saveToHistory = useCallback((newElements: DiagramElement[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push([...newElements]);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    // Undo/Redo
    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setElements([...history[historyIndex - 1]]);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setElements([...history[historyIndex + 1]]);
        }
    };

    // Draw canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply transforms
        ctx.save();
        ctx.translate(pan.x, pan.y);
        ctx.scale(zoom, zoom);

        // Draw grid
        if (showGrid) {
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 1 / zoom;
            for (let x = 0; x < canvas.width / zoom; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height / zoom);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height / zoom; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width / zoom, y);
                ctx.stroke();
            }
        }

        // Draw elements
        elements.forEach(element => {
            ctx.save();
            ctx.translate(element.x, element.y);
            ctx.rotate((element.rotation * Math.PI) / 180);
            ctx.scale(element.scale, element.scale);

            const config = ELEMENT_TYPES[element.type as keyof typeof ELEMENT_TYPES];
            const isSelected = selectedElement === element.id;

            // Selection highlight
            if (isSelected) {
                ctx.strokeStyle = '#eab308';
                ctx.lineWidth = 2 / zoom;
                ctx.strokeRect(-25, -25, 50, 50);
            }

            // Draw based on type
            ctx.fillStyle = element.color || config?.color || '#ffffff';
            ctx.strokeStyle = element.color || config?.color || '#ffffff';

            switch (element.type) {
                case 'camera':
                    // Camera body
                    ctx.fillRect(-15, -10, 30, 20);
                    // Lens
                    ctx.beginPath();
                    ctx.moveTo(15, -5);
                    ctx.lineTo(25, -10);
                    ctx.lineTo(25, 10);
                    ctx.lineTo(15, 5);
                    ctx.fill();
                    // View cone
                    ctx.globalAlpha = 0.2;
                    ctx.beginPath();
                    ctx.moveTo(25, 0);
                    ctx.lineTo(100, -40);
                    ctx.lineTo(100, 40);
                    ctx.closePath();
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    break;

                case 'actor':
                    // Head
                    ctx.beginPath();
                    ctx.arc(0, -12, 8, 0, Math.PI * 2);
                    ctx.fill();
                    // Body
                    ctx.beginPath();
                    ctx.moveTo(0, -4);
                    ctx.lineTo(0, 12);
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    // Direction indicator
                    ctx.beginPath();
                    ctx.moveTo(0, -4);
                    ctx.lineTo(15, -4);
                    ctx.lineTo(12, -7);
                    ctx.moveTo(15, -4);
                    ctx.lineTo(12, -1);
                    ctx.stroke();
                    break;

                case 'light':
                    // Light source
                    ctx.beginPath();
                    ctx.arc(0, 0, 12, 0, Math.PI * 2);
                    ctx.fill();
                    // Rays
                    ctx.globalAlpha = 0.3;
                    for (let i = 0; i < 8; i++) {
                        const angle = (i * Math.PI) / 4;
                        ctx.beginPath();
                        ctx.moveTo(Math.cos(angle) * 15, Math.sin(angle) * 15);
                        ctx.lineTo(Math.cos(angle) * 30, Math.sin(angle) * 30);
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                    ctx.globalAlpha = 1;
                    break;

                case 'wall':
                    ctx.fillRect(-element.width! / 2 || -40, -5, element.width || 80, 10);
                    break;

                case 'door':
                    ctx.fillRect(-20, -5, 40, 10);
                    ctx.globalAlpha = 0.5;
                    ctx.beginPath();
                    ctx.arc(-20, 0, 30, -Math.PI / 2, 0);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                    break;

                case 'furniture':
                    ctx.fillRect(
                        -(element.width || 40) / 2,
                        -(element.height || 30) / 2,
                        element.width || 40,
                        element.height || 30
                    );
                    break;

                case 'arrow':
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(-30, 0);
                    ctx.lineTo(20, 0);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(20, 0);
                    ctx.lineTo(10, -8);
                    ctx.moveTo(20, 0);
                    ctx.lineTo(10, 8);
                    ctx.stroke();
                    break;

                default:
                    ctx.beginPath();
                    ctx.arc(0, 0, 15, 0, Math.PI * 2);
                    ctx.fill();
            }

            // Label
            if (element.label) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(element.label, 0, 35);
            }

            // Lock indicator
            if (element.locked) {
                ctx.fillStyle = '#f97316';
                ctx.beginPath();
                ctx.arc(20, -20, 5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });

        ctx.restore();
    }, [elements, selectedElement, zoom, pan, showGrid, gridSize]);

    // Mouse handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;

        if (selectedTool === 'select') {
            // Check if clicking on an element
            const clickedElement = elements.find(el => {
                const dx = x - el.x;
                const dy = y - el.y;
                return Math.sqrt(dx * dx + dy * dy) < 25 * el.scale;
            });

            if (clickedElement && !clickedElement.locked) {
                setSelectedElement(clickedElement.id);
                setIsDragging(true);
                setDragStart({ x: x - clickedElement.x, y: y - clickedElement.y });
            } else {
                setSelectedElement(null);
            }
        } else if (selectedTool !== 'select') {
            // Add new element
            const newElement: DiagramElement = {
                id: crypto.randomUUID(),
                type: selectedTool as DiagramElement['type'],
                x: Math.round(x / gridSize) * gridSize,
                y: Math.round(y / gridSize) * gridSize,
                rotation: 0,
                scale: 1,
                locked: false
            };

            if (selectedTool === 'wall' || selectedTool === 'furniture') {
                newElement.width = 80;
                newElement.height = 40;
            }

            const newElements = [...elements, newElement];
            setElements(newElements);
            saveToHistory(newElements);
            setSelectedElement(newElement.id);
            setSelectedTool('select');
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !selectedElement) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;

        setElements(elements.map(el => {
            if (el.id === selectedElement) {
                return {
                    ...el,
                    x: Math.round((x - dragStart.x) / gridSize) * gridSize,
                    y: Math.round((y - dragStart.y) / gridSize) * gridSize
                };
            }
            return el;
        }));
    };

    const handleMouseUp = () => {
        if (isDragging) {
            saveToHistory(elements);
        }
        setIsDragging(false);
    };

    // Element controls
    const rotateElement = (degrees: number) => {
        if (!selectedElement) return;
        const newElements = elements.map(el => 
            el.id === selectedElement ? { ...el, rotation: (el.rotation + degrees) % 360 } : el
        );
        setElements(newElements);
        saveToHistory(newElements);
    };

    const deleteElement = () => {
        if (!selectedElement) return;
        const newElements = elements.filter(el => el.id !== selectedElement);
        setElements(newElements);
        saveToHistory(newElements);
        setSelectedElement(null);
    };

    const toggleLock = () => {
        if (!selectedElement) return;
        const newElements = elements.map(el =>
            el.id === selectedElement ? { ...el, locked: !el.locked } : el
        );
        setElements(newElements);
        saveToHistory(newElements);
    };

    const updateLabel = (label: string) => {
        if (!selectedElement) return;
        setElements(elements.map(el =>
            el.id === selectedElement ? { ...el, label } : el
        ));
    };

    // Export
    const exportPNG = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const link = document.createElement('a');
        link.download = `${diagramName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    // Save
    const saveDiagram = async () => {
        try {
            await fetch(`/api/projects/${projectId}/blocking-diagrams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: diagramName,
                    sceneId,
                    shotId,
                    elements
                })
            });
        } catch (error) {
            console.error('Error saving:', error);
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#121212]">
                <div className="flex items-center gap-4">
                    <Layout className="text-yellow-500" size={24} />
                    <input
                        type="text"
                        value={diagramName}
                        onChange={(e) => setDiagramName(e.target.value)}
                        className="bg-transparent text-lg font-bold text-gray-900 dark:text-white border-none focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={undo} disabled={historyIndex <= 0} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30">
                        <Undo size={18} />
                    </button>
                    <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30">
                        <Redo size={18} />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                        <ZoomOut size={18} />
                    </button>
                    <span className="text-sm text-gray-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                        <ZoomIn size={18} />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`p-2 rounded ${showGrid ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <Grid size={18} />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <button onClick={exportPNG} className="px-3 py-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/5 rounded-lg text-sm">
                        <Download size={16} className="inline mr-1" />
                        PNG
                    </button>
                    <button onClick={saveDiagram} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl">
                        <Save size={16} />
                        Save
                    </button>
                </div>
            </div>

            <div className="flex-1 flex">
                {/* Element Palette */}
                <div className="w-56 border-r border-white/5 p-4 bg-[#121212]">
                    <p className="text-sm text-gray-500 mb-3">Elements</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setSelectedTool('select')}
                            className={`p-3 rounded-xl text-sm flex flex-col items-center gap-1 ${
                                selectedTool === 'select' ? 'bg-yellow-500/10 text-yellow-400' : 'text-gray-400 hover:bg-white/5'
                            }`}
                        >
                            <Move size={20} />
                            Select
                        </button>
                        {Object.entries(ELEMENT_TYPES).map(([key, config]) => {
                            const Icon = config.icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedTool(key)}
                                    className={`p-3 rounded-xl text-sm flex flex-col items-center gap-1 ${
                                        selectedTool === key ? 'bg-yellow-500/10 text-yellow-400' : 'text-gray-400 hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={20} style={{ color: config.color }} />
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Selected Element Controls */}
                    {selectedElement && (
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <p className="text-sm text-gray-500 mb-3">Selected Element</p>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={elements.find(e => e.id === selectedElement)?.label || ''}
                                    onChange={(e) => updateLabel(e.target.value)}
                                    placeholder="Add label..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => rotateElement(-45)}
                                        className="flex-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400"
                                    >
                                        <RotateCw size={16} className="mx-auto transform -scale-x-100" />
                                    </button>
                                    <button
                                        onClick={() => rotateElement(45)}
                                        className="flex-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400"
                                    >
                                        <RotateCw size={16} className="mx-auto" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleLock}
                                        className={`flex-1 p-2 rounded-lg ${
                                            elements.find(e => e.id === selectedElement)?.locked
                                                ? 'bg-orange-500/10 text-orange-400'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                    >
                                        <Lock size={16} className="mx-auto" />
                                    </button>
                                    <button
                                        onClick={deleteElement}
                                        className="flex-1 p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400"
                                    >
                                        <Trash2 size={16} className="mx-auto" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Canvas */}
                <div ref={containerRef} className="flex-1 overflow-hidden relative">
                    <canvas
                        ref={canvasRef}
                        width={1200}
                        height={800}
                        className="cursor-crosshair"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />
                </div>
            </div>
        </div>
    );
}
