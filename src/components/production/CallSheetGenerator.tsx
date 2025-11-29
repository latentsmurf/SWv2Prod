'use client';

import React, { useState, useEffect } from 'react';
import {
    FileText, Calendar, Clock, MapPin, Users, Phone, Mail,
    Sun, Sunset, Cloud, Plus, X, Download, Loader2, Edit,
    Trash2, Copy, Check, AlertTriangle, Car, Coffee
} from 'lucide-react';

interface CallSheet {
    id: string;
    project_id: string;
    date: string;
    call_time: string;
    shooting_location: {
        name: string;
        address: string;
        parking_notes?: string;
        contact?: string;
    };
    weather?: {
        condition: string;
        high: number;
        low: number;
        sunrise: string;
        sunset: string;
    };
    scenes: CallSheetScene[];
    cast_calls: CastCall[];
    crew_calls: CrewCall[];
    notes: string;
    emergency_contacts: EmergencyContact[];
    catering?: {
        breakfast: string;
        lunch: string;
        craft_services: string;
    };
    created_at: string;
}

interface CallSheetScene {
    scene_id: string;
    scene_number: string;
    description: string;
    pages: string;
    location: string;
    cast_ids: string[];
    estimated_time: string;
}

interface CastCall {
    cast_id: string;
    name: string;
    role: string;
    call_time: string;
    makeup_time?: string;
    on_set_time?: string;
    notes?: string;
    contact?: string;
}

interface CrewCall {
    department: string;
    position: string;
    name: string;
    call_time: string;
    contact?: string;
}

interface EmergencyContact {
    name: string;
    role: string;
    phone: string;
}

interface CallSheetGeneratorProps {
    projectId: string;
}

const DEPARTMENTS = [
    'Direction', 'Camera', 'Lighting', 'Sound', 'Art', 'Wardrobe',
    'Makeup', 'Props', 'Grip', 'Electric', 'Production', 'Catering'
];

export default function CallSheetGenerator({ projectId }: CallSheetGeneratorProps) {
    const [callSheets, setCallSheets] = useState<CallSheet[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSheet, setSelectedSheet] = useState<CallSheet | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Editor form state
    const [form, setForm] = useState<Partial<CallSheet>>({
        date: new Date().toISOString().split('T')[0],
        call_time: '06:00',
        shooting_location: { name: '', address: '' },
        scenes: [],
        cast_calls: [],
        crew_calls: [],
        notes: '',
        emergency_contacts: []
    });

    // Fetch call sheets
    useEffect(() => {
        const fetchCallSheets = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/call-sheets`);
                if (res.ok) {
                    setCallSheets(await res.json());
                }
            } catch (error) {
                console.error('Error fetching call sheets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCallSheets();
    }, [projectId]);

    // Auto-generate call sheet from schedule
    const autoGenerate = async (date: string) => {
        setGenerating(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/call-sheets/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date })
            });

            if (res.ok) {
                const generated = await res.json();
                setForm(generated);
                setShowEditor(true);
            }
        } catch (error) {
            console.error('Error generating call sheet:', error);
        } finally {
            setGenerating(false);
        }
    };

    // Save call sheet
    const saveCallSheet = async () => {
        try {
            const url = selectedSheet
                ? `/api/projects/${projectId}/call-sheets/${selectedSheet.id}`
                : `/api/projects/${projectId}/call-sheets`;

            const res = await fetch(url, {
                method: selectedSheet ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                const saved = await res.json();
                if (selectedSheet) {
                    setCallSheets(prev => prev.map(s => s.id === saved.id ? saved : s));
                } else {
                    setCallSheets(prev => [...prev, saved]);
                }
                setShowEditor(false);
                setSelectedSheet(null);
            }
        } catch (error) {
            console.error('Error saving call sheet:', error);
        }
    };

    // Export call sheet
    const exportCallSheet = async (sheet: CallSheet, format: 'pdf' | 'email') => {
        setExporting(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/call-sheets/${sheet.id}/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ format })
            });

            if (res.ok) {
                if (format === 'pdf') {
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `call_sheet_${sheet.date}.pdf`;
                    a.click();
                    URL.revokeObjectURL(url);
                }
            }
        } catch (error) {
            console.error('Error exporting:', error);
        } finally {
            setExporting(false);
        }
    };

    // Add cast call
    const addCastCall = () => {
        setForm(prev => ({
            ...prev,
            cast_calls: [...(prev.cast_calls || []), {
                cast_id: '',
                name: '',
                role: '',
                call_time: prev.call_time || '06:00'
            }]
        }));
    };

    // Add crew call
    const addCrewCall = () => {
        setForm(prev => ({
            ...prev,
            crew_calls: [...(prev.crew_calls || []), {
                department: '',
                position: '',
                name: '',
                call_time: prev.call_time || '06:00'
            }]
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FileText className="text-yellow-500" />
                        Call Sheets
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Generate and manage daily call sheets
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => autoGenerate(new Date().toISOString().split('T')[0])}
                        disabled={generating}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl"
                    >
                        {generating ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Calendar size={18} />
                        )}
                        Auto-Generate
                    </button>
                    <button
                        onClick={() => {
                            setSelectedSheet(null);
                            setForm({
                                date: new Date().toISOString().split('T')[0],
                                call_time: '06:00',
                                shooting_location: { name: '', address: '' },
                                scenes: [],
                                cast_calls: [],
                                crew_calls: [],
                                notes: '',
                                emergency_contacts: []
                            });
                            setShowEditor(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                    >
                        <Plus size={18} />
                        New Call Sheet
                    </button>
                </div>
            </div>

            {/* Call Sheets List */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : callSheets.length === 0 ? (
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-12 text-center">
                    <FileText className="mx-auto text-gray-600 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-white mb-2">No Call Sheets Yet</h3>
                    <p className="text-gray-500 mb-6">Create your first call sheet for the production</p>
                    <button
                        onClick={() => setShowEditor(true)}
                        className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                    >
                        Create Call Sheet
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {callSheets.map((sheet) => (
                        <div
                            key={sheet.id}
                            className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-white/5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-yellow-500 font-medium">
                                        {new Date(sheet.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock size={12} />
                                        {sheet.call_time}
                                    </span>
                                </div>
                                <h3 className="text-white font-medium truncate">
                                    {sheet.shooting_location.name || 'Location TBD'}
                                </h3>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <MapPin size={14} />
                                    <span className="truncate">{sheet.shooting_location.address || 'Address TBD'}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>{sheet.scenes.length} scenes</span>
                                    <span>{sheet.cast_calls.length} cast</span>
                                    <span>{sheet.crew_calls.length} crew</span>
                                </div>

                                {sheet.weather && (
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Sun size={14} className="text-yellow-400" />
                                        <span>{sheet.weather.high}°/{sheet.weather.low}°</span>
                                        <span className="text-gray-600">|</span>
                                        <Sunset size={14} className="text-orange-400" />
                                        <span>{sheet.weather.sunset}</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="p-4 border-t border-white/5 flex items-center justify-between">
                                <button
                                    onClick={() => {
                                        setSelectedSheet(sheet);
                                        setForm(sheet);
                                        setShowEditor(true);
                                    }}
                                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                                >
                                    <Edit size={14} />
                                    Edit
                                </button>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => exportCallSheet(sheet, 'pdf')}
                                        disabled={exporting}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={() => exportCallSheet(sheet, 'email')}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                                    >
                                        <Mail size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Editor Modal */}
            {showEditor && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden my-8">
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">
                                {selectedSheet ? 'Edit Call Sheet' : 'New Call Sheet'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowEditor(false);
                                    setSelectedSheet(null);
                                }}
                                className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={form.date || ''}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">General Call Time</label>
                                    <input
                                        type="time"
                                        value={form.call_time || ''}
                                        onChange={(e) => setForm({ ...form, call_time: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="p-4 bg-white/5 rounded-xl">
                                <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                                    <MapPin size={18} />
                                    Shooting Location
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Location Name</label>
                                        <input
                                            type="text"
                                            value={form.shooting_location?.name || ''}
                                            onChange={(e) => setForm({
                                                ...form,
                                                shooting_location: { ...form.shooting_location!, name: e.target.value }
                                            })}
                                            placeholder="Studio A"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Address</label>
                                        <input
                                            type="text"
                                            value={form.shooting_location?.address || ''}
                                            onChange={(e) => setForm({
                                                ...form,
                                                shooting_location: { ...form.shooting_location!, address: e.target.value }
                                            })}
                                            placeholder="123 Film St, Los Angeles"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Cast Calls */}
                            <div className="p-4 bg-white/5 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium text-white flex items-center gap-2">
                                        <Users size={18} />
                                        Cast Calls
                                    </h4>
                                    <button
                                        onClick={addCastCall}
                                        className="text-sm text-yellow-500 hover:text-yellow-400"
                                    >
                                        + Add Cast
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {form.cast_calls?.map((cast, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                                            <input
                                                type="text"
                                                value={cast.name}
                                                onChange={(e) => {
                                                    const updated = [...(form.cast_calls || [])];
                                                    updated[index].name = e.target.value;
                                                    setForm({ ...form, cast_calls: updated });
                                                }}
                                                placeholder="Name"
                                                className="flex-1 bg-transparent border-b border-white/10 px-2 py-1 text-white text-sm"
                                            />
                                            <input
                                                type="text"
                                                value={cast.role}
                                                onChange={(e) => {
                                                    const updated = [...(form.cast_calls || [])];
                                                    updated[index].role = e.target.value;
                                                    setForm({ ...form, cast_calls: updated });
                                                }}
                                                placeholder="Role"
                                                className="w-32 bg-transparent border-b border-white/10 px-2 py-1 text-white text-sm"
                                            />
                                            <input
                                                type="time"
                                                value={cast.call_time}
                                                onChange={(e) => {
                                                    const updated = [...(form.cast_calls || [])];
                                                    updated[index].call_time = e.target.value;
                                                    setForm({ ...form, cast_calls: updated });
                                                }}
                                                className="w-28 bg-transparent border-b border-white/10 px-2 py-1 text-white text-sm"
                                            />
                                            <button
                                                onClick={() => {
                                                    const updated = form.cast_calls?.filter((_, i) => i !== index);
                                                    setForm({ ...form, cast_calls: updated });
                                                }}
                                                className="p-1 text-gray-500 hover:text-red-400"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Crew Calls */}
                            <div className="p-4 bg-white/5 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium text-white flex items-center gap-2">
                                        <Users size={18} />
                                        Crew Calls
                                    </h4>
                                    <button
                                        onClick={addCrewCall}
                                        className="text-sm text-yellow-500 hover:text-yellow-400"
                                    >
                                        + Add Crew
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {form.crew_calls?.map((crew, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                                            <select
                                                value={crew.department}
                                                onChange={(e) => {
                                                    const updated = [...(form.crew_calls || [])];
                                                    updated[index].department = e.target.value;
                                                    setForm({ ...form, crew_calls: updated });
                                                }}
                                                className="w-32 bg-transparent border-b border-white/10 px-2 py-1 text-white text-sm"
                                            >
                                                <option value="">Dept</option>
                                                {DEPARTMENTS.map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                value={crew.position}
                                                onChange={(e) => {
                                                    const updated = [...(form.crew_calls || [])];
                                                    updated[index].position = e.target.value;
                                                    setForm({ ...form, crew_calls: updated });
                                                }}
                                                placeholder="Position"
                                                className="w-32 bg-transparent border-b border-white/10 px-2 py-1 text-white text-sm"
                                            />
                                            <input
                                                type="text"
                                                value={crew.name}
                                                onChange={(e) => {
                                                    const updated = [...(form.crew_calls || [])];
                                                    updated[index].name = e.target.value;
                                                    setForm({ ...form, crew_calls: updated });
                                                }}
                                                placeholder="Name"
                                                className="flex-1 bg-transparent border-b border-white/10 px-2 py-1 text-white text-sm"
                                            />
                                            <input
                                                type="time"
                                                value={crew.call_time}
                                                onChange={(e) => {
                                                    const updated = [...(form.crew_calls || [])];
                                                    updated[index].call_time = e.target.value;
                                                    setForm({ ...form, crew_calls: updated });
                                                }}
                                                className="w-28 bg-transparent border-b border-white/10 px-2 py-1 text-white text-sm"
                                            />
                                            <button
                                                onClick={() => {
                                                    const updated = form.crew_calls?.filter((_, i) => i !== index);
                                                    setForm({ ...form, crew_calls: updated });
                                                }}
                                                className="p-1 text-gray-500 hover:text-red-400"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Production Notes</label>
                                <textarea
                                    value={form.notes || ''}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Special instructions, safety notes, etc."
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowEditor(false);
                                    setSelectedSheet(null);
                                }}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveCallSheet}
                                className="flex items-center gap-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                            >
                                <Check size={18} />
                                Save Call Sheet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
