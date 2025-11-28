'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Layout, Plus, Trash2, Move, Image, Link, Type, Palette,
    Download, Upload, Loader2, X, ZoomIn, ZoomOut, Grid,
    Save, Share2, ChevronDown, Sparkles
} from 'lucide-react';

interface MoodBoardItem {
    id: string;
    type: 'image' | 'text' | 'color' | 'link';
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    zIndex: number;
    metadata?: {
        title?: string;
        source?: string;
        color?: string;
    };
}

interface MoodBoard {
    id: string;
    name: string;
    project_id: string;
    items: MoodBoardItem[];
    background_color: string;
    created_at: string;
    updated_at: string;
}

interface MoodBoardBuilderProps {
    projectId: string;
    boardId?: string;
    onSave?: (board: MoodBoard) => void;
}

export default function MoodBoardBuilder({ projectId, boardId, onSave }: MoodBoardBuilderProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [board, setBoard] = useState<MoodBoard>({
        id: boardId || '',
        name: 'Untitled Mood Board',
        project_id: projectId,
        items: [],
        background_color: '#0a0a0a',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Load existing board
    useEffect(() => {
        if (boardId) {
            const fetchBoard = async () => {
                try {
                    const res = await fetch(`/api/projects/${projectId}/moodboards/${boardId}`);
                    if (res.ok) {
                        setBoard(await res.json());
                    }
                } catch (error) {
                    console.error('Error fetching board:', error);
                }
            };
            fetchBoard();
        }
    }, [projectId, boardId]);

    // Add item
    const addItem = (type: MoodBoardItem['type'], content: string = '', metadata?: any) => {
        const newItem: MoodBoardItem = {
            id: crypto.randomUUID(),
            type,
            content,
            x: 100 + Math.random() * 200,
            y: 100 + Math.random() * 200,
            width: type === 'text' ? 200 : type === 'color' ? 100 : 300,
            height: type === 'text' ? 100 : type === 'color' ? 100 : 200,
            zIndex: board.items.length,
            metadata
        };
        setBoard(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
        setSelectedItem(newItem.id);
        setShowAddMenu(false);
    };

    // Update item
    const updateItem = (id: string, updates: Partial<MoodBoardItem>) => {
        setBoard(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, ...updates } : item
            )
        }));
    };

    // Delete item
    const deleteItem = (id: string) => {
        setBoard(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
        if (selectedItem === id) setSelectedItem(null);
    };

    // Handle drag
    const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        
        const item = board.items.find(i => i.id === itemId);
        if (!item) return;

        setDragging(itemId);
        setSelectedItem(itemId);
        setDragOffset({
            x: e.clientX / zoom - item.x,
            y: e.clientY / zoom - item.y
        });

        // Bring to front
        const maxZ = Math.max(...board.items.map(i => i.zIndex));
        updateItem(itemId, { zIndex: maxZ + 1 });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return;
        
        updateItem(dragging, {
            x: e.clientX / zoom - dragOffset.x,
            y: e.clientY / zoom - dragOffset.y
        });
    };

    const handleMouseUp = () => {
        setDragging(null);
    };

    // Save board
    const saveBoard = async () => {
        setSaving(true);
        try {
            const url = boardId 
                ? `/api/projects/${projectId}/moodboards/${boardId}`
                : `/api/projects/${projectId}/moodboards`;
            
            const res = await fetch(url, {
                method: boardId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(board)
            });

            if (res.ok) {
                const saved = await res.json();
                setBoard(saved);
                onSave?.(saved);
            }
        } catch (error) {
            console.error('Error saving board:', error);
        } finally {
            setSaving(false);
        }
    };

    // AI generate mood board
    const generateFromPrompt = async () => {
        const prompt = window.prompt('Describe the mood/aesthetic you want:');
        if (!prompt) return;

        setGenerating(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/moodboards/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (res.ok) {
                const generated = await res.json();
                setBoard(prev => ({
                    ...prev,
                    items: [...prev.items, ...generated.items]
                }));
            }
        } catch (error) {
            console.error('Error generating:', error);
        } finally {
            setGenerating(false);
        }
    };

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result as string;
            addItem('image', content, { title: file.name });
        };
        reader.readAsDataURL(file);
    };

    const selectedItemData = board.items.find(i => i.id === selectedItem);

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        value={board.name}
                        onChange={(e) => setBoard(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-transparent text-xl font-bold text-white focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {/* Add Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowAddMenu(!showAddMenu)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white"
                        >
                            <Plus size={16} />
                            Add
                            <ChevronDown size={14} />
                        </button>
                        {showAddMenu && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden z-10">
                                <label className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer">
                                    <Image size={16} className="text-blue-400" />
                                    <span className="text-sm text-white">Upload Image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                                <button
                                    onClick={() => {
                                        const url = window.prompt('Enter image URL:');
                                        if (url) addItem('image', url);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5"
                                >
                                    <Link size={16} className="text-green-400" />
                                    <span className="text-sm text-white">Add URL</span>
                                </button>
                                <button
                                    onClick={() => addItem('text', 'Double-click to edit')}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5"
                                >
                                    <Type size={16} className="text-purple-400" />
                                    <span className="text-sm text-white">Add Text</span>
                                </button>
                                <button
                                    onClick={() => addItem('color', '#FFD700', { color: '#FFD700' })}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5"
                                >
                                    <Palette size={16} className="text-yellow-400" />
                                    <span className="text-sm text-white">Add Color</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* AI Generate */}
                    <button
                        onClick={generateFromPrompt}
                        disabled={generating}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg text-purple-400"
                    >
                        {generating ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Sparkles size={16} />
                        )}
                        AI Generate
                    </button>

                    {/* Zoom */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg">
                        <button
                            onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                            className="p-2 text-gray-400 hover:text-white"
                        >
                            <ZoomOut size={16} />
                        </button>
                        <span className="text-xs text-gray-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
                        <button
                            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                            className="p-2 text-gray-400 hover:text-white"
                        >
                            <ZoomIn size={16} />
                        </button>
                    </div>

                    {/* Save */}
                    <button
                        onClick={saveBoard}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg"
                    >
                        {saving ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        Save
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div
                ref={canvasRef}
                className="flex-1 overflow-auto relative"
                style={{ backgroundColor: board.background_color }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => setSelectedItem(null)}
            >
                <div
                    className="relative min-h-full min-w-full"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                >
                    {board.items.map((item) => (
                        <div
                            key={item.id}
                            className={`absolute cursor-move group ${
                                selectedItem === item.id ? 'ring-2 ring-yellow-500' : ''
                            }`}
                            style={{
                                left: item.x,
                                top: item.y,
                                width: item.width,
                                height: item.height,
                                zIndex: item.zIndex,
                                transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined
                            }}
                            onMouseDown={(e) => handleMouseDown(e, item.id)}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Content */}
                            {item.type === 'image' && (
                                <img
                                    src={item.content}
                                    alt=""
                                    className="w-full h-full object-cover rounded-lg"
                                    draggable={false}
                                />
                            )}
                            {item.type === 'text' && (
                                <div
                                    className="w-full h-full p-4 bg-white/10 rounded-lg"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => updateItem(item.id, { content: e.currentTarget.textContent || '' })}
                                >
                                    <p className="text-white">{item.content}</p>
                                </div>
                            )}
                            {item.type === 'color' && (
                                <div
                                    className="w-full h-full rounded-lg"
                                    style={{ backgroundColor: item.metadata?.color || item.content }}
                                />
                            )}

                            {/* Delete button */}
                            {selectedItem === item.id && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteItem(item.id);
                                    }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            )}

                            {/* Resize handle */}
                            {selectedItem === item.id && (
                                <div
                                    className="absolute bottom-0 right-0 w-4 h-4 bg-yellow-500 rounded-tl cursor-se-resize"
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        // Resize logic would go here
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Properties Panel */}
            {selectedItemData && (
                <div className="absolute right-4 top-20 w-64 bg-[#121212] border border-white/10 rounded-xl p-4 shadow-xl">
                    <h4 className="text-sm font-medium text-white mb-4">Properties</h4>
                    
                    {selectedItemData.type === 'color' && (
                        <div className="space-y-3">
                            <label className="block">
                                <span className="text-xs text-gray-400">Color</span>
                                <input
                                    type="color"
                                    value={selectedItemData.metadata?.color || selectedItemData.content}
                                    onChange={(e) => updateItem(selectedItemData.id, {
                                        content: e.target.value,
                                        metadata: { ...selectedItemData.metadata, color: e.target.value }
                                    })}
                                    className="w-full h-10 rounded cursor-pointer"
                                />
                            </label>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-3">
                        <label className="block">
                            <span className="text-xs text-gray-400">Width</span>
                            <input
                                type="number"
                                value={selectedItemData.width}
                                onChange={(e) => updateItem(selectedItemData.id, { width: Number(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white"
                            />
                        </label>
                        <label className="block">
                            <span className="text-xs text-gray-400">Height</span>
                            <input
                                type="number"
                                value={selectedItemData.height}
                                onChange={(e) => updateItem(selectedItemData.id, { height: Number(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white"
                            />
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}
