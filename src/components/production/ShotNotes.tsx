'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare, Plus, Trash2, Edit2, Check, X, Pin,
    Clock, User, Tag, Loader2, ChevronDown, Send
} from 'lucide-react';

interface ShotNote {
    id: string;
    shot_id: string;
    content: string;
    type: 'note' | 'direction' | 'vfx' | 'audio' | 'continuity';
    user_id: string;
    user_name: string;
    is_pinned: boolean;
    is_resolved: boolean;
    created_at: string;
    updated_at?: string;
}

interface ShotNotesProps {
    shotId: string;
    projectId: string;
    compact?: boolean;
}

const NOTE_TYPES = [
    { id: 'note', label: 'General Note', color: 'text-gray-400 bg-gray-500/10' },
    { id: 'direction', label: 'Direction', color: 'text-blue-400 bg-blue-500/10' },
    { id: 'vfx', label: 'VFX Note', color: 'text-purple-400 bg-purple-500/10' },
    { id: 'audio', label: 'Audio Note', color: 'text-green-400 bg-green-500/10' },
    { id: 'continuity', label: 'Continuity', color: 'text-orange-400 bg-orange-500/10' },
];

export default function ShotNotes({ shotId, projectId, compact = false }: ShotNotesProps) {
    const [notes, setNotes] = useState<ShotNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState('');
    const [noteType, setNoteType] = useState<string>('note');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [showTypeSelect, setShowTypeSelect] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Fetch notes
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/shots/${shotId}/notes`);
                if (res.ok) {
                    setNotes(await res.json());
                }
            } catch (error) {
                console.error('Error fetching notes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, [shotId, projectId]);

    // Add note
    const addNote = async () => {
        if (!newNote.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/shots/${shotId}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newNote,
                    type: noteType
                })
            });

            if (res.ok) {
                const note = await res.json();
                setNotes(prev => [note, ...prev]);
                setNewNote('');
            }
        } catch (error) {
            console.error('Error adding note:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Update note
    const updateNote = async (noteId: string) => {
        if (!editContent.trim()) return;

        try {
            const res = await fetch(`/api/projects/${projectId}/shots/${shotId}/notes/${noteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editContent })
            });

            if (res.ok) {
                const updated = await res.json();
                setNotes(prev => prev.map(n => n.id === noteId ? updated : n));
                setEditingId(null);
            }
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    // Delete note
    const deleteNote = async (noteId: string) => {
        try {
            await fetch(`/api/projects/${projectId}/shots/${shotId}/notes/${noteId}`, {
                method: 'DELETE'
            });
            setNotes(prev => prev.filter(n => n.id !== noteId));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    // Toggle pin
    const togglePin = async (noteId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/shots/${shotId}/notes/${noteId}/pin`, {
                method: 'POST'
            });
            if (res.ok) {
                const updated = await res.json();
                setNotes(prev => prev.map(n => n.id === noteId ? updated : n));
            }
        } catch (error) {
            console.error('Error toggling pin:', error);
        }
    };

    // Toggle resolved
    const toggleResolved = async (noteId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/shots/${shotId}/notes/${noteId}/resolve`, {
                method: 'POST'
            });
            if (res.ok) {
                const updated = await res.json();
                setNotes(prev => prev.map(n => n.id === noteId ? updated : n));
            }
        } catch (error) {
            console.error('Error toggling resolved:', error);
        }
    };

    // Format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Sort notes: pinned first, then by date
    const sortedNotes = [...notes].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const getTypeConfig = (type: string) => {
        return NOTE_TYPES.find(t => t.id === type) || NOTE_TYPES[0];
    };

    if (compact) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MessageSquare size={12} />
                        {notes.length} notes
                    </span>
                </div>
                {sortedNotes.slice(0, 2).map((note) => (
                    <div
                        key={note.id}
                        className="p-2 bg-white/5 rounded-lg text-xs text-gray-400"
                    >
                        <p className="truncate">{note.content}</p>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-4 border-b border-white/5">
                <h3 className="font-medium text-white flex items-center gap-2">
                    <MessageSquare className="text-yellow-500" size={18} />
                    Shot Notes
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                    {notes.length} note{notes.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Add Note */}
            <div className="p-4 border-b border-white/5">
                <div className="relative">
                    <textarea
                        ref={inputRef}
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note..."
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 resize-none focus:border-yellow-500 focus:outline-none"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.metaKey) {
                                addNote();
                            }
                        }}
                    />
                </div>
                <div className="flex items-center justify-between mt-2">
                    {/* Type selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowTypeSelect(!showTypeSelect)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${getTypeConfig(noteType).color}`}
                        >
                            <Tag size={12} />
                            {getTypeConfig(noteType).label}
                            <ChevronDown size={12} />
                        </button>
                        {showTypeSelect && (
                            <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden z-10 w-40">
                                {NOTE_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            setNoteType(type.id);
                                            setShowTypeSelect(false);
                                        }}
                                        className={`w-full px-3 py-2 text-left text-xs hover:bg-white/5 ${type.color}`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={addNote}
                        disabled={!newNote.trim() || submitting}
                        className="flex items-center gap-2 px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg text-sm disabled:opacity-50"
                    >
                        {submitting ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Send size={14} />
                        )}
                        Add Note
                    </button>
                </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="animate-spin text-yellow-500" size={24} />
                    </div>
                ) : sortedNotes.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="mx-auto text-gray-600 mb-2" size={32} />
                        <p className="text-sm text-gray-500">No notes yet</p>
                    </div>
                ) : (
                    sortedNotes.map((note) => {
                        const typeConfig = getTypeConfig(note.type);
                        const isEditing = editingId === note.id;

                        return (
                            <div
                                key={note.id}
                                className={`p-4 rounded-xl border transition-all ${
                                    note.is_pinned
                                        ? 'bg-yellow-500/5 border-yellow-500/20'
                                        : note.is_resolved
                                        ? 'bg-white/5 border-white/5 opacity-60'
                                        : 'bg-[#121212] border-white/5'
                                }`}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs ${typeConfig.color}`}>
                                            {typeConfig.label}
                                        </span>
                                        {note.is_pinned && (
                                            <Pin size={12} className="text-yellow-500" />
                                        )}
                                        {note.is_resolved && (
                                            <Check size={12} className="text-green-400" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => togglePin(note.id)}
                                            className={`p-1.5 rounded hover:bg-white/5 ${
                                                note.is_pinned ? 'text-yellow-500' : 'text-gray-500'
                                            }`}
                                        >
                                            <Pin size={14} />
                                        </button>
                                        <button
                                            onClick={() => toggleResolved(note.id)}
                                            className={`p-1.5 rounded hover:bg-white/5 ${
                                                note.is_resolved ? 'text-green-400' : 'text-gray-500'
                                            }`}
                                        >
                                            <Check size={14} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(note.id);
                                                setEditContent(note.content);
                                            }}
                                            className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => deleteNote(note.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                {isEditing ? (
                                    <div>
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white resize-none"
                                            rows={3}
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-3 py-1 text-gray-400 hover:text-white text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => updateNote(note.id)}
                                                className="px-3 py-1 bg-yellow-500 text-black rounded text-sm font-medium"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className={`text-sm ${note.is_resolved ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                                        {note.content}
                                    </p>
                                )}

                                {/* Footer */}
                                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <User size={12} />
                                        {note.user_name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {formatTime(note.created_at)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
