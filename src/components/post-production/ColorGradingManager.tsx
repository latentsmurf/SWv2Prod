'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Plus, Search, Trash2, Download, Upload, X, Loader2, Eye } from 'lucide-react';

interface LUT {
    id: string;
    name: string;
    description?: string;
    type: 'technical' | 'creative' | 'camera' | 'display' | 'custom';
    format: 'cube' | '3dl' | 'look' | 'csp';
    input_colorspace?: string;
    output_colorspace?: string;
    file_url?: string;
    preview_url?: string;
    tags?: string[];
    created_at: string;
}

interface ColorGrade {
    id: string;
    name: string;
    description?: string;
    scene_id?: string;
    base_lut?: string;
    adjustments: {
        exposure?: number;
        contrast?: number;
        saturation?: number;
        temperature?: number;
        tint?: number;
        shadows?: number;
        highlights?: number;
    };
    preview_url?: string;
    status: 'draft' | 'approved';
    created_at: string;
}

interface ColorGradingManagerProps {
    projectId: string;
}

const LUT_TYPES = {
    technical: { label: 'Technical', color: 'bg-blue-500/10 text-blue-400' },
    creative: { label: 'Creative', color: 'bg-purple-500/10 text-purple-400' },
    camera: { label: 'Camera', color: 'bg-green-500/10 text-green-400' },
    display: { label: 'Display', color: 'bg-orange-500/10 text-orange-400' },
    custom: { label: 'Custom', color: 'bg-yellow-500/10 text-yellow-400' }
};

export default function ColorGradingManager({ projectId }: ColorGradingManagerProps) {
    const [luts, setLuts] = useState<LUT[]>([]);
    const [grades, setGrades] = useState<ColorGrade[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'luts' | 'grades'>('luts');
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [form, setForm] = useState({
        name: '',
        description: '',
        type: 'creative' as LUT['type'],
        format: 'cube' as LUT['format'],
        input_colorspace: 'Log',
        output_colorspace: 'Rec.709',
        tags: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lutsRes, gradesRes] = await Promise.all([
                    fetch(`/api/projects/${projectId}/luts`),
                    fetch(`/api/projects/${projectId}/color-grades`)
                ]);
                if (lutsRes.ok) setLuts(await lutsRes.json());
                if (gradesRes.ok) setGrades(await gradesRes.json());
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [projectId]);

    const addLUT = () => {
        const newLUT: LUT = {
            id: crypto.randomUUID(),
            name: form.name,
            description: form.description,
            type: form.type,
            format: form.format,
            input_colorspace: form.input_colorspace,
            output_colorspace: form.output_colorspace,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            created_at: new Date().toISOString()
        };
        setLuts(prev => [...prev, newLUT]);
        setShowAddModal(false);
    };

    const deleteLUT = (id: string) => {
        if (confirm('Delete this LUT?')) {
            setLuts(prev => prev.filter(l => l.id !== id));
        }
    };

    const filteredLuts = luts.filter(lut => 
        searchQuery ? lut.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Palette className="text-yellow-500" />
                        Color & LUT Manager
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Manage LUTs and color grades</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl">
                    <Plus size={18} />
                    Add LUT
                </button>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex bg-white/5 rounded-xl p-1">
                    {(['luts', 'grades'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm ${activeTab === tab ? 'bg-yellow-500 text-black' : 'text-gray-400'}`}>
                            {tab === 'luts' ? 'LUTs' : 'Color Grades'}
                        </button>
                    ))}
                </div>
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white" />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="animate-spin text-yellow-500" size={32} /></div>
            ) : activeTab === 'luts' ? (
                <div className="grid grid-cols-4 gap-4">
                    {filteredLuts.map(lut => {
                        const typeConfig = LUT_TYPES[lut.type];
                        return (
                            <div key={lut.id} className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden hover:border-white/20">
                                <div className="aspect-video bg-gradient-to-br from-orange-500/20 via-purple-500/20 to-blue-500/20 relative flex items-center justify-center">
                                    <span className="text-4xl">🎨</span>
                                    <div className="absolute top-2 left-2">
                                        <span className={`px-2 py-1 rounded text-xs ${typeConfig.color}`}>{typeConfig.label}</span>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <span className="px-2 py-1 bg-black/50 text-white rounded text-xs uppercase">.{lut.format}</span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-white font-bold">{lut.name}</h3>
                                    {lut.input_colorspace && lut.output_colorspace && (
                                        <p className="text-xs text-gray-500 mt-1">{lut.input_colorspace} → {lut.output_colorspace}</p>
                                    )}
                                    {lut.tags && lut.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {lut.tags.slice(0, 3).map((tag, i) => (
                                                <span key={i} className="px-1.5 py-0.5 bg-white/5 rounded text-xs text-gray-400">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                        <button className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded"><Download size={14} /></button>
                                        <button onClick={() => deleteLUT(lut.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {grades.map(grade => (
                        <div key={grade.id} className="bg-[#121212] border border-white/5 rounded-xl p-4">
                            <h3 className="text-white font-bold">{grade.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{grade.description}</p>
                            <div className="flex gap-2 mt-3">
                                <span className={`px-2 py-1 rounded text-xs ${grade.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                    {grade.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Add LUT</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="LUT name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                            <div className="grid grid-cols-2 gap-4">
                                <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value as any})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                                    {Object.entries(LUT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                                <select value={form.format} onChange={(e) => setForm({...form, format: e.target.value as any})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                                    <option value="cube">.cube</option>
                                    <option value="3dl">.3dl</option>
                                    <option value="look">.look</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" value={form.input_colorspace} onChange={(e) => setForm({...form, input_colorspace: e.target.value})} placeholder="Input colorspace" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                                <input type="text" value={form.output_colorspace} onChange={(e) => setForm({...form, output_colorspace: e.target.value})} placeholder="Output colorspace" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                            </div>
                            <input type="text" value={form.tags} onChange={(e) => setForm({...form, tags: e.target.value})} placeholder="Tags (comma-separated)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400">Cancel</button>
                            <button onClick={addLUT} disabled={!form.name} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50">Add LUT</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
