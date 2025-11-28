'use client';

import React, { useState, useEffect } from 'react';
import {
    MapPin, Plus, Search, Star, Image, Camera, Check, X,
    Loader2, Navigation, Clock, DollarSign, Phone, Mail,
    ChevronRight, Grid, List, Filter, Upload, Trash2
} from 'lucide-react';

interface ScoutLocation {
    id: string;
    name: string;
    address: string;
    coordinates?: { lat: number; lng: number };
    type: 'interior' | 'exterior' | 'studio' | 'practical';
    status: 'scouting' | 'pending' | 'approved' | 'rejected';
    rating: number;
    photos: string[];
    notes: string;
    contact?: {
        name: string;
        phone?: string;
        email?: string;
    };
    availability?: string;
    cost_estimate?: number;
    scenes: string[];
    pros: string[];
    cons: string[];
    created_at: string;
}

interface LocationScoutingProps {
    projectId: string;
}

const LOCATION_TYPES = [
    { id: 'interior', label: 'Interior' },
    { id: 'exterior', label: 'Exterior' },
    { id: 'studio', label: 'Studio' },
    { id: 'practical', label: 'Practical' }
];

const STATUS_CONFIG = {
    scouting: { label: 'Scouting', color: 'bg-blue-500/10 text-blue-400' },
    pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-400' },
    approved: { label: 'Approved', color: 'bg-green-500/10 text-green-400' },
    rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-400' }
};

export default function LocationScouting({ projectId }: LocationScoutingProps) {
    const [locations, setLocations] = useState<ScoutLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState<ScoutLocation | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Editor form state
    const [form, setForm] = useState<Partial<ScoutLocation>>({
        name: '',
        address: '',
        type: 'interior',
        status: 'scouting',
        rating: 0,
        photos: [],
        notes: '',
        pros: [],
        cons: [],
        scenes: []
    });

    const [newPro, setNewPro] = useState('');
    const [newCon, setNewCon] = useState('');

    // Fetch locations
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/locations`);
                if (res.ok) {
                    setLocations(await res.json());
                }
            } catch (error) {
                console.error('Error fetching locations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, [projectId]);

    // Save location
    const saveLocation = async () => {
        try {
            const url = selectedLocation
                ? `/api/projects/${projectId}/locations/${selectedLocation.id}`
                : `/api/projects/${projectId}/locations`;

            const res = await fetch(url, {
                method: selectedLocation ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                const saved = await res.json();
                if (selectedLocation) {
                    setLocations(prev => prev.map(l => l.id === saved.id ? saved : l));
                } else {
                    setLocations(prev => [...prev, saved]);
                }
                setShowEditor(false);
                setSelectedLocation(null);
            }
        } catch (error) {
            console.error('Error saving location:', error);
        }
    };

    // Update status
    const updateStatus = async (locationId: string, status: ScoutLocation['status']) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/locations/${locationId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                setLocations(prev => prev.map(l =>
                    l.id === locationId ? { ...l, status } : l
                ));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Delete location
    const deleteLocation = async (locationId: string) => {
        if (!confirm('Delete this location?')) return;

        try {
            const res = await fetch(`/api/projects/${projectId}/locations/${locationId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setLocations(prev => prev.filter(l => l.id !== locationId));
                if (selectedLocation?.id === locationId) {
                    setSelectedLocation(null);
                }
            }
        } catch (error) {
            console.error('Error deleting location:', error);
        }
    };

    // Filter locations
    const filteredLocations = locations.filter(loc => {
        if (filterType !== 'all' && loc.type !== filterType) return false;
        if (filterStatus !== 'all' && loc.status !== filterStatus) return false;
        if (searchQuery && !loc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Render star rating
    const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => interactive && onChange?.(star)}
                        disabled={!interactive}
                        className={`${interactive ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                        <Star
                            size={16}
                            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                        />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="h-full flex">
            {/* Sidebar */}
            <div className="w-96 border-r border-white/5 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <MapPin className="text-yellow-500" />
                            Location Scouting
                        </h2>
                        <button
                            onClick={() => {
                                setSelectedLocation(null);
                                setForm({
                                    name: '',
                                    address: '',
                                    type: 'interior',
                                    status: 'scouting',
                                    rating: 0,
                                    photos: [],
                                    notes: '',
                                    pros: [],
                                    cons: [],
                                    scenes: []
                                });
                                setShowEditor(true);
                            }}
                            className="p-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search locations..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white text-sm"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        >
                            <option value="all">All Types</option>
                            {LOCATION_TYPES.map(t => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        >
                            <option value="all">All Status</option>
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Locations List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="mx-auto animate-spin text-yellow-500" size={24} />
                        </div>
                    ) : filteredLocations.length === 0 ? (
                        <div className="p-8 text-center">
                            <MapPin className="mx-auto text-gray-600 mb-2" size={32} />
                            <p className="text-sm text-gray-500">No locations found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {filteredLocations.map((location) => (
                                <button
                                    key={location.id}
                                    onClick={() => setSelectedLocation(location)}
                                    className={`w-full text-left p-4 hover:bg-white/5 ${
                                        selectedLocation?.id === location.id ? 'bg-white/5' : ''
                                    }`}
                                >
                                    <div className="flex gap-3">
                                        {location.photos[0] ? (
                                            <img
                                                src={location.photos[0]}
                                                alt={location.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center">
                                                <Camera className="text-gray-600" size={24} />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-white font-medium truncate">{location.name}</p>
                                                <span className={`px-2 py-0.5 rounded text-xs ${STATUS_CONFIG[location.status].color}`}>
                                                    {STATUS_CONFIG[location.status].label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate mb-1">{location.address}</p>
                                            {renderStars(location.rating)}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Panel */}
            <div className="flex-1 overflow-y-auto">
                {selectedLocation ? (
                    <div className="p-6">
                        {/* Photos */}
                        {selectedLocation.photos.length > 0 && (
                            <div className="mb-6">
                                <div className="grid grid-cols-3 gap-2">
                                    {selectedLocation.photos.map((photo, index) => (
                                        <img
                                            key={index}
                                            src={photo}
                                            alt={`${selectedLocation.name} ${index + 1}`}
                                            className="w-full aspect-video object-cover rounded-xl"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">{selectedLocation.name}</h3>
                                <p className="text-gray-400 flex items-center gap-2 mb-2">
                                    <MapPin size={16} />
                                    {selectedLocation.address}
                                </p>
                                {renderStars(selectedLocation.rating)}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setForm(selectedLocation);
                                        setShowEditor(true);
                                    }}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteLocation(selectedLocation.id)}
                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Status Actions */}
                        <div className="flex items-center gap-2 mb-6">
                            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                                <button
                                    key={status}
                                    onClick={() => updateStatus(selectedLocation.id, status as any)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                        selectedLocation.status === status
                                            ? config.color
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    {config.label}
                                </button>
                            ))}
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            {/* Contact */}
                            {selectedLocation.contact && (
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <h4 className="text-sm font-medium text-gray-400 mb-3">Contact</h4>
                                    <p className="text-white mb-1">{selectedLocation.contact.name}</p>
                                    {selectedLocation.contact.phone && (
                                        <p className="text-sm text-gray-400 flex items-center gap-2">
                                            <Phone size={14} />
                                            {selectedLocation.contact.phone}
                                        </p>
                                    )}
                                    {selectedLocation.contact.email && (
                                        <p className="text-sm text-gray-400 flex items-center gap-2">
                                            <Mail size={14} />
                                            {selectedLocation.contact.email}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Cost */}
                            {selectedLocation.cost_estimate && (
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <h4 className="text-sm font-medium text-gray-400 mb-3">Estimated Cost</h4>
                                    <p className="text-2xl font-bold text-white flex items-center gap-1">
                                        <DollarSign size={20} />
                                        {selectedLocation.cost_estimate.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">per day</p>
                                </div>
                            )}
                        </div>

                        {/* Pros & Cons */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-green-500/10 rounded-xl">
                                <h4 className="text-sm font-medium text-green-400 mb-3">Pros</h4>
                                {selectedLocation.pros.length === 0 ? (
                                    <p className="text-sm text-gray-500">No pros listed</p>
                                ) : (
                                    <ul className="space-y-1">
                                        {selectedLocation.pros.map((pro, i) => (
                                            <li key={i} className="text-sm text-green-300 flex items-center gap-2">
                                                <Check size={14} />
                                                {pro}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="p-4 bg-red-500/10 rounded-xl">
                                <h4 className="text-sm font-medium text-red-400 mb-3">Cons</h4>
                                {selectedLocation.cons.length === 0 ? (
                                    <p className="text-sm text-gray-500">No cons listed</p>
                                ) : (
                                    <ul className="space-y-1">
                                        {selectedLocation.cons.map((con, i) => (
                                            <li key={i} className="text-sm text-red-300 flex items-center gap-2">
                                                <X size={14} />
                                                {con}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        {selectedLocation.notes && (
                            <div className="p-4 bg-white/5 rounded-xl">
                                <h4 className="text-sm font-medium text-gray-400 mb-3">Notes</h4>
                                <p className="text-gray-300 whitespace-pre-wrap">{selectedLocation.notes}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <MapPin className="mx-auto mb-4" size={48} />
                            <p>Select a location to view details</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Editor Modal */}
            {showEditor && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">
                                {selectedLocation ? 'Edit Location' : 'Add Location'}
                            </h3>
                            <button
                                onClick={() => setShowEditor(false)}
                                className="p-2 text-gray-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={form.name || ''}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Type</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {LOCATION_TYPES.map(t => (
                                            <option key={t.id} value={t.id}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Address</label>
                                <input
                                    type="text"
                                    value={form.address || ''}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Rating</label>
                                {renderStars(form.rating || 0, true, (r) => setForm({ ...form, rating: r }))}
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Notes</label>
                                <textarea
                                    value={form.notes || ''}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                />
                            </div>

                            {/* Pros */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Pros</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newPro}
                                        onChange={(e) => setNewPro(e.target.value)}
                                        placeholder="Add a pro..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && newPro.trim()) {
                                                setForm({ ...form, pros: [...(form.pros || []), newPro] });
                                                setNewPro('');
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            if (newPro.trim()) {
                                                setForm({ ...form, pros: [...(form.pros || []), newPro] });
                                                setNewPro('');
                                            }
                                        }}
                                        className="px-3 py-2 bg-green-500/10 text-green-400 rounded-lg"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {form.pros?.map((pro, i) => (
                                        <span key={i} className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 rounded text-sm">
                                            {pro}
                                            <button onClick={() => setForm({ ...form, pros: form.pros?.filter((_, idx) => idx !== i) })}>
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Cons */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Cons</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newCon}
                                        onChange={(e) => setNewCon(e.target.value)}
                                        placeholder="Add a con..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && newCon.trim()) {
                                                setForm({ ...form, cons: [...(form.cons || []), newCon] });
                                                setNewCon('');
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            if (newCon.trim()) {
                                                setForm({ ...form, cons: [...(form.cons || []), newCon] });
                                                setNewCon('');
                                            }
                                        }}
                                        className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {form.cons?.map((con, i) => (
                                        <span key={i} className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 rounded text-sm">
                                            {con}
                                            <button onClick={() => setForm({ ...form, cons: form.cons?.filter((_, idx) => idx !== i) })}>
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowEditor(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveLocation}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                            >
                                Save Location
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
