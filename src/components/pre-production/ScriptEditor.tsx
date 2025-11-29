'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    FileText, Save, Download, Upload, Undo, Redo, Bold, Italic,
    AlignLeft, Users, MapPin, Clock, Settings, Eye, Edit3,
    ChevronDown, Plus, Trash2, Search, BookOpen, Film, Loader2
} from 'lucide-react';

interface ScriptElement {
    id: string;
    type: 'scene_heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition' | 'shot' | 'note';
    content: string;
    sceneNumber?: number;
}

interface ScriptEditorProps {
    projectId: string;
    initialContent?: string;
    onSave?: (content: string) => void;
}

const ELEMENT_STYLES = {
    scene_heading: 'font-bold uppercase text-yellow-400',
    action: 'text-gray-300',
    character: 'uppercase text-center text-blue-400 ml-[40%]',
    dialogue: 'text-center text-gray-200 mx-[25%]',
    parenthetical: 'text-center text-gray-500 italic mx-[30%]',
    transition: 'uppercase text-right text-purple-400',
    shot: 'uppercase text-green-400',
    note: 'bg-yellow-500/10 text-yellow-400 italic px-2 rounded'
};

const ELEMENT_LABELS = {
    scene_heading: 'Scene Heading',
    action: 'Action',
    character: 'Character',
    dialogue: 'Dialogue',
    parenthetical: 'Parenthetical',
    transition: 'Transition',
    shot: 'Shot',
    note: 'Note'
};

export default function ScriptEditor({ projectId, initialContent, onSave }: ScriptEditorProps) {
    const [elements, setElements] = useState<ScriptElement[]>([]);
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [title, setTitle] = useState('Untitled Script');
    const [saving, setSaving] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    // Parse Fountain format
    const parseFountain = useCallback((content: string): ScriptElement[] => {
        const lines = content.split('\n');
        const parsed: ScriptElement[] = [];
        let sceneCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            let type: ScriptElement['type'] = 'action';
            let processedContent = line;

            // Scene heading
            if (/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i.test(line) || line.startsWith('.')) {
                type = 'scene_heading';
                sceneCount++;
                processedContent = line.startsWith('.') ? line.slice(1) : line;
            }
            // Transition
            else if (/^(FADE IN:|FADE OUT\.|FADE TO:|CUT TO:|DISSOLVE TO:|SMASH CUT:|TIME CUT:)$/i.test(line) || line.startsWith('>')) {
                type = 'transition';
                processedContent = line.startsWith('>') ? line.slice(1).trim() : line;
            }
            // Character (all caps, not a scene heading)
            else if (/^[A-Z][A-Z\s\d\.\(\)]+$/.test(line) && line.length < 40 && !line.includes(':')) {
                type = 'character';
            }
            // Parenthetical
            else if (line.startsWith('(') && line.endsWith(')')) {
                type = 'parenthetical';
            }
            // Dialogue (follows character or parenthetical)
            else if (parsed.length > 0 && (parsed[parsed.length - 1].type === 'character' || parsed[parsed.length - 1].type === 'parenthetical')) {
                type = 'dialogue';
            }
            // Note
            else if (line.startsWith('[[') && line.endsWith(']]')) {
                type = 'note';
                processedContent = line.slice(2, -2);
            }
            // Shot
            else if (/^(ANGLE ON|CLOSE ON|INSERT|POV|WIDE|MEDIUM|CLOSE-UP)/i.test(line)) {
                type = 'shot';
            }

            parsed.push({
                id: crypto.randomUUID(),
                type,
                content: processedContent,
                sceneNumber: type === 'scene_heading' ? sceneCount : undefined
            });
        }

        return parsed;
    }, []);

    // Convert elements back to Fountain
    const toFountain = useCallback((): string => {
        return elements.map(el => {
            switch (el.type) {
                case 'scene_heading':
                    return `\n${el.content}\n`;
                case 'transition':
                    return `\n${el.content}\n`;
                case 'character':
                    return `\n${el.content}`;
                case 'dialogue':
                    return el.content;
                case 'parenthetical':
                    return `(${el.content.replace(/^\(|\)$/g, '')})`;
                case 'note':
                    return `[[${el.content}]]`;
                default:
                    return `\n${el.content}`;
            }
        }).join('\n');
    }, [elements]);

    // Initialize with content
    useEffect(() => {
        if (initialContent) {
            setElements(parseFountain(initialContent));
        } else {
            // Default starting elements
            setElements([
                { id: crypto.randomUUID(), type: 'scene_heading', content: 'INT. LOCATION - DAY', sceneNumber: 1 },
                { id: crypto.randomUUID(), type: 'action', content: 'Description of the scene.' }
            ]);
        }
    }, [initialContent, parseFountain]);

    // Add new element
    const addElement = (type: ScriptElement['type'], afterId?: string) => {
        const newElement: ScriptElement = {
            id: crypto.randomUUID(),
            type,
            content: type === 'scene_heading' ? 'INT. LOCATION - DAY' : '',
            sceneNumber: type === 'scene_heading' ? elements.filter(e => e.type === 'scene_heading').length + 1 : undefined
        };

        if (afterId) {
            const index = elements.findIndex(e => e.id === afterId);
            setElements([...elements.slice(0, index + 1), newElement, ...elements.slice(index + 1)]);
        } else {
            setElements([...elements, newElement]);
        }
        setSelectedElement(newElement.id);
    };

    // Update element
    const updateElement = (id: string, updates: Partial<ScriptElement>) => {
        setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    // Delete element
    const deleteElement = (id: string) => {
        setElements(elements.filter(el => el.id !== id));
        setSelectedElement(null);
    };

    // Change element type
    const changeElementType = (id: string, newType: ScriptElement['type']) => {
        updateElement(id, { 
            type: newType,
            sceneNumber: newType === 'scene_heading' ? elements.filter(e => e.type === 'scene_heading').length + 1 : undefined
        });
    };

    // Save script
    const saveScript = async () => {
        setSaving(true);
        const content = toFountain();
        
        try {
            await fetch(`/api/projects/${projectId}/script`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
            onSave?.(content);
        } catch (error) {
            console.error('Error saving script:', error);
        } finally {
            setSaving(false);
        }
    };

    // Export as Fountain
    const exportFountain = () => {
        const content = toFountain();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_')}.fountain`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Export as PDF (simplified - would need proper formatting)
    const exportPDF = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/script/export-pdf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content: toFountain() })
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title.replace(/\s+/g, '_')}.pdf`;
                a.click();
            }
        } catch (error) {
            console.error('Error exporting PDF:', error);
        }
    };

    // Stats
    const stats = {
        scenes: elements.filter(e => e.type === 'scene_heading').length,
        characters: new Set(elements.filter(e => e.type === 'character').map(e => e.content)).size,
        pages: Math.ceil(elements.length / 55), // Rough estimate
        words: elements.reduce((sum, e) => sum + e.content.split(/\s+/).length, 0)
    };

    // Filter elements by search
    const filteredElements = searchQuery
        ? elements.filter(e => e.content.toLowerCase().includes(searchQuery.toLowerCase()))
        : elements;

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#121212]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <FileText className="text-yellow-500" size={24} />
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-transparent text-xl font-bold text-white border-none focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-1 ml-4">
                        <button
                            onClick={() => setViewMode('edit')}
                            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'edit' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Edit3 size={16} className="inline mr-1" />
                            Edit
                        </button>
                        <button
                            onClick={() => setViewMode('preview')}
                            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'preview' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Eye size={16} className="inline mr-1" />
                            Preview
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                    >
                        <Search size={18} />
                    </button>
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                    >
                        <BookOpen size={18} />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <button
                        onClick={exportFountain}
                        className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                    >
                        <Download size={16} className="inline mr-1" />
                        .fountain
                    </button>
                    <button
                        onClick={exportPDF}
                        className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                    >
                        <Download size={16} className="inline mr-1" />
                        PDF
                    </button>
                    <button
                        onClick={saveScript}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            {showSearch && (
                <div className="p-4 border-b border-white/5 bg-[#121212]">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search script..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white"
                            autoFocus
                        />
                    </div>
                </div>
            )}

            {/* Stats Panel */}
            {showStats && (
                <div className="p-4 border-b border-white/5 bg-[#121212]">
                    <div className="flex items-center gap-8">
                        <div>
                            <p className="text-sm text-gray-500">Scenes</p>
                            <p className="text-xl font-bold text-white">{stats.scenes}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Characters</p>
                            <p className="text-xl font-bold text-white">{stats.characters}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Est. Pages</p>
                            <p className="text-xl font-bold text-white">{stats.pages}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Words</p>
                            <p className="text-xl font-bold text-white">{stats.words.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden">
                {/* Element Type Palette (Edit Mode) */}
                {viewMode === 'edit' && (
                    <div className="w-48 border-r border-white/5 p-4 bg-[#121212]">
                        <p className="text-sm text-gray-500 mb-3">Add Element</p>
                        <div className="space-y-1">
                            {Object.entries(ELEMENT_LABELS).map(([type, label]) => (
                                <button
                                    key={type}
                                    onClick={() => addElement(type as ScriptElement['type'], selectedElement || undefined)}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Script Content */}
                <div className="flex-1 overflow-y-auto" ref={editorRef}>
                    <div className={`max-w-3xl mx-auto p-8 ${viewMode === 'preview' ? 'font-mono' : ''}`}>
                        {filteredElements.map((element, index) => (
                            <div
                                key={element.id}
                                className={`relative group ${selectedElement === element.id ? 'ring-2 ring-yellow-500/50 rounded' : ''}`}
                                onClick={() => viewMode === 'edit' && setSelectedElement(element.id)}
                            >
                                {/* Scene Number */}
                                {element.type === 'scene_heading' && element.sceneNumber && (
                                    <span className="absolute -left-12 top-0 text-sm text-gray-600">
                                        {element.sceneNumber}
                                    </span>
                                )}

                                {viewMode === 'edit' ? (
                                    <div className="flex items-start gap-2">
                                        {/* Type Selector */}
                                        <select
                                            value={element.type}
                                            onChange={(e) => changeElementType(element.id, e.target.value as ScriptElement['type'])}
                                            className="opacity-0 group-hover:opacity-100 text-xs bg-white/5 border border-white/10 rounded px-1 py-0.5 text-gray-400"
                                        >
                                            {Object.entries(ELEMENT_LABELS).map(([type, label]) => (
                                                <option key={type} value={type}>{label}</option>
                                            ))}
                                        </select>

                                        {/* Content Input */}
                                        <textarea
                                            value={element.content}
                                            onChange={(e) => updateElement(element.id, { content: e.target.value })}
                                            className={`flex-1 bg-transparent border-none resize-none focus:outline-none focus:ring-1 focus:ring-yellow-500/30 rounded px-2 py-1 ${ELEMENT_STYLES[element.type]}`}
                                            rows={Math.max(1, Math.ceil(element.content.length / 60))}
                                            placeholder={`Enter ${ELEMENT_LABELS[element.type].toLowerCase()}...`}
                                        />

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <p className={`py-1 ${ELEMENT_STYLES[element.type]}`}>
                                        {element.content}
                                    </p>
                                )}
                            </div>
                        ))}

                        {/* Add Button at End */}
                        {viewMode === 'edit' && (
                            <button
                                onClick={() => addElement('action')}
                                className="w-full mt-4 py-3 border-2 border-dashed border-white/10 hover:border-white/30 rounded-xl text-gray-500 hover:text-white transition-colors"
                            >
                                <Plus size={20} className="inline mr-2" />
                                Add Element
                            </button>
                        )}
                    </div>
                </div>

                {/* Scene Navigator */}
                <div className="w-64 border-l border-white/5 p-4 bg-[#121212] overflow-y-auto">
                    <p className="text-sm text-gray-500 mb-3">Scenes</p>
                    <div className="space-y-1">
                        {elements.filter(e => e.type === 'scene_heading').map((scene) => (
                            <button
                                key={scene.id}
                                onClick={() => {
                                    setSelectedElement(scene.id);
                                    document.getElementById(scene.id)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg ${
                                    selectedElement === scene.id
                                        ? 'bg-yellow-500/10 text-yellow-400'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span className="text-gray-600 mr-2">{scene.sceneNumber}.</span>
                                {scene.content.length > 30 ? scene.content.slice(0, 30) + '...' : scene.content}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
