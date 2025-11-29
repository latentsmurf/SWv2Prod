'use client';

import React, { useState, useEffect } from 'react';
import {
    Link, Eye, AlertTriangle, Check, Clock, ChevronRight,
    Image, User, MapPin, Shirt, Package, Sun, Camera,
    Loader2, Plus, X, Edit, Trash2
} from 'lucide-react';

interface ContinuityItem {
    id: string;
    type: 'character' | 'prop' | 'location' | 'wardrobe' | 'lighting' | 'camera';
    name: string;
    description: string;
    reference_image?: string;
    scenes: string[];
    shots: string[];
    notes: ContinuityNote[];
    status: 'consistent' | 'warning' | 'issue';
}

interface ContinuityNote {
    id: string;
    scene_id: string;
    shot_id?: string;
    content: string;
    timestamp: string;
    resolved: boolean;
    user_name: string;
}

interface ContinuityTrackerProps {
    projectId: string;
}

const TYPE_CONFIG = {
    character: { label: 'Character', icon: User, color: 'text-purple-400' },
    prop: { label: 'Prop', icon: Package, color: 'text-orange-400' },
    location: { label: 'Location', icon: MapPin, color: 'text-blue-400' },
    wardrobe: { label: 'Wardrobe', icon: Shirt, color: 'text-pink-400' },
    lighting: { label: 'Lighting', icon: Sun, color: 'text-yellow-400' },
    camera: { label: 'Camera', icon: Camera, color: 'text-green-400' }
};

export default function ContinuityTracker({ projectId }: ContinuityTrackerProps) {
    const [items, setItems] = useState<ContinuityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<ContinuityItem | null>(null);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newNote, setNewNote] = useState('');

    // Fetch continuity items
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/continuity`);
                if (res.ok) {
                    setItems(await res.json());
                }
            } catch (error) {
                console.error('Error fetching continuity:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [projectId]);

    // Add note
    const addNote = async (itemId: string, sceneId: string) => {
        if (!newNote.trim()) return;

        try {
            const res = await fetch(`/api/projects/${projectId}/continuity/${itemId}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scene_id: sceneId,
                    content: newNote
                })
            });

            if (res.ok) {
                const note = await res.json();
                setItems(prev => prev.map(item =>
                    item.id === itemId
                        ? { ...item, notes: [...item.notes, note] }
                        : item
                ));
                setNewNote('');
            }
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    // Resolve note
    const resolveNote = async (itemId: string, noteId: string) => {
        try {
            const res = await fetch(
                `/api/projects/${projectId}/continuity/${itemId}/notes/${noteId}/resolve`,
                { method: 'POST' }
            );

            if (res.ok) {
                setItems(prev => prev.map(item =>
                    item.id === itemId
                        ? {
                            ...item,
                            notes: item.notes.map(note =>
                                note.id === noteId ? { ...note, resolved: true } : note
                            )
                        }
                        : item
                ));
            }
        } catch (error) {
            console.error('Error resolving note:', error);
        }
    };

    // Filter items
    const filteredItems = items.filter(item => {
        if (filterType !== 'all' && item.type !== filterType) return false;
        if (filterStatus !== 'all' && item.status !== filterStatus) return false;
        return true;
    });

    // Get status counts
    const statusCounts = {
        consistent: items.filter(i => i.status === 'consistent').length,
        warning: items.filter(i => i.status === 'warning').length,
        issue: items.filter(i => i.status === 'issue').length
    };

    return (
        <div className="h-full flex">
            {/* Sidebar - Items List */}
            <div className="w-80 border-r border-white/5 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-white/5">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <Link className="text-yellow-500" />
                        Continuity Tracker
                    </h2>

                    {/* Status Summary */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded text-xs text-green-400">
                            <Check size={12} />
                            {statusCounts.consistent}
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded text-xs text-yellow-400">
                            <AlertTriangle size={12} />
                            {statusCounts.warning}
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 rounded text-xs text-red-400">
                            <X size={12} />
                            {statusCounts.issue}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        >
                            <option value="all">All Types</option>
                            {Object.entries(TYPE_CONFIG).map(([type, config]) => (
                                <option key={type} value={type}>{config.label}</option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="consistent">Consistent</option>
                            <option value="warning">Warning</option>
                            <option value="issue">Issue</option>
                        </select>
                    </div>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="mx-auto animate-spin text-yellow-500" size={24} />
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="p-8 text-center">
                            <Link className="mx-auto text-gray-600 mb-2" size={32} />
                            <p className="text-sm text-gray-500">No continuity items</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {filteredItems.map((item) => {
                                const config = TYPE_CONFIG[item.type];
                                const Icon = config.icon;
                                const unresolvedNotes = item.notes.filter(n => !n.resolved).length;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className={`w-full text-left p-4 hover:bg-white/5 ${
                                            selectedItem?.id === item.id ? 'bg-white/5' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 bg-white/5 rounded-lg ${config.color}`}>
                                                <Icon size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-white font-medium truncate">{item.name}</p>
                                                    {item.status === 'issue' && (
                                                        <X size={14} className="text-red-400 flex-shrink-0" />
                                                    )}
                                                    {item.status === 'warning' && (
                                                        <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0" />
                                                    )}
                                                    {item.status === 'consistent' && (
                                                        <Check size={14} className="text-green-400 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {item.scenes.length} scenes • {item.shots.length} shots
                                                    {unresolvedNotes > 0 && (
                                                        <span className="text-yellow-400 ml-2">
                                                            {unresolvedNotes} note{unresolvedNotes !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-600" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Add Button */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-xl"
                    >
                        <Plus size={18} />
                        Track New Item
                    </button>
                </div>
            </div>

            {/* Detail Panel */}
            <div className="flex-1 overflow-y-auto">
                {selectedItem ? (
                    <div className="p-6">
                        {/* Item Header */}
                        <div className="flex items-start gap-4 mb-6">
                            {selectedItem.reference_image ? (
                                <img
                                    src={selectedItem.reference_image}
                                    alt={selectedItem.name}
                                    className="w-32 h-32 object-cover rounded-xl"
                                />
                            ) : (
                                <div className="w-32 h-32 bg-white/5 rounded-xl flex items-center justify-center">
                                    {React.createElement(TYPE_CONFIG[selectedItem.type].icon, {
                                        size: 48,
                                        className: 'text-gray-600'
                                    })}
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedItem.name}</h3>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        selectedItem.status === 'consistent'
                                            ? 'bg-green-500/10 text-green-400'
                                            : selectedItem.status === 'warning'
                                            ? 'bg-yellow-500/10 text-yellow-400'
                                            : 'bg-red-500/10 text-red-400'
                                    }`}>
                                        {selectedItem.status}
                                    </span>
                                </div>
                                <p className="text-gray-400 mb-4">{selectedItem.description}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>{selectedItem.scenes.length} scenes</span>
                                    <span>{selectedItem.shots.length} shots</span>
                                    <span>{selectedItem.notes.length} notes</span>
                                </div>
                            </div>
                        </div>

                        {/* Scene Timeline */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-400 mb-3">Appears in Scenes</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedItem.scenes.map((sceneId, index) => (
                                    <div
                                        key={sceneId}
                                        className="px-3 py-2 bg-white/5 rounded-lg text-sm text-white"
                                    >
                                        Scene {index + 1}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Continuity Notes */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-3">Continuity Notes</h4>
                            
                            {/* Add Note */}
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Add continuity note..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-gray-600"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && selectedItem.scenes[0]) {
                                            addNote(selectedItem.id, selectedItem.scenes[0]);
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => selectedItem.scenes[0] && addNote(selectedItem.id, selectedItem.scenes[0])}
                                    disabled={!newNote.trim()}
                                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                                >
                                    Add
                                </button>
                            </div>

                            {/* Notes List */}
                            <div className="space-y-2">
                                {selectedItem.notes.length === 0 ? (
                                    <p className="text-sm text-gray-600 text-center py-4">No notes yet</p>
                                ) : (
                                    selectedItem.notes.map((note) => (
                                        <div
                                            key={note.id}
                                            className={`p-4 rounded-xl ${
                                                note.resolved ? 'bg-white/5 opacity-50' : 'bg-yellow-500/10'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className={`text-sm ${note.resolved ? 'text-gray-400 line-through' : 'text-white'}`}>
                                                        {note.content}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {note.user_name} • {new Date(note.timestamp).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {!note.resolved && (
                                                    <button
                                                        onClick={() => resolveNote(selectedItem.id, note.id)}
                                                        className="flex items-center gap-1 px-3 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm rounded-lg"
                                                    >
                                                        <Check size={14} />
                                                        Resolve
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <Eye className="mx-auto mb-4" size={48} />
                            <p>Select an item to view details</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
