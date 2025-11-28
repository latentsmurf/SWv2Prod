'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Sparkles, Send, Loader2, Copy, Check, RefreshCw,
    Lightbulb, Wand2, MessageSquare, ChevronDown, X,
    AlertTriangle, Eye, Camera, Type, Zap, Clock, Smartphone
} from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface AIScriptAssistantProps {
    projectId: string;
    currentScript?: string;
    onInsertText?: (text: string) => void;
    onReplaceSelection?: (text: string) => void;
    selectedText?: string;
    genre?: string; // To detect micro drama mode
}

// Standard script actions
const QUICK_ACTIONS = [
    { id: 'improve', label: 'Improve dialogue', icon: Wand2, prompt: 'Improve this dialogue to be more natural and compelling' },
    { id: 'expand', label: 'Expand scene', icon: Sparkles, prompt: 'Expand this scene with more detail and description' },
    { id: 'shorten', label: 'Make concise', icon: RefreshCw, prompt: 'Make this more concise while keeping the essence' },
    { id: 'emotion', label: 'Add emotion', icon: MessageSquare, prompt: 'Add more emotional depth to this scene' },
    { id: 'action', label: 'Add action', icon: Lightbulb, prompt: 'Add more action and visual description' },
];

// Micro drama specific actions
const MICRO_DRAMA_ACTIONS = [
    { id: 'cliffhanger', label: 'Add cliffhanger', icon: AlertTriangle, prompt: 'Rewrite this scene to end on a dramatic cliffhanger that makes viewers desperate to see the next episode. The cliffhanger should be shocking or emotionally intense.' },
    { id: 'reveal', label: 'Shocking reveal', icon: Eye, prompt: 'Add a shocking revelation or dramatic twist to this scene that will surprise viewers' },
    { id: 'tension', label: 'Build tension', icon: Zap, prompt: 'Increase the tension and conflict in this scene with faster pacing and more dramatic confrontation' },
    { id: 'pov-shot', label: 'POV close-up', icon: Camera, prompt: 'Add an intense POV close-up reaction shot with internal monologue' },
    { id: 'text-moment', label: 'Text overlay', icon: Type, prompt: 'Suggest a dramatic text overlay moment for inner thoughts, flashback text, or dramatic revelation text' },
    { id: 'hook', label: 'Opening hook', icon: Clock, prompt: 'Rewrite the first 3-5 seconds of this scene to immediately hook viewers with intrigue, conflict, or a question' },
];

// System context for micro drama AI assistance
const MICRO_DRAMA_CONTEXT = `
You are writing for a VERTICAL MICRO DRAMA (9:16 format) like RealShort, ReelShort, or DramaBox.

KEY RULES FOR MICRO DRAMAS:
- Episodes are 1-3 minutes each (60-90 seconds is ideal)
- EVERY episode MUST end on a cliffhanger or shocking moment
- Use short, punchy dialogue - no long speeches
- Heavy on close-ups and reaction shots
- Include "hook moments" in first 3 seconds of each episode
- Build tension quickly, reveal slowly
- Use dramatic pauses before reveals
- Consider text overlays for inner thoughts
- Fast pacing with quick scene transitions
- Lots of POV shots and over-the-shoulder angles

POPULAR MICRO DRAMA TROPES TO USE:
- Mistaken identity / hidden identity reveals
- Secret billionaire / CEO reveals
- Revenge plots with satisfying payoffs
- Contract marriages that become real
- Dramatic confrontations in public
- Shocking family secrets
- "You didn't know who you were messing with" moments
- Transformation/glow-up reveals
- Love triangles with dramatic choices
- Cliffhangers that cut mid-sentence or mid-action

FORMATTING FOR VERTICAL:
- Frame for close-ups (faces fill the vertical frame)
- Use vertical space - characters can enter from top/bottom
- Text overlays should be large and readable
- Keep backgrounds simple to focus on faces
`;

export default function AIScriptAssistant({
    projectId,
    currentScript,
    onInsertText,
    onReplaceSelection,
    selectedText,
    genre
}: AIScriptAssistantProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showQuickActions, setShowQuickActions] = useState(true);
    const [activeTab, setActiveTab] = useState<'standard' | 'micro'>('standard');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Detect if this is a micro drama project
    const isMicroDrama = genre?.startsWith('micro-');

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-switch to micro tab if micro drama genre detected
    useEffect(() => {
        if (isMicroDrama) {
            setActiveTab('micro');
        }
    }, [isMicroDrama]);

    // Send message
    const sendMessage = async (userMessage: string) => {
        if (!userMessage.trim()) return;

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Add micro drama context if applicable
            const systemContext = isMicroDrama ? MICRO_DRAMA_CONTEXT : '';
            
            const res = await fetch('/api/ai/script-assist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    message: userMessage,
                    context: selectedText || currentScript?.slice(0, 2000),
                    system_context: systemContext,
                    genre: genre,
                    history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
                })
            });

            if (res.ok) {
                const data = await res.json();
                const assistantMsg: Message = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMsg]);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Quick action
    const handleQuickAction = (action: typeof QUICK_ACTIONS[0] | typeof MICRO_DRAMA_ACTIONS[0]) => {
        const context = selectedText || 'the current scene';
        sendMessage(`${action.prompt}: "${context}"`);
    };

    // Copy to clipboard
    const copyToClipboard = (content: string, id: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Insert into editor
    const handleInsert = (content: string) => {
        if (selectedText && onReplaceSelection) {
            onReplaceSelection(content);
        } else if (onInsertText) {
            onInsertText(content);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-xl">
                        <Sparkles className="text-purple-400" size={20} />
                    </div>
                    <div>
                        <h3 className="font-medium text-white">AI Script Assistant</h3>
                        <p className="text-xs text-gray-500">Powered by GPT-4</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center py-8">
                        {isMicroDrama ? (
                            <>
                                <Smartphone className="mx-auto text-pink-400/50 mb-4" size={48} />
                                <h4 className="text-lg font-medium text-white mb-2">
                                    Micro Drama Script Assistant
                                </h4>
                                <p className="text-sm text-gray-500 mb-6">
                                    Optimized for vertical short-form series with cliffhangers and hooks.
                                </p>
                            </>
                        ) : (
                            <>
                                <Sparkles className="mx-auto text-purple-400/50 mb-4" size={48} />
                                <h4 className="text-lg font-medium text-white mb-2">
                                    How can I help with your script?
                                </h4>
                                <p className="text-sm text-gray-500 mb-6">
                                    Ask me to improve dialogue, expand scenes, or generate new ideas.
                                </p>
                            </>
                        )}

                        {/* Quick Actions with Tab Toggle */}
                        {showQuickActions && (
                            <div className="max-w-md mx-auto">
                                {/* Tab Toggle */}
                                <div className="flex justify-center gap-1 mb-4 bg-white/5 rounded-lg p-1 max-w-xs mx-auto">
                                    <button
                                        onClick={() => setActiveTab('standard')}
                                        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                            activeTab === 'standard'
                                                ? 'bg-purple-500 text-white'
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        Standard
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('micro')}
                                        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                                            activeTab === 'micro'
                                                ? 'bg-pink-500 text-white'
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        <Smartphone size={12} />
                                        Micro Drama
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-2">
                                    {activeTab === 'standard' ? (
                                        QUICK_ACTIONS.map((action) => {
                                            const Icon = action.icon;
                                            return (
                                                <button
                                                    key={action.id}
                                                    onClick={() => handleQuickAction(action)}
                                                    className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors"
                                                >
                                                    <Icon size={16} className="text-purple-400" />
                                                    <span className="text-sm text-gray-300">{action.label}</span>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        MICRO_DRAMA_ACTIONS.map((action) => {
                                            const Icon = action.icon;
                                            return (
                                                <button
                                                    key={action.id}
                                                    onClick={() => handleQuickAction(action)}
                                                    className="flex items-center gap-2 p-3 bg-pink-500/5 hover:bg-pink-500/10 border border-pink-500/20 rounded-xl text-left transition-colors"
                                                >
                                                    <Icon size={16} className="text-pink-400" />
                                                    <span className="text-sm text-gray-300">{action.label}</span>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Micro Drama Tips */}
                                {activeTab === 'micro' && (
                                    <div className="mt-4 p-3 bg-pink-500/5 border border-pink-500/20 rounded-xl text-left">
                                        <p className="text-xs text-pink-300 font-medium mb-1">💡 Micro Drama Tips</p>
                                        <p className="text-xs text-gray-500">
                                            End every episode on a cliffhanger. Hook viewers in the first 3 seconds. Keep dialogue punchy.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl p-4 ${
                                    msg.role === 'user'
                                        ? 'bg-purple-500/20 text-white'
                                        : 'bg-white/5 text-gray-300'
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                
                                {msg.role === 'assistant' && (
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                                        <button
                                            onClick={() => copyToClipboard(msg.content, msg.id)}
                                            className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-500 hover:text-white hover:bg-white/5 rounded"
                                        >
                                            {copiedId === msg.id ? (
                                                <>
                                                    <Check size={12} />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={12} />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                        {(onInsertText || onReplaceSelection) && (
                                            <button
                                                onClick={() => handleInsert(msg.content)}
                                                className="flex items-center gap-1.5 px-2 py-1 text-xs text-purple-400 hover:bg-purple-500/10 rounded"
                                            >
                                                <Wand2 size={12} />
                                                {selectedText ? 'Replace Selection' : 'Insert'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 rounded-2xl p-4">
                            <Loader2 className="animate-spin text-purple-400" size={20} />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Selected Text Indicator */}
            {selectedText && (
                <div className="px-4 py-2 bg-purple-500/10 border-t border-purple-500/20">
                    <p className="text-xs text-purple-400">
                        Working with selection: "{selectedText.slice(0, 50)}..."
                    </p>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/5">
                <div className="flex items-end gap-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage(input);
                            }
                        }}
                        placeholder="Ask anything about your script..."
                        rows={1}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 resize-none focus:border-purple-500 focus:outline-none"
                    />
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || loading}
                        className="p-3 bg-purple-500 hover:bg-purple-400 text-white rounded-xl disabled:opacity-50 transition-colors"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
