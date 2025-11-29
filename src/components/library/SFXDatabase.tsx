'use client';

import React, { useState, useEffect } from 'react';
import {
    Flame, Plus, Search, Trash2, X, Loader2, AlertTriangle, User, Shield
} from 'lucide-react';

interface SFXEffect {
    id: string;
    name: string;
    description: string;
    type: 'pyro' | 'mechanical' | 'atmospheric' | 'prosthetic' | 'breakaway' | 'rain_wind' | 'snow' | 'fog' | 'other';
    risk_level: 'low' | 'medium' | 'high' | 'extreme';
    scene_id?: string;
    
    // Personnel
    sfx_supervisor?: string;
    technicians?: string[];
    
    // Safety
    permits_required: boolean;
    fire_marshal_required: boolean;
    safety_meeting_required: boolean;
    emergency_procedures?: string;
    
    // Equipment & Materials
    equipment_needed: string[];
    materials: string[];
    consumables: string[];
    
    // Cost
    estimated_cost?: number;
    vendor?: string;
    
    // Timing
    setup_time?: number; // minutes
    reset_time?: number;
    
    notes?: string;
    status: 'planning' | 'approved' | 'ready' | 'completed';
    image_url?: string;
    created_at: string;
}

interface SFXDatabaseProps {
    projectId?: string;
}

const SFX_TYPES = {
    pyro: { label: 'Pyrotechnics', icon: '🔥', color: 'bg-red-500/10 text-red-400' },
    mechanical: { label: 'Mechanical', icon: '⚙️', color: 'bg-blue-500/10 text-blue-400' },
    atmospheric: { label: 'Atmospheric', icon: '💨', color: 'bg-gray-500/10 text-gray-400' },
    prosthetic: { label: 'Prosthetic/Gore', icon: '🧟', color: 'bg-purple-500/10 text-purple-400' },
    breakaway: { label: 'Breakaway', icon: '💥', color: 'bg-orange-500/10 text-orange-400' },
    rain_wind: { label: 'Rain/Wind', icon: '🌧️', color: 'bg-cyan-500/10 text-cyan-400' },
    snow: { label: 'Snow', icon: '❄️', color: 'bg-blue-500/10 text-blue-400' },
    fog: { label: 'Fog/Smoke', icon: '🌫️', color: 'bg-gray-500/10 text-gray-400' },
    other: { label: 'Other', icon: '✨', color: 'bg-yellow-500/10 text-yellow-400' }
};

const RISK_LEVELS = {
    low: { label: 'Low', color: 'bg-green-500/10 text-green-400' },
    medium: { label: 'Medium', color: 'bg-yellow-500/10 text-yellow-400' },
    high: { label: 'High', color: 'bg-orange-500/10 text-orange-400' },
    extreme: { label: 'Extreme', color: 'bg-red-500/10 text-red-400' }
};

export default function SFXDatabase({ projectId }: SFXDatabaseProps) {
    const [effects, setEffects] = useState<SFXEffect[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const [form, setForm] = useState({
        name: '',
        description: '',
        type: 'atmospheric' as SFXEffect['type'],
        risk_level: 'low' as SFXEffect['risk_level'],
        sfx_supervisor: '',
        permits_required: false,
        fire_marshal_required: false,
        safety_meeting_required: false,
        equipment_needed: '',
        materials: '',
        estimated_cost: 0,
        setup_time: 30,
        notes: ''
    });

    useEffect(() => {
        const fetchEffects = async () => {
            try {
                const url = projectId ? `/api/projects/${projectId}/sfx` : '/api/library/sfx';
                const res = await fetch(url);
                if (res.ok) setEffects(await res.json());
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEffects();
    }, [projectId]);

    const addEffect = async () => {
        const newEffect: SFXEffect = {
            id: crypto.randomUUID(),
            ...form,
            equipment_needed: form.equipment_needed.split(',').map(e => e.trim()).filter(Boolean),
            materials: form.materials.split(',').map(m => m.trim()).filter(Boolean),
            consumables: [],
            status: 'planning',
            created_at: new Date().toISOString()
        };

        setEffects(prev => [...prev, newEffect]);
        setShowAddModal(false);
    };

    const deleteEffect = (id: string) => {
        if (confirm('Delete this effect?')) {
            setEffects(prev => prev.filter(e => e.id !== id));
        }
    };

    const stats = {
        total: effects.length,
        highRisk: effects.filter(e => e.risk_level === 'high' || e.risk_level === 'extreme').length,
        pyro: effects.filter(e => e.type === 'pyro').length
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Flame className="text-yellow-500" />
                        Special Effects (SFX)
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Practical special effects</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl">
                    <Plus size={18} />
                    Add Effect
                </button>
            </div>

            {stats.highRisk > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="text-red-500" size={20} />
                    <p className="text-sm text-red-400">
                        {stats.highRisk} high/extreme risk effect(s) require additional safety measures
                    </p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Effects</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Pyrotechnics</p>
                    <p className="text-2xl font-bold text-red-400">{stats.pyro}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">High Risk</p>
                    <p className="text-2xl font-bold text-orange-400">{stats.highRisk}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {effects.map(effect => {
                        const typeConfig = SFX_TYPES[effect.type];
                        const riskConfig = RISK_LEVELS[effect.risk_level];
                        return (
                            <div key={effect.id} className={`bg-[#121212] border rounded-xl p-4 ${effect.risk_level === 'extreme' ? 'border-red-500/30' : 'border-white/5'}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="text-3xl">{typeConfig.icon}</div>
                                    <div className="flex gap-1">
                                        <span className={`px-2 py-0.5 rounded text-xs ${typeConfig.color}`}>{typeConfig.label}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${riskConfig.color}`}>{riskConfig.label}</span>
                                    </div>
                                </div>
                                <h3 className="text-white font-bold">{effect.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{effect.description}</p>
                                
                                {effect.sfx_supervisor && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                                        <User size={12} /> {effect.sfx_supervisor}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 mt-3">
                                    {effect.permits_required && <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded text-xs">Permit</span>}
                                    {effect.fire_marshal_required && <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded text-xs">Fire Marshal</span>}
                                </div>

                                <div className="flex justify-end mt-3 pt-3 border-t border-white/5">
                                    <button onClick={() => deleteEffect(effect.id)} className="p-1.5 text-gray-500 hover:text-red-400">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add SFX Effect</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Effect name" className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white" />
                            <div className="grid grid-cols-2 gap-4">
                                <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value as any})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white">
                                    {Object.entries(SFX_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                                </select>
                                <select value={form.risk_level} onChange={(e) => setForm({...form, risk_level: e.target.value as any})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white">
                                    {Object.entries(RISK_LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </div>
                            <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Description" rows={2} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white resize-none" />
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2"><input type="checkbox" checked={form.permits_required} onChange={(e) => setForm({...form, permits_required: e.target.checked})} /><span className="text-sm text-gray-400">Permits Required</span></label>
                                <label className="flex items-center gap-2"><input type="checkbox" checked={form.fire_marshal_required} onChange={(e) => setForm({...form, fire_marshal_required: e.target.checked})} /><span className="text-sm text-red-400">Fire Marshal</span></label>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400">Cancel</button>
                            <button onClick={addEffect} disabled={!form.name} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50">Add Effect</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
