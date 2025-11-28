'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar, Users, Download, Loader2, Grid, ChevronLeft,
    ChevronRight, Check, X, Clock, Filter
} from 'lucide-react';

interface CastMember {
    id: string;
    name: string;
    role: string;
}

interface ShootDay {
    date: string;
    day_number: number;
    scenes: string[];
}

interface DOODEntry {
    cast_id: string;
    cast_name: string;
    role: string;
    days: {
        [date: string]: 'W' | 'SW' | 'SWF' | 'WF' | 'H' | 'T' | 'R' | 'F' | '';
    };
    total_work_days: number;
    total_hold_days: number;
    start_date?: string;
    finish_date?: string;
}

interface DayOutOfDaysProps {
    projectId: string;
}

const STATUS_LEGEND = [
    { code: 'SW', label: 'Start/Work', color: 'bg-green-500' },
    { code: 'W', label: 'Work', color: 'bg-blue-500' },
    { code: 'WF', label: 'Work/Finish', color: 'bg-purple-500' },
    { code: 'SWF', label: 'Start/Work/Finish', color: 'bg-yellow-500' },
    { code: 'H', label: 'Hold', color: 'bg-orange-500' },
    { code: 'T', label: 'Travel', color: 'bg-cyan-500' },
    { code: 'R', label: 'Rehearsal', color: 'bg-pink-500' },
    { code: 'F', label: 'Fitting', color: 'bg-indigo-500' },
];

export default function DayOutOfDays({ projectId }: DayOutOfDaysProps) {
    const [entries, setEntries] = useState<DOODEntry[]>([]);
    const [shootDays, setShootDays] = useState<ShootDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewStart, setViewStart] = useState(0);
    const [visibleDays, setVisibleDays] = useState(14);
    const [filterRole, setFilterRole] = useState<string>('all');

    // Fetch DOOD data
    useEffect(() => {
        const fetchDOOD = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/dood`);
                if (res.ok) {
                    const data = await res.json();
                    setEntries(data.entries || []);
                    setShootDays(data.shoot_days || []);
                }
            } catch (error) {
                console.error('Error fetching DOOD:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDOOD();
    }, [projectId]);

    // Update entry
    const updateEntry = async (castId: string, date: string, status: string) => {
        const updatedEntries = entries.map(entry => {
            if (entry.cast_id === castId) {
                return {
                    ...entry,
                    days: { ...entry.days, [date]: status as any }
                };
            }
            return entry;
        });

        setEntries(updatedEntries);

        try {
            await fetch(`/api/projects/${projectId}/dood/${castId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, status })
            });
        } catch (error) {
            console.error('Error updating DOOD:', error);
        }
    };

    // Auto-generate from schedule
    const autoGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/dood/generate`, {
                method: 'POST'
            });
            if (res.ok) {
                const data = await res.json();
                setEntries(data.entries || []);
                setShootDays(data.shoot_days || []);
            }
        } catch (error) {
            console.error('Error generating DOOD:', error);
        } finally {
            setLoading(false);
        }
    };

    // Export DOOD
    const exportDOOD = async (format: 'pdf' | 'xlsx') => {
        try {
            const res = await fetch(`/api/projects/${projectId}/dood/export?format=${format}`);
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `day_out_of_days.${format}`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error exporting:', error);
        }
    };

    // Navigate days
    const canGoBack = viewStart > 0;
    const canGoForward = viewStart + visibleDays < shootDays.length;

    // Filter entries
    const filteredEntries = filterRole === 'all'
        ? entries
        : entries.filter(e => e.role.toLowerCase().includes(filterRole.toLowerCase()));

    // Get unique roles
    const roles = [...new Set(entries.map(e => e.role))];

    // Get visible days
    const visibleShootDays = shootDays.slice(viewStart, viewStart + visibleDays);

    // Get status color
    const getStatusColor = (status: string) => {
        const config = STATUS_LEGEND.find(s => s.code === status);
        return config?.color || 'bg-white/5';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Calendar className="text-yellow-500" />
                        Day Out of Days
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Cast availability and shooting schedule
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={autoGenerate}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl"
                    >
                        <Grid size={16} />
                        Auto-Generate
                    </button>
                    <button
                        onClick={() => exportDOOD('pdf')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white"
                    >
                        <Download size={16} />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 flex-wrap">
                {STATUS_LEGEND.map((status) => (
                    <div key={status.code} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded text-xs flex items-center justify-center font-bold ${status.color} text-white`}>
                            {status.code}
                        </div>
                        <span className="text-xs text-gray-500">{status.label}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                    >
                        <option value="all">All Roles</option>
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewStart(Math.max(0, viewStart - visibleDays))}
                        disabled={!canGoBack}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30"
                    >
                        <ChevronLeft size={16} className="text-white" />
                    </button>
                    <span className="text-sm text-gray-400">
                        Days {viewStart + 1} - {Math.min(viewStart + visibleDays, shootDays.length)} of {shootDays.length}
                    </span>
                    <button
                        onClick={() => setViewStart(Math.min(shootDays.length - visibleDays, viewStart + visibleDays))}
                        disabled={!canGoForward}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30"
                    >
                        <ChevronRight size={16} className="text-white" />
                    </button>
                </div>
            </div>

            {/* DOOD Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="bg-[#121212] border border-white/5 rounded-xl overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="sticky left-0 bg-[#121212] z-10 p-3 text-left text-sm font-medium text-gray-500 min-w-[200px]">
                                    Cast Member
                                </th>
                                {visibleShootDays.map((day) => (
                                    <th key={day.date} className="p-2 text-center min-w-[50px]">
                                        <div className="text-xs text-gray-500">Day {day.day_number}</div>
                                        <div className="text-xs text-gray-600">
                                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </th>
                                ))}
                                <th className="p-3 text-center text-sm font-medium text-gray-500 min-w-[60px]">Work</th>
                                <th className="p-3 text-center text-sm font-medium text-gray-500 min-w-[60px]">Hold</th>
                                <th className="p-3 text-center text-sm font-medium text-gray-500 min-w-[80px]">Start</th>
                                <th className="p-3 text-center text-sm font-medium text-gray-500 min-w-[80px]">Finish</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEntries.map((entry) => (
                                <tr key={entry.cast_id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="sticky left-0 bg-[#121212] z-10 p-3">
                                        <p className="text-white font-medium">{entry.cast_name}</p>
                                        <p className="text-xs text-gray-500">{entry.role}</p>
                                    </td>
                                    {visibleShootDays.map((day) => {
                                        const status = entry.days[day.date] || '';
                                        return (
                                            <td key={day.date} className="p-1 text-center">
                                                <select
                                                    value={status}
                                                    onChange={(e) => updateEntry(entry.cast_id, day.date, e.target.value)}
                                                    className={`w-10 h-10 rounded text-xs font-bold text-center ${getStatusColor(status)} ${
                                                        status ? 'text-white' : 'text-gray-600'
                                                    }`}
                                                >
                                                    <option value="">-</option>
                                                    {STATUS_LEGEND.map(s => (
                                                        <option key={s.code} value={s.code}>{s.code}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        );
                                    })}
                                    <td className="p-3 text-center">
                                        <span className="text-white font-medium">{entry.total_work_days}</span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="text-orange-400">{entry.total_hold_days}</span>
                                    </td>
                                    <td className="p-3 text-center text-xs text-gray-400">
                                        {entry.start_date ? new Date(entry.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                                    </td>
                                    <td className="p-3 text-center text-xs text-gray-400">
                                        {entry.finish_date ? new Date(entry.finish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Shoot Days</p>
                    <p className="text-2xl font-bold text-white">{shootDays.length}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Cast Members</p>
                    <p className="text-2xl font-bold text-white">{entries.length}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Work Days</p>
                    <p className="text-2xl font-bold text-blue-400">
                        {entries.reduce((sum, e) => sum + e.total_work_days, 0)}
                    </p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Hold Days</p>
                    <p className="text-2xl font-bold text-orange-400">
                        {entries.reduce((sum, e) => sum + e.total_hold_days, 0)}
                    </p>
                </div>
            </div>
        </div>
    );
}
