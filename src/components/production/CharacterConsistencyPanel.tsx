'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, Plus, Upload, Lock, Unlock, Eye, Edit2, Trash2,
    Check, X, Image, Camera, Palette, Shirt, Sparkles,
    AlertTriangle, ChevronDown, Search, Filter
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface CharacterReference {
    id: string;
    url: string;
    type: 'face' | 'full_body' | 'costume' | 'reference';
    is_primary: boolean;
    notes?: string;
}

interface CostumeChange {
    id: string;
    scene_id: string;
    costume_description: string;
    reference_image?: string;
}

interface Character {
    id: string;
    project_id: string;
    name: string;
    description?: string;
    age_range?: string;
    appearance_notes?: string;
    references: CharacterReference[];
    costume_changes: CostumeChange[];
    face_locked: boolean;
    consistency_prompt?: string;
    created_at: string;
}

interface CharacterConsistencyPanelProps {
    projectId: string;
    onCharacterSelect?: (character: Character) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CharacterConsistencyPanel({
    projectId,
    onCharacterSelect
}: CharacterConsistencyPanelProps) {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'references' | 'costumes' | 'settings'>('references');

    // Form state for new character
    const [newCharacter, setNewCharacter] = useState({
        name: '',
        description: '',
        age_range: '',
        appearance_notes: ''
    });

    // ========================================================================
    // DATA FETCHING
    // ========================================================================

    useEffect(() => {
        const fetchCharacters = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/projects/${projectId}/characters`);
                if (res.ok) {
                    setCharacters(await res.json());
                } else {
                    // Mock data for development
                    setCharacters(MOCK_CHARACTERS);
                }
            } catch (error) {
                console.error('Error fetching characters:', error);
                setCharacters(MOCK_CHARACTERS);
            } finally {
                setLoading(false);
            }
        };

        fetchCharacters();
    }, [projectId]);

    // ========================================================================
    // CHARACTER CRUD
    // ========================================================================

    const createCharacter = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/characters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newCharacter,
                    project_id: projectId,
                    references: [],
                    costume_changes: [],
                    face_locked: false
                })
            });

            if (res.ok) {
                const character = await res.json();
                setCharacters(prev => [...prev, character]);
                setSelectedCharacter(character);
            } else {
                // Fallback
                const character: Character = {
                    id: crypto.randomUUID(),
                    project_id: projectId,
                    ...newCharacter,
                    references: [],
                    costume_changes: [],
                    face_locked: false,
                    created_at: new Date().toISOString()
                };
                setCharacters(prev => [...prev, character]);
                setSelectedCharacter(character);
            }

            setShowAddModal(false);
            setNewCharacter({ name: '', description: '', age_range: '', appearance_notes: '' });
        } catch (error) {
            console.error('Error creating character:', error);
        }
    };

    const toggleFaceLock = async (character: Character) => {
        const updated = { ...character, face_locked: !character.face_locked };
        setCharacters(prev => prev.map(c => c.id === character.id ? updated : c));
        if (selectedCharacter?.id === character.id) {
            setSelectedCharacter(updated);
        }

        try {
            await fetch(`/api/projects/${projectId}/characters/${character.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ face_locked: !character.face_locked })
            });
        } catch (error) {
            console.error('Error updating character:', error);
        }
    };

    const deleteCharacter = async (characterId: string) => {
        if (!confirm('Delete this character? This will remove all references.')) return;

        setCharacters(prev => prev.filter(c => c.id !== characterId));
        if (selectedCharacter?.id === characterId) {
            setSelectedCharacter(null);
        }

        try {
            await fetch(`/api/projects/${projectId}/characters/${characterId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting character:', error);
        }
    };

    // ========================================================================
    // REFERENCE MANAGEMENT
    // ========================================================================

    const addReference = async (file: File, type: CharacterReference['type']) => {
        if (!selectedCharacter) return;

        // In production, upload to storage first
        const fakeUrl = URL.createObjectURL(file);
        
        const newRef: CharacterReference = {
            id: crypto.randomUUID(),
            url: fakeUrl,
            type,
            is_primary: selectedCharacter.references.length === 0
        };

        const updated = {
            ...selectedCharacter,
            references: [...selectedCharacter.references, newRef]
        };

        setSelectedCharacter(updated);
        setCharacters(prev => prev.map(c => c.id === selectedCharacter.id ? updated : c));
    };

    const setPrimaryReference = (refId: string) => {
        if (!selectedCharacter) return;

        const updated = {
            ...selectedCharacter,
            references: selectedCharacter.references.map(ref => ({
                ...ref,
                is_primary: ref.id === refId
            }))
        };

        setSelectedCharacter(updated);
        setCharacters(prev => prev.map(c => c.id === selectedCharacter.id ? updated : c));
    };

    const deleteReference = (refId: string) => {
        if (!selectedCharacter) return;

        const updated = {
            ...selectedCharacter,
            references: selectedCharacter.references.filter(ref => ref.id !== refId)
        };

        setSelectedCharacter(updated);
        setCharacters(prev => prev.map(c => c.id === selectedCharacter.id ? updated : c));
    };

    // ========================================================================
    // RENDER HELPERS
    // ========================================================================

    const filteredCharacters = characters.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (character: Character) => {
        setSelectedCharacter(character);
        onCharacterSelect?.(character);
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="h-full flex bg-[#0a0a0a]">
            {/* Character List Sidebar */}
            <div className="w-72 border-r border-white/5 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-white flex items-center gap-2">
                            <Users size={16} className="text-purple-400" />
                            Characters ({characters.length})
                        </h3>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="p-1.5 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-lg"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search characters..."
                            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Character List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {filteredCharacters.map(character => {
                        const isSelected = selectedCharacter?.id === character.id;
                        const primaryRef = character.references.find(r => r.is_primary);

                        return (
                            <button
                                key={character.id}
                                onClick={() => handleSelect(character)}
                                className={`
                                    w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all mb-1
                                    ${isSelected ? 'bg-purple-500/10 border border-purple-500/30' : 'hover:bg-white/5'}
                                `}
                            >
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {primaryRef ? (
                                        <img src={primaryRef.url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Users size={16} className="text-gray-500" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-white font-medium truncate">{character.name}</span>
                                        {character.face_locked && (
                                            <Lock size={10} className="text-green-400" />
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {character.references.length} refs • {character.costume_changes.length} costumes
                                    </span>
                                </div>
                            </button>
                        );
                    })}

                    {filteredCharacters.length === 0 && (
                        <div className="text-center py-8">
                            <Users className="mx-auto text-gray-600 mb-2" size={24} />
                            <p className="text-sm text-gray-500">No characters found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Character Detail Panel */}
            {selectedCharacter ? (
                <div className="flex-1 flex flex-col">
                    {/* Character Header */}
                    <div className="p-6 border-b border-white/5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                                    {selectedCharacter.references.find(r => r.is_primary)?.url ? (
                                        <img 
                                            src={selectedCharacter.references.find(r => r.is_primary)?.url} 
                                            alt="" 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <Users size={24} className="text-gray-500" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedCharacter.name}</h2>
                                    <p className="text-sm text-gray-500">
                                        {selectedCharacter.age_range && `${selectedCharacter.age_range} • `}
                                        {selectedCharacter.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Face Lock Toggle */}
                                <button
                                    onClick={() => toggleFaceLock(selectedCharacter)}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${selectedCharacter.face_locked 
                                            ? 'bg-green-500/10 text-green-400' 
                                            : 'bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white'}
                                    `}
                                >
                                    {selectedCharacter.face_locked ? (
                                        <>
                                            <Lock size={14} />
                                            Face Locked
                                        </>
                                    ) : (
                                        <>
                                            <Unlock size={14} />
                                            Lock Face
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => deleteCharacter(selectedCharacter.id)}
                                    className="p-2 text-gray-500 hover:text-red-400"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-2 mt-6">
                            {[
                                { key: 'references', label: 'References', icon: Image },
                                { key: 'costumes', label: 'Costumes', icon: Shirt },
                                { key: 'settings', label: 'Settings', icon: Sparkles }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${activeTab === tab.key 
                                            ? 'bg-white text-black' 
                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}
                                    `}
                                >
                                    <tab.icon size={14} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'references' && (
                            <div className="space-y-6">
                                {/* Upload Area */}
                                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="reference-upload"
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) addReference(file, 'face');
                                        }}
                                    />
                                    <label htmlFor="reference-upload" className="cursor-pointer">
                                        <Upload size={32} className="mx-auto text-gray-600 mb-3" />
                                        <p className="text-sm text-gray-400">
                                            Drop reference images or <span className="text-purple-400">browse</span>
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Face shots work best for consistency
                                        </p>
                                    </label>
                                </div>

                                {/* Reference Grid */}
                                <div className="grid grid-cols-4 gap-4">
                                    {selectedCharacter.references.map(ref => (
                                        <div
                                            key={ref.id}
                                            className={`
                                                relative group rounded-xl overflow-hidden border-2
                                                ${ref.is_primary ? 'border-purple-500' : 'border-transparent'}
                                            `}
                                        >
                                            <img src={ref.url} alt="" className="w-full aspect-square object-cover" />
                                            
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {!ref.is_primary && (
                                                    <button
                                                        onClick={() => setPrimaryReference(ref.id)}
                                                        className="p-2 bg-purple-500 text-white rounded-lg"
                                                        title="Set as primary"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteReference(ref.id)}
                                                    className="p-2 bg-red-500 text-white rounded-lg"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            {/* Type Badge */}
                                            <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-xs text-white rounded">
                                                {ref.type}
                                            </span>

                                            {/* Primary Badge */}
                                            {ref.is_primary && (
                                                <span className="absolute top-2 right-2 px-2 py-0.5 bg-purple-500 text-xs text-white rounded">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {selectedCharacter.references.length === 0 && (
                                    <p className="text-center text-sm text-gray-500 py-8">
                                        No references yet. Upload images to maintain consistency.
                                    </p>
                                )}
                            </div>
                        )}

                        {activeTab === 'costumes' && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500">
                                    Track costume changes across scenes to maintain continuity.
                                </p>
                                {/* Costume list would go here */}
                                <div className="text-center py-8">
                                    <Shirt className="mx-auto text-gray-600 mb-2" size={24} />
                                    <p className="text-sm text-gray-500">No costume changes tracked</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Consistency Prompt
                                    </label>
                                    <textarea
                                        value={selectedCharacter.consistency_prompt || ''}
                                        onChange={e => {
                                            const updated = { ...selectedCharacter, consistency_prompt: e.target.value };
                                            setSelectedCharacter(updated);
                                            setCharacters(prev => prev.map(c => c.id === selectedCharacter.id ? updated : c));
                                        }}
                                        placeholder="Add keywords that will be appended to every shot featuring this character..."
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                                    />
                                    <p className="text-xs text-gray-600 mt-2">
                                        Example: "30 year old woman, brown hair, green eyes, defined cheekbones"
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Appearance Notes
                                    </label>
                                    <textarea
                                        value={selectedCharacter.appearance_notes || ''}
                                        onChange={e => {
                                            const updated = { ...selectedCharacter, appearance_notes: e.target.value };
                                            setSelectedCharacter(updated);
                                            setCharacters(prev => prev.map(c => c.id === selectedCharacter.id ? updated : c));
                                        }}
                                        placeholder="Detailed appearance notes for reference..."
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Users className="mx-auto text-gray-600 mb-4" size={48} />
                        <h3 className="text-lg font-semibold text-white mb-2">Select a Character</h3>
                        <p className="text-sm text-gray-500 max-w-sm">
                            Choose a character from the list to manage their references and consistency settings.
                        </p>
                    </div>
                </div>
            )}

            {/* Add Character Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Character</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newCharacter.name}
                                    onChange={e => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Character name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Age Range</label>
                                <input
                                    type="text"
                                    value={newCharacter.age_range}
                                    onChange={e => setNewCharacter(prev => ({ ...prev, age_range: e.target.value }))}
                                    placeholder="e.g., Late 20s, Early 30s"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea
                                    value={newCharacter.description}
                                    onChange={e => setNewCharacter(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Brief character description..."
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={createCharacter}
                                disabled={!newCharacter.name}
                                className="px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl disabled:opacity-50"
                            >
                                Add Character
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_CHARACTERS: Character[] = [
    {
        id: '1',
        project_id: '1',
        name: 'Emma Chen',
        description: 'Ambitious young executive',
        age_range: 'Late 20s',
        appearance_notes: 'Sleek professional look, always well-dressed',
        references: [],
        costume_changes: [],
        face_locked: true,
        consistency_prompt: 'young asian woman, professional attire, confident expression',
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        project_id: '1',
        name: 'Marcus Stone',
        description: 'Mysterious CEO',
        age_range: 'Mid 30s',
        appearance_notes: 'Tall, commanding presence, designer suits',
        references: [],
        costume_changes: [],
        face_locked: false,
        created_at: new Date().toISOString()
    }
];
