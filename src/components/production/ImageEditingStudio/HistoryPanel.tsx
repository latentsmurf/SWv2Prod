'use client';

import React from 'react';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';
import { HistoryEntry } from './types';

interface HistoryPanelProps {
    history: HistoryEntry[];
    historyIndex: number;
    showHistory: boolean;
    setShowHistory: (show: boolean) => void;
    onRestoreFromHistory: (index: number) => void;
}

export default function HistoryPanel({
    history,
    historyIndex,
    showHistory,
    setShowHistory,
    onRestoreFromHistory,
}: HistoryPanelProps) {
    return (
        <div className={`${showHistory ? '' : 'h-10'} transition-all`}>
            <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full h-10 px-3 flex items-center justify-between text-sm font-medium hover:bg-white/5"
            >
                <span className="flex items-center gap-2">
                    <History size={16} />
                    History
                    <span className="text-xs text-gray-500">({history.length})</span>
                </span>
                {showHistory ? <ChevronLeft size={16} className="rotate-90" /> : <ChevronRight size={16} className="-rotate-90" />}
            </button>
            
            {showHistory && (
                <div className="p-3 max-h-40 overflow-y-auto">
                    {history.length === 0 ? (
                        <div className="text-xs text-gray-500 text-center py-4">
                            No history yet
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {history.map((entry, index) => (
                                <button
                                    key={entry.id}
                                    onClick={() => onRestoreFromHistory(index)}
                                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                                        index === historyIndex
                                            ? 'bg-yellow-500/20 text-yellow-400'
                                            : index < historyIndex
                                            ? 'hover:bg-white/5 text-gray-400'
                                            : 'hover:bg-white/5 text-gray-600'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{entry.action}</span>
                                        <span className="text-[10px] text-gray-600">
                                            {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
