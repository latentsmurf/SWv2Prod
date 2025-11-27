"use client";

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import { SceneHeading, Action, Character, Dialogue, Parenthetical } from './extensions';
import ScriptSidebar from './ScriptSidebar';
import { Wand2, Sparkles, Upload, Download, Save, Loader2 } from 'lucide-react';
import { parseFDX } from '@/utils/fdxParser';
import { pdf } from '@react-pdf/renderer';
import { ScriptPDF } from './ScriptPDF';
import TitlePageModal from './TitlePageModal';
import { exportFDX } from '@/utils/fdxExporter';
import { Maximize2, Minimize2, FileText, FileJson } from 'lucide-react';

interface ScriptEditorProps {
    projectId?: string;
}

export default function ScriptEditor({ projectId }: ScriptEditorProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(projectId || null);
    const [showTitlePageModal, setShowTitlePageModal] = useState(false);
    const [titlePageData, setTitlePageData] = useState({
        title: '',
        credit: 'written by',
        author: '',
        source: '',
        contact: ''
    });
    const [focusMode, setFocusMode] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: false, // We use custom SceneHeading
            }),
            BubbleMenuExtension,
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === 'sceneHeading') {
                        return 'INT. LOCATION - DAY';
                    }
                    if (node.type.name === 'character') {
                        return 'CHARACTER NAME';
                    }
                    if (node.type.name === 'dialogue') {
                        return 'Dialogue...';
                    }
                    if (node.type.name === 'parenthetical') {
                        return '(action)';
                    }
                    return 'Action description...';
                },
            }),
            TextStyle,
            SceneHeading,
            Action,
            Character,
            Dialogue,
            Parenthetical,
        ],
        content: `
            <h1 class="scene-heading">INT. COFFEE SHOP - DAY</h1>
            <p class="action">The aroma of roasted beans fills the air. A BARISTA works the espresso machine.</p>
            <div class="character">JOHN</div>
            <div class="dialogue">Two coffees, please. Black.</div>
            <div class="character">BARISTA</div>
            <div class="parenthetical">(smiling)</div>
            <div class="dialogue">Coming right up.</div>
        `,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[800px] font-mono text-lg',
            },
        },
    });

    const [isGenerating, setIsGenerating] = useState(false);

    // Load Script
    useEffect(() => {
        const loadScript = async () => {
            let pid = currentProjectId;
            try {
                if (!pid) {
                    // Fetch latest project if none provided
                    const res = await fetch('/api/projects');
                    if (res.ok) {
                        const projects = await res.json();
                        if (projects && projects.length > 0) {
                            // Sort by created_at desc
                            projects.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                            const latest = projects[0];
                            pid = latest.id || latest._id;
                            setCurrentProjectId(pid);

                            // Fetch full project details to get script_content
                            const detailRes = await fetch(`/api/projects/${pid}`);
                            if (detailRes.ok) {
                                const data = await detailRes.json();
                                if (data.script_content && editor && Object.keys(data.script_content).length > 0) {
                                    editor.commands.setContent(data.script_content);
                                    if (data.script_content.frontmatter) {
                                        setTitlePageData(data.script_content.frontmatter);
                                    }
                                }
                            }
                        }
                    }
                } else {
                    const res = await fetch(`/api/projects/${pid}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.script_content && editor && Object.keys(data.script_content).length > 0) {
                            editor.commands.setContent(data.script_content);
                            if (data.script_content.frontmatter) {
                                setTitlePageData(data.script_content.frontmatter);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading script:", error);
            }
        };
        if (editor) loadScript();
    }, [editor, currentProjectId]);

    const handleSave = async () => {
        if (!editor || !currentProjectId) return;
        setIsSaving(true);
        setIsSaving(true);
        const content = editor.getJSON();
        // Attach title page data to content
        (content as any).frontmatter = titlePageData;

        try {
            const response = await fetch(`/api/projects/${currentProjectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script_content: content })
            });

            if (response.ok) {
                setLastSaved(new Date());
            } else {
                console.error("Error saving script");
            }
        } catch (error) {
            console.error("Error saving script:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-save
    useEffect(() => {
        const interval = setInterval(() => {
            if (editor && editor.isFocused) {
                handleSave();
            }
        }, 30000); // 30s
        return () => clearInterval(interval);
    }, [editor, currentProjectId]);

    const handleGhostwrite = async (instruction: string) => {
        if (!editor) return;

        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to);

        setIsGenerating(true);
        try {
            const response = await fetch('/api/script/ghostwrite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selected_text: selectedText,
                    instruction: instruction,
                    context: "Screenplay"
                })
            });
            const data = await response.json();
            if (data.status === 'success') {
                editor.commands.insertContent(data.text);
            }
        } catch (error) {
            console.error("Ghostwrite failed", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateNextScene = async () => {
        if (!editor) return;
        const userPrompt = prompt("What happens next?");
        if (!userPrompt) return;

        setIsGenerating(true);
        try {
            const response = await fetch('/api/script/ghostwrite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selected_text: "",
                    instruction: "Generate next scene: " + userPrompt,
                    context: "Screenplay"
                })
            });
            const data = await response.json();
            if (data.status === 'success') {
                editor.commands.focus('end');
                editor.commands.insertContent(data.text);
            }
        } catch (error) {
            console.error("Scene generation failed", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImportFDX = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !editor) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const jsonContent = parseFDX(content);
            editor.commands.setContent(jsonContent);
        };
        reader.readAsText(file);
    };

    const handleImportPDF = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !editor) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsGenerating(true);
        try {
            const response = await fetch('/api/script/import-pdf', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.status === 'success') {
                editor.commands.setContent(data.content);
            }
        } catch (error) {
            console.error("PDF Import failed", error);
            alert("Failed to import PDF");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportPDF = async () => {
        if (!editor) return;
        const blob = await pdf(<ScriptPDF content={editor.getJSON()} titlePage={titlePageData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'script.pdf';
        link.click();
    };

    const handleExportFDX = () => {
        if (!editor) return;
        const fdxContent = exportFDX(editor.getJSON(), titlePageData);
        const blob = new Blob([fdxContent], { type: 'text/xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'script.fdx';
        link.click();
    };

    return (
        <div className="flex h-full bg-[#1a1a1a]">
            {/* Editor Area */}
            <div className={`flex-1 overflow-y-auto p-8 flex justify-center bg-[#111] relative transition-all duration-300 ${focusMode ? 'z-50 fixed inset-0' : ''}`}>
                <div className={`w-full max-w-[850px] bg-white text-black min-h-[1100px] shadow-2xl p-16 my-8 relative transition-all duration-300 ${focusMode ? 'scale-110 mt-20' : ''}`}>
                    {/* Toolbar */}
                    <div className={`absolute top-4 right-4 flex gap-2 transition-opacity duration-300 ${focusMode ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                        <button onClick={() => setFocusMode(!focusMode)} className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-black transition-colors" title={focusMode ? "Exit Focus Mode" : "Focus Mode"}>
                            {focusMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                        <div className="w-px bg-gray-300 mx-1"></div>
                        <button onClick={() => setShowTitlePageModal(true)} className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-black transition-colors" title="Title Page">
                            <FileText size={20} />
                        </button>
                        <button onClick={handleExportFDX} className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-black transition-colors" title="Export FDX">
                            <FileJson size={20} />
                        </button>
                        <label className="cursor-pointer p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-black transition-colors" title="Import FDX">
                            <Upload size={20} />
                            <span className="sr-only">Import FDX</span>
                            <input type="file" accept=".fdx,.xml" className="hidden" onChange={handleImportFDX} />
                        </label>
                        <label className="cursor-pointer p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-black transition-colors" title="Import PDF">
                            <div className="relative">
                                <Upload size={20} />
                                <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-red-500 text-white px-1 rounded">PDF</span>
                            </div>
                            <input type="file" accept=".pdf" className="hidden" onChange={handleImportPDF} />
                        </label>
                        <button onClick={handleExportPDF} className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-black transition-colors" title="Export PDF">
                            <Download size={20} />
                        </button>
                        <div className="w-px bg-gray-300 mx-1"></div>
                        <button onClick={handleSave} disabled={isSaving} className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-black transition-colors" title="Save Script">
                            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        </button>
                    </div>

                    <EditorContent editor={editor} />
                </div>

                {/* Generate Next Scene Button */}
                <div className="absolute bottom-8 right-8">
                    <button
                        onClick={handleGenerateNextScene}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <span className="animate-spin">✨</span>
                        ) : (
                            <Wand2 size={20} />
                        )}
                        <span className="font-bold">Generate Next Scene</span>
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            {!focusMode && <ScriptSidebar editor={editor} projectId={currentProjectId} />}

            <TitlePageModal
                isOpen={showTitlePageModal}
                onClose={() => setShowTitlePageModal(false)}
                onSave={setTitlePageData}
                initialData={titlePageData}
            />
        </div>
    );
}
