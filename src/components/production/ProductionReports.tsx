'use client';

import React, { useState, useEffect } from 'react';
import {
    FileText, Calendar, Clock, Film, Users, Check, X,
    Download, Plus, Loader2, ChevronDown, Edit, AlertTriangle,
    Camera, Sun, Moon, Coffee
} from 'lucide-react';

interface DailyReport {
    id: string;
    date: string;
    day_number: number;
    status: 'draft' | 'submitted' | 'approved';
    call_time: string;
    first_shot: string;
    lunch_start?: string;
    lunch_end?: string;
    wrap_time: string;
    scenes_scheduled: string[];
    scenes_completed: string[];
    setups: number;
    takes: number;
    pages_scheduled: number;
    pages_completed: number;
    roll_numbers: { camera: string[]; sound: string[] };
    cast_worked: CastWorkEntry[];
    crew_hours: number;
    notes: string;
    delays?: DelayEntry[];
    created_by: string;
    created_at: string;
}

interface CastWorkEntry {
    cast_id: string;
    name: string;
    role: string;
    call_time: string;
    wrap_time: string;
    meals: boolean;
    travel: boolean;
}

interface DelayEntry {
    duration: number;
    reason: string;
    category: 'weather' | 'technical' | 'talent' | 'creative' | 'other';
}

interface ProductionReportsProps {
    projectId: string;
}

export default function ProductionReports({ projectId }: ProductionReportsProps) {
    const [reports, setReports] = useState<DailyReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [saving, setSaving] = useState(false);

    // Editor form state
    const [reportForm, setReportForm] = useState<Partial<DailyReport>>({
        date: new Date().toISOString().split('T')[0],
        call_time: '06:00',
        first_shot: '07:00',
        wrap_time: '18:00',
        scenes_scheduled: [],
        scenes_completed: [],
        setups: 0,
        takes: 0,
        pages_scheduled: 0,
        pages_completed: 0,
        cast_worked: [],
        crew_hours: 0,
        notes: '',
        delays: []
    });

    // Fetch reports
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/production-reports`);
                if (res.ok) {
                    const data = await res.json();
                    setReports(data);
                    if (data.length > 0) setSelectedReport(data[0]);
                }
            } catch (error) {
                console.error('Error fetching reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [projectId]);

    // Save report
    const saveReport = async () => {
        setSaving(true);
        try {
            const url = selectedReport
                ? `/api/projects/${projectId}/production-reports/${selectedReport.id}`
                : `/api/projects/${projectId}/production-reports`;

            const res = await fetch(url, {
                method: selectedReport ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportForm)
            });

            if (res.ok) {
                const saved = await res.json();
                if (selectedReport) {
                    setReports(prev => prev.map(r => r.id === saved.id ? saved : r));
                } else {
                    setReports(prev => [saved, ...prev]);
                }
                setSelectedReport(saved);
                setShowEditor(false);
            }
        } catch (error) {
            console.error('Error saving report:', error);
        } finally {
            setSaving(false);
        }
    };

    // Export report
    const exportReport = async (reportId: string, format: 'pdf' | 'xlsx') => {
        try {
            const res = await fetch(`/api/projects/${projectId}/production-reports/${reportId}/export?format=${format}`);
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `production_report_day_${selectedReport?.day_number}.${format}`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error exporting:', error);
        }
    };

    // Submit report
    const submitReport = async (reportId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/production-reports/${reportId}/submit`, {
                method: 'POST'
            });
            if (res.ok) {
                setReports(prev => prev.map(r =>
                    r.id === reportId ? { ...r, status: 'submitted' } : r
                ));
                if (selectedReport?.id === reportId) {
                    setSelectedReport({ ...selectedReport, status: 'submitted' });
                }
            }
        } catch (error) {
            console.error('Error submitting:', error);
        }
    };

    // Format time
    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        return `${h > 12 ? h - 12 : h}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;
    };

    // Calculate hours
    const calculateHours = (start: string, end: string) => {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        return ((endMinutes - startMinutes) / 60).toFixed(1);
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-500/10 text-green-400';
            case 'submitted': return 'bg-blue-500/10 text-blue-400';
            default: return 'bg-yellow-500/10 text-yellow-400';
        }
    };

    return (
        <div className="h-full flex">
            {/* Sidebar - Reports List */}
            <div className="w-80 border-r border-white/5 flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileText className="text-yellow-500" />
                            Production Reports
                        </h2>
                        <button
                            onClick={() => {
                                setSelectedReport(null);
                                setReportForm({
                                    date: new Date().toISOString().split('T')[0],
                                    day_number: reports.length + 1,
                                    call_time: '06:00',
                                    first_shot: '07:00',
                                    wrap_time: '18:00',
                                    scenes_scheduled: [],
                                    scenes_completed: [],
                                    setups: 0,
                                    takes: 0,
                                    pages_scheduled: 0,
                                    pages_completed: 0,
                                    cast_worked: [],
                                    crew_hours: 0,
                                    notes: '',
                                    delays: [],
                                    status: 'draft'
                                });
                                setShowEditor(true);
                            }}
                            className="p-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="mx-auto animate-spin text-yellow-500" size={24} />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="p-8 text-center">
                            <FileText className="mx-auto text-gray-600 mb-2" size={32} />
                            <p className="text-sm text-gray-500">No reports yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {reports.map((report) => (
                                <button
                                    key={report.id}
                                    onClick={() => setSelectedReport(report)}
                                    className={`w-full text-left p-4 hover:bg-white/5 ${
                                        selectedReport?.id === report.id ? 'bg-white/5' : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-yellow-500 font-bold">Day {report.day_number}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(report.status)}`}>
                                            {report.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white">
                                        {new Date(report.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                        <span>{report.scenes_completed.length} scenes</span>
                                        <span>{report.pages_completed} pages</span>
                                        <span>{report.setups} setups</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {showEditor ? (
                    // Editor View
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">
                                {selectedReport ? 'Edit Report' : 'New Production Report'}
                            </h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowEditor(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveReport}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                    Save Report
                                </button>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={reportForm.date || ''}
                                    onChange={(e) => setReportForm({ ...reportForm, date: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Day Number</label>
                                <input
                                    type="number"
                                    value={reportForm.day_number || ''}
                                    onChange={(e) => setReportForm({ ...reportForm, day_number: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Call Time</label>
                                <input
                                    type="time"
                                    value={reportForm.call_time || ''}
                                    onChange={(e) => setReportForm({ ...reportForm, call_time: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Wrap Time</label>
                                <input
                                    type="time"
                                    value={reportForm.wrap_time || ''}
                                    onChange={(e) => setReportForm({ ...reportForm, wrap_time: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>
                        </div>

                        {/* Schedule Info */}
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Setups</label>
                                <input
                                    type="number"
                                    value={reportForm.setups || 0}
                                    onChange={(e) => setReportForm({ ...reportForm, setups: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Takes</label>
                                <input
                                    type="number"
                                    value={reportForm.takes || 0}
                                    onChange={(e) => setReportForm({ ...reportForm, takes: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Pages Scheduled</label>
                                <input
                                    type="number"
                                    step="0.125"
                                    value={reportForm.pages_scheduled || 0}
                                    onChange={(e) => setReportForm({ ...reportForm, pages_scheduled: parseFloat(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Pages Completed</label>
                                <input
                                    type="number"
                                    step="0.125"
                                    value={reportForm.pages_completed || 0}
                                    onChange={(e) => setReportForm({ ...reportForm, pages_completed: parseFloat(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Notes</label>
                            <textarea
                                value={reportForm.notes || ''}
                                onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                                placeholder="Production notes, issues, highlights..."
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                            />
                        </div>
                    </div>
                ) : selectedReport ? (
                    // View Mode
                    <div className="p-6 space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Day {selectedReport.day_number}</h3>
                                <p className="text-gray-400">
                                    {new Date(selectedReport.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(selectedReport.status)}`}>
                                    {selectedReport.status}
                                </span>
                                {selectedReport.status === 'draft' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setReportForm(selectedReport);
                                                setShowEditor(true);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white"
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => submitReport(selectedReport.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-xl"
                                        >
                                            <Check size={16} />
                                            Submit
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => exportReport(selectedReport.id, 'pdf')}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white"
                                >
                                    <Download size={16} />
                                    Export PDF
                                </button>
                            </div>
                        </div>

                        {/* Time Overview */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                                <Sun className="text-yellow-400" size={24} />
                                <div>
                                    <p className="text-xs text-gray-500">Call Time</p>
                                    <p className="text-lg font-bold text-white">{formatTime(selectedReport.call_time)}</p>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                                <Camera className="text-blue-400" size={24} />
                                <div>
                                    <p className="text-xs text-gray-500">First Shot</p>
                                    <p className="text-lg font-bold text-white">{formatTime(selectedReport.first_shot)}</p>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                                <Moon className="text-purple-400" size={24} />
                                <div>
                                    <p className="text-xs text-gray-500">Wrap Time</p>
                                    <p className="text-lg font-bold text-white">{formatTime(selectedReport.wrap_time)}</p>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                                <Clock className="text-green-400" size={24} />
                                <div>
                                    <p className="text-xs text-gray-500">Total Hours</p>
                                    <p className="text-lg font-bold text-white">
                                        {calculateHours(selectedReport.call_time, selectedReport.wrap_time)}h
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Production Stats */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                                <p className="text-sm text-gray-500">Scenes</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {selectedReport.scenes_completed.length}
                                    <span className="text-sm text-gray-500 font-normal">
                                        /{selectedReport.scenes_scheduled.length}
                                    </span>
                                </p>
                            </div>
                            <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                                <p className="text-sm text-gray-500">Pages</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {selectedReport.pages_completed}
                                    <span className="text-sm text-gray-500 font-normal">
                                        /{selectedReport.pages_scheduled}
                                    </span>
                                </p>
                            </div>
                            <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                                <p className="text-sm text-gray-500">Setups</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedReport.setups}</p>
                            </div>
                            <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                                <p className="text-sm text-gray-500">Takes</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedReport.takes}</p>
                            </div>
                        </div>

                        {/* Notes */}
                        {selectedReport.notes && (
                            <div className="bg-white/5 rounded-xl p-4">
                                <h4 className="font-medium text-white mb-2">Production Notes</h4>
                                <p className="text-gray-400 whitespace-pre-wrap">{selectedReport.notes}</p>
                            </div>
                        )}

                        {/* Delays */}
                        {selectedReport.delays && selectedReport.delays.length > 0 && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <h4 className="font-medium text-red-400 mb-3 flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    Delays
                                </h4>
                                <div className="space-y-2">
                                    {selectedReport.delays.map((delay, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-gray-300">{delay.reason}</span>
                                            <span className="text-red-400">{delay.duration} min</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <FileText className="mx-auto mb-4" size={48} />
                            <p>Select a report to view details</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
