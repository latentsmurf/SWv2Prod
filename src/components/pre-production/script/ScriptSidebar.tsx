import React, { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import { MapPin, User, LayoutList, Clapperboard, Loader2 } from 'lucide-react';

interface ScriptSidebarProps {
    editor: Editor | null;
    projectId: string | null;
}

export default function ScriptSidebar({ editor, projectId }: ScriptSidebarProps) {
    const [activeContext, setActiveContext] = useState<{ type: 'location' | 'character' | null, name: string }>({ type: null, name: '' });
    const [scenes, setScenes] = useState<{ pos: number, text: string, content: string }[]>([]);
    const [generatingSceneIndex, setGeneratingSceneIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!editor) return;

        const updateState = () => {
            // 1. Update Context
            const { selection } = editor.state;
            const node = editor.state.doc.nodeAt(selection.from);
            const parent = editor.state.doc.resolve(selection.from).parent;

            if (parent.type.name === 'sceneHeading') {
                setActiveContext({ type: 'location', name: parent.textContent });
            } else if (parent.type.name === 'character') {
                setActiveContext({ type: 'character', name: parent.textContent });
            } else {
                setActiveContext({ type: null, name: '' });
            }

            // 2. Update Scene List
            const newScenes: { pos: number, text: string, content: string }[] = [];
            editor.state.doc.descendants((node, pos) => {
                if (node.type.name === 'sceneHeading') {
                    // Extract content until next heading
                    // This is a simplification. Ideally we'd traverse siblings.
                    newScenes.push({ pos, text: node.textContent, content: "" });
                }
            });

            // Populate content (naive approach)
            for (let i = 0; i < newScenes.length; i++) {
                const start = newScenes[i].pos;
                const end = i < newScenes.length - 1 ? newScenes[i + 1].pos : editor.state.doc.content.size;
                newScenes[i].content = editor.state.doc.textBetween(start, end);
            }

            setScenes(newScenes);
        };

        editor.on('selectionUpdate', updateState);
        editor.on('update', updateState);

        return () => {
            editor.off('selectionUpdate', updateState);
            editor.off('update', updateState);
        };
    }, [editor]);

    const scrollToScene = (pos: number) => {
        if (editor) {
            editor.commands.setTextSelection(pos);
            editor.commands.scrollIntoView();
        }
    };

    const handleGenerateShots = async (index: number, sceneText: string) => {
        if (!projectId) {
            alert("Please save the project first.");
            return;
        }
        setGeneratingSceneIndex(index);
        try {
            const response = await fetch('/api/script/breakdown', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    scene_text: sceneText
                })
            });
            const data = await response.json();
            if (data.status === 'success') {
                alert(`Generated ${data.shot_count} shots for this scene!`);
            } else {
                alert("Failed to generate shots: " + data.detail);
            }
        } catch (e) {
            console.error("Error generating shots:", e);
            alert("Error generating shots");
        }
        setGeneratingSceneIndex(null);
    };

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
                            View Assets
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
                            View Profile
                        </button>
                    </div>
                )}

                {!activeContext.type && (
                    <div className="text-gray-600 text-sm italic text-center py-4">
                        Select a Scene Heading or Character to see context.
                    </div>
                )}
            </div>

            {/* Scene List (Beat Board) */}
            <div className="flex-1 overflow-auto p-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <LayoutList size={14} />
                    Scene List
                </h3>
                <div className="space-y-2">
                    {scenes.map((scene, index) => (
                        <div key={index} className="group relative">
                            <button
                                onClick={() => scrollToScene(scene.pos)}
                                className="w-full text-left px-3 py-2 rounded hover:bg-white/5 text-sm text-gray-400 hover:text-white transition-colors truncate pr-8"
                            >
                                <span className="text-gray-600 mr-2">{index + 1}.</span>
                                {scene.text || "Untitled Scene"}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleGenerateShots(index, scene.content);
                                }}
                                disabled={generatingSceneIndex === index}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-yellow-500 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                                title="Generate Shot List"
                            >
                                {generatingSceneIndex === index ? <Loader2 size={14} className="animate-spin" /> : <Clapperboard size={14} />}
                            </button>
                        </div>
                    ))}
                    {scenes.length === 0 && (
                        <div className="text-gray-600 text-sm italic text-center py-4">
                            No scenes detected. Start typing a Scene Heading (e.g. INT. ROOM).
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
