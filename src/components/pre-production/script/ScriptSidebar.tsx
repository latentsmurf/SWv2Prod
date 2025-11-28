import React, { useEffect, useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { MapPin, User, LayoutList, Clapperboard, Loader2, RefreshCw, Users, Check, ArrowRight, Sparkles } from 'lucide-react';
import { Scene } from '@/types';

interface DetectedScene {
    pos: number;
    text: string;  // slug_line
    content: string;
    characters: string[];
    synced: boolean;
    sceneId?: string;
}

interface ScriptSidebarProps {
    editor: Editor | null;
    projectId: string | null;
    onScenesSync?: (scenes: Scene[]) => void;
}

export default function ScriptSidebar({ editor, projectId, onScenesSync }: ScriptSidebarProps) {
    const [activeContext, setActiveContext] = useState<{ type: 'location' | 'character' | null, name: string }>({ type: null, name: '' });
    const [scenes, setScenes] = useState<DetectedScene[]>([]);
    const [syncedScenes, setSyncedScenes] = useState<Scene[]>([]);
    const [generatingSceneIndex, setGeneratingSceneIndex] = useState<number | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'synced' | 'outdated'>('idle');

    // Extract characters from scene content
    const extractCharacters = useCallback((content: string): string[] => {
        const characters: Set<string> = new Set();
        const lines = content.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            // Character names are typically in ALL CAPS, alone on a line
            // They may have (V.O.), (O.S.), (CONT'D) etc.
            if (trimmed && trimmed === trimmed.toUpperCase() && trimmed.length > 1 && trimmed.length < 40) {
                // Remove parentheticals
                const name = trimmed.replace(/\s*\(.*?\)\s*/g, '').trim();
                // Skip common non-character headings
                if (name && !['INT', 'EXT', 'INT/EXT', 'CUT TO', 'FADE IN', 'FADE OUT', 'DISSOLVE TO', 'CONTINUED', 'THE END'].includes(name)) {
                    // Check if it looks like a character name (not a scene heading)
                    if (!name.includes('.') && !name.includes('-')) {
                        characters.add(name);
                    }
                }
            }
        }
        
        return Array.from(characters);
    }, []);

    // Fetch synced scenes from backend
    const fetchSyncedScenes = useCallback(async () => {
        if (!projectId) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/scenes`);
            if (res.ok) {
                const data = await res.json();
                setSyncedScenes(data);
            }
        } catch (e) {
            console.error('Error fetching scenes:', e);
        }
    }, [projectId]);

    useEffect(() => {
        fetchSyncedScenes();
    }, [fetchSyncedScenes]);

    useEffect(() => {
        if (!editor) return;

        const updateState = () => {
            // 1. Update Context
            const { selection } = editor.state;
            const parent = editor.state.doc.resolve(selection.from).parent;

            if (parent.type.name === 'sceneHeading') {
                setActiveContext({ type: 'location', name: parent.textContent });
            } else if (parent.type.name === 'character') {
                setActiveContext({ type: 'character', name: parent.textContent });
            } else {
                setActiveContext({ type: null, name: '' });
            }

            // 2. Update Scene List with character detection
            const newScenes: DetectedScene[] = [];
            editor.state.doc.descendants((node, pos) => {
                if (node.type.name === 'sceneHeading') {
                    newScenes.push({ 
                        pos, 
                        text: node.textContent, 
                        content: "",
                        characters: [],
                        synced: false
                    });
                }
            });

            // Populate content and extract characters
            for (let i = 0; i < newScenes.length; i++) {
                const start = newScenes[i].pos;
                const end = i < newScenes.length - 1 ? newScenes[i + 1].pos : editor.state.doc.content.size;
                newScenes[i].content = editor.state.doc.textBetween(start, end);
                newScenes[i].characters = extractCharacters(newScenes[i].content);
                
                // Check if this scene is synced
                const matchingScene = syncedScenes.find(s => 
                    s.slug_line === newScenes[i].text || 
                    s.script_text?.startsWith(newScenes[i].content.slice(0, 100))
                );
                if (matchingScene) {
                    newScenes[i].synced = true;
                    newScenes[i].sceneId = matchingScene.id;
                }
            }

            setScenes(newScenes);
            
            // Update sync status
            const allSynced = newScenes.length > 0 && newScenes.every(s => s.synced);
            const noneSynced = newScenes.every(s => !s.synced);
            setSyncStatus(allSynced ? 'synced' : noneSynced ? 'idle' : 'outdated');
        };

        editor.on('selectionUpdate', updateState);
        editor.on('update', updateState);
        
        // Initial update
        updateState();

        return () => {
            editor.off('selectionUpdate', updateState);
            editor.off('update', updateState);
        };
    }, [editor, syncedScenes, extractCharacters]);

    const scrollToScene = (pos: number) => {
        if (editor) {
            editor.commands.setTextSelection(pos);
            editor.commands.scrollIntoView();
        }
    };

    // Sync all scenes to backend
    const handleSyncScenes = async () => {
        if (!projectId) {
            alert("Please save the project first.");
            return;
        }
        
        setIsSyncing(true);
        try {
            const newSyncedScenes: Scene[] = [];
            
            for (let i = 0; i < scenes.length; i++) {
                const scene = scenes[i];
                
                // Create or update scene
                const sceneData = {
                    slug_line: scene.text,
                    script_text: scene.content,
                    order_index: i,
                    characters: scene.characters,
                    coverage_preset: 'standard',
                    style_mode: 'storyboard'
                };
                
                let response;
                if (scene.synced && scene.sceneId) {
                    // Update existing scene
                    response = await fetch(`/api/projects/${projectId}/scenes/${scene.sceneId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(sceneData)
                    });
                } else {
                    // Create new scene
                    response = await fetch(`/api/projects/${projectId}/scenes`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(sceneData)
                    });
                }
                
                if (response.ok) {
                    const savedScene = await response.json();
                    newSyncedScenes.push(savedScene);
                }
            }
            
            setSyncedScenes(newSyncedScenes);
            setSyncStatus('synced');
            onScenesSync?.(newSyncedScenes);
            
        } catch (e) {
            console.error("Error syncing scenes:", e);
            alert("Error syncing scenes");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleGenerateShots = async (index: number, sceneText: string) => {
        if (!projectId) {
            alert("Please save the project first.");
            return;
        }
        
        const scene = scenes[index];
        
        // First sync this scene if not synced
        if (!scene.synced) {
            setIsSyncing(true);
            try {
                const response = await fetch(`/api/projects/${projectId}/scenes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        slug_line: scene.text,
                        script_text: scene.content,
                        order_index: index,
                        characters: scene.characters,
                        coverage_preset: 'standard',
                        style_mode: 'storyboard'
                    })
                });
                
                if (response.ok) {
                    const savedScene = await response.json();
                    scene.sceneId = savedScene.id;
                    scene.synced = true;
                }
            } catch (e) {
                console.error("Error creating scene:", e);
            } finally {
                setIsSyncing(false);
            }
        }
        
        if (!scene.sceneId) {
            alert("Failed to create scene. Please try again.");
            return;
        }
        
        setGeneratingSceneIndex(index);
        try {
            const response = await fetch(`/api/projects/${projectId}/scenes/${scene.sceneId}/breakdown`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scene_text: sceneText,
                    coverage_preset: 'standard',
                    linked_cast_ids: [],
                    style_mode: 'storyboard'
                })
            });
            const data = await response.json();
            if (data.status === 'success') {
                alert(`Generated ${data.shot_count} shots for this scene! Go to Production to view.`);
            } else {
                alert("Failed to generate shots: " + (data.detail || data.error));
            }
        } catch (e) {
            console.error("Error generating shots:", e);
            alert("Error generating shots");
        }
        setGeneratingSceneIndex(null);
    };

    // Get unique characters across all scenes
    const allCharacters = Array.from(new Set(scenes.flatMap(s => s.characters)));

    return (
        <div className="w-80 border-l border-white/5 bg-black/20 backdrop-blur-md flex flex-col h-full">
            {/* Context Panel */}
            <div className="p-6 border-b border-white/5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Context</h3>

                {activeContext.type === 'location' && (
                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-blue-400">
                            <MapPin size={16} />
                            <span className="font-bold text-sm">Location Detected</span>
                        </div>
                        <p className="text-white font-medium">{activeContext.name || "Unnamed Location"}</p>
                        <button className="mt-3 w-full py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded transition-colors">
                            Generate Location Asset
                        </button>
                    </div>
                )}

                {activeContext.type === 'character' && (
                    <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-purple-400">
                            <User size={16} />
                            <span className="font-bold text-sm">Character Detected</span>
                        </div>
                        <p className="text-white font-medium">{activeContext.name || "Unnamed Character"}</p>
                        <button className="mt-3 w-full py-1.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded transition-colors">
                            Cast Actor
                        </button>
                    </div>
                )}

                {!activeContext.type && (
                    <div className="text-gray-600 text-sm italic text-center py-4">
                        Select a Scene Heading or Character to see context.
                    </div>
                )}
            </div>

            {/* Characters Panel */}
            {allCharacters.length > 0 && (
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Users size={14} />
                        Characters ({allCharacters.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {allCharacters.slice(0, 8).map((char, i) => (
                            <span 
                                key={i} 
                                className="px-2 py-1 text-xs bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20"
                            >
                                {char}
                            </span>
                        ))}
                        {allCharacters.length > 8 && (
                            <span className="px-2 py-1 text-xs text-gray-500">
                                +{allCharacters.length - 8} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Scene List */}
            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <LayoutList size={14} />
                        Scenes ({scenes.length})
                    </h3>
                    
                    {scenes.length > 0 && (
                        <button
                            onClick={handleSyncScenes}
                            disabled={isSyncing || syncStatus === 'synced'}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                                syncStatus === 'synced' 
                                    ? 'bg-green-500/10 text-green-400' 
                                    : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                            }`}
                        >
                            {isSyncing ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : syncStatus === 'synced' ? (
                                <Check size={12} />
                            ) : (
                                <RefreshCw size={12} />
                            )}
                            {syncStatus === 'synced' ? 'Synced' : 'Sync'}
                        </button>
                    )}
                </div>
                
                <div className="space-y-2">
                    {scenes.map((scene, index) => (
                        <div 
                            key={index} 
                            className={`group relative rounded-lg transition-all ${
                                scene.synced ? 'bg-green-500/5 border border-green-500/10' : 'hover:bg-white/5'
                            }`}
                        >
                            <button
                                onClick={() => scrollToScene(scene.pos)}
                                className="w-full text-left px-3 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600 font-mono text-xs">{index + 1}</span>
                                    {scene.synced && <Check size={12} className="text-green-500" />}
                                </div>
                                <p className="truncate mt-0.5 text-white/80 text-xs">
                                    {scene.text || "Untitled Scene"}
                                </p>
                                {scene.characters.length > 0 && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <Users size={10} className="text-purple-400" />
                                        <span className="text-[10px] text-gray-500">
                                            {scene.characters.slice(0, 3).join(', ')}
                                            {scene.characters.length > 3 && ` +${scene.characters.length - 3}`}
                                        </span>
                                    </div>
                                )}
                            </button>
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleGenerateShots(index, scene.content);
                                    }}
                                    disabled={generatingSceneIndex === index}
                                    className="p-1.5 text-gray-500 hover:text-yellow-500 transition-colors disabled:opacity-50"
                                    title="Generate Shot Breakdown"
                                >
                                    {generatingSceneIndex === index ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Sparkles size={14} />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                    {scenes.length === 0 && (
                        <div className="text-gray-600 text-sm italic text-center py-8">
                            <p>No scenes detected.</p>
                            <p className="text-xs mt-2">Start typing a Scene Heading</p>
                            <p className="text-xs text-gray-500 mt-1">(e.g. INT. ROOM - DAY)</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Action Footer */}
            {scenes.length > 0 && (
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => {
                            handleSyncScenes().then(() => {
                                window.location.href = `/production?projectId=${projectId}`;
                            });
                        }}
                        disabled={isSyncing}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isSyncing ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <>
                                <span>Continue to Production</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
