'use client';

import React, { useState, useEffect } from 'react';
import {
    Camera, Plus, Search, Filter, Trash2, Eye, X,
    Loader2, DollarSign, Settings, Aperture, Focus, Box
} from 'lucide-react';

interface CameraItem {
    id: string;
    name: string;
    type: 'camera' | 'lens' | 'filter' | 'monitor' | 'recorder' | 'accessory';
    category?: string;
    
    // Camera specific
    camera_make?: string;
    camera_model?: string;
    sensor_size?: string;
    resolution?: string;
    frame_rates?: string[];
    codec?: string;
    
    // Lens specific
    lens_make?: string;
    lens_model?: string;
    focal_length?: string;
    max_aperture?: string;
    lens_mount?: string;
    is_prime: boolean;
    is_anamorphic: boolean;
    
    // General
    serial_number?: string;
    condition: 'new' | 'excellent' | 'good' | 'fair' | 'rental';
    source: 'owned' | 'rented' | 'borrowed';
    vendor?: string;
    daily_rate?: number;
    insurance_value?: number;
    
    image_url?: string;
    notes?: string;
    status: 'available' | 'in_use' | 'prep' | 'maintenance' | 'returned';
    assigned_to?: string;
    created_at: string;
}

interface CameraLensDatabaseProps {
    projectId?: string;
    onSelect?: (item: CameraItem) => void;
    selectionMode?: boolean;
}

const ITEM_TYPES = {
    camera: { label: 'Camera Body', icon: '📹', color: 'bg-blue-500/10 text-blue-400' },
    lens: { label: 'Lens', icon: '🔭', color: 'bg-purple-500/10 text-purple-400' },
    filter: { label: 'Filter', icon: '🔲', color: 'bg-cyan-500/10 text-cyan-400' },
    monitor: { label: 'Monitor', icon: '📺', color: 'bg-green-500/10 text-green-400' },
    recorder: { label: 'Recorder', icon: '💾', color: 'bg-orange-500/10 text-orange-400' },
    accessory: { label: 'Accessory', icon: '🔧', color: 'bg-gray-500/10 text-gray-400' }
};

const STATUS_CONFIG = {
    available: { label: 'Available', color: 'bg-green-500/10 text-green-400' },
    in_use: { label: 'In Use', color: 'bg-blue-500/10 text-blue-400' },
    prep: { label: 'In Prep', color: 'bg-yellow-500/10 text-yellow-400' },
    maintenance: { label: 'Maintenance', color: 'bg-red-500/10 text-red-400' },
    returned: { label: 'Returned', color: 'bg-gray-500/10 text-gray-400' }
};

const COMMON_CAMERAS = [
    'ARRI ALEXA Mini LF', 'ARRI ALEXA 35', 'RED V-RAPTOR', 'RED KOMODO',
    'Sony VENICE', 'Sony FX6', 'Sony FX3', 'Canon C70', 'Canon C300 III',
    'Blackmagic URSA Mini Pro', 'Panasonic S1H'
];

const COMMON_LENSES = [
    'Cooke S4/i', 'Zeiss Supreme Prime', 'ARRI Signature Prime', 'Panavision Primo',
    'Canon Sumire', 'Zeiss CP.3', 'Sigma Cine', 'Cooke Anamorphic'
];

export default function CameraLensDatabase({ projectId, onSelect, selectionMode }: CameraLensDatabaseProps) {
    const [items, setItems] = useState<CameraItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CameraItem | null>(null);

    // Form state
    const [form, setForm] = useState({
        name: '',
        type: 'camera' as CameraItem['type'],
        camera_make: '',
        camera_model: '',
        sensor_size: '',
        resolution: '',
        frame_rates: '',
        lens_make: '',
        lens_model: '',
        focal_length: '',
        max_aperture: '',
        lens_mount: '',
        is_prime: true,
        is_anamorphic: false,
        serial_number: '',
        condition: 'excellent' as CameraItem['condition'],
        source: 'rented' as CameraItem['source'],
        vendor: '',
        daily_rate: 0,
        insurance_value: 0,
        image_url: '',
        notes: ''
    });

    // Fetch items
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const url = projectId 
                    ? `/api/projects/${projectId}/camera-equipment`
                    : '/api/library/camera-equipment';
                const res = await fetch(url);
                if (res.ok) {
                    setItems(await res.json());
                }
            } catch (error) {
                console.error('Error fetching equipment:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [projectId]);

    // Filter items
    const filteredItems = items.filter(item => {
        if (filterType !== 'all' && item.type !== filterType) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return item.name.toLowerCase().includes(query) ||
                item.camera_make?.toLowerCase().includes(query) ||
                item.lens_make?.toLowerCase().includes(query);
        }
        return true;
    });

    // Add item
    const addItem = async () => {
        const itemName = form.type === 'camera' 
            ? `${form.camera_make} ${form.camera_model}`.trim() || form.name
            : form.type === 'lens'
            ? `${form.lens_make} ${form.focal_length}`.trim() || form.name
            : form.name;

        const newItem: CameraItem = {
            id: crypto.randomUUID(),
            name: itemName,
            type: form.type,
            camera_make: form.camera_make,
            camera_model: form.camera_model,
            sensor_size: form.sensor_size,
            resolution: form.resolution,
            frame_rates: form.frame_rates.split(',').map(f => f.trim()).filter(Boolean),
            lens_make: form.lens_make,
            lens_model: form.lens_model,
            focal_length: form.focal_length,
            max_aperture: form.max_aperture,
            lens_mount: form.lens_mount,
            is_prime: form.is_prime,
            is_anamorphic: form.is_anamorphic,
            serial_number: form.serial_number,
            condition: form.condition,
            source: form.source,
            vendor: form.vendor,
            daily_rate: form.daily_rate,
            insurance_value: form.insurance_value,
            image_url: form.image_url,
            notes: form.notes,
            status: 'available',
            created_at: new Date().toISOString()
        };

        setItems(prev => [...prev, newItem]);
        setShowAddModal(false);
        resetForm();

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/camera-equipment`
                : '/api/library/camera-equipment';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    // Update status
    const updateStatus = async (itemId: string, status: CameraItem['status']) => {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, status } : i));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/camera-equipment/${itemId}`
                : `/api/library/camera-equipment/${itemId}`;
            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Delete item
    const deleteItem = async (itemId: string) => {
        if (!confirm('Delete this item?')) return;

        setItems(prev => prev.filter(i => i.id !== itemId));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/camera-equipment/${itemId}`
                : `/api/library/camera-equipment/${itemId}`;
            await fetch(url, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setForm({
            name: '', type: 'camera', camera_make: '', camera_model: '',
            sensor_size: '', resolution: '', frame_rates: '', lens_make: '',
            lens_model: '', focal_length: '', max_aperture: '', lens_mount: '',
            is_prime: true, is_anamorphic: false, serial_number: '',
            condition: 'excellent', source: 'rented', vendor: '',
            daily_rate: 0, insurance_value: 0, image_url: '', notes: ''
        });
    };

    // Stats
    const stats = {
        cameras: items.filter(i => i.type === 'camera').length,
        lenses: items.filter(i => i.type === 'lens').length,
        inUse: items.filter(i => i.status === 'in_use').length,
        totalDailyRate: items.reduce((sum, i) => sum + (i.daily_rate || 0), 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Camera className="text-yellow-500" />
                        Camera & Lens Database
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage camera bodies, lenses, and accessories
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                >
                    <Plus size={18} />
                    Add Equipment
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Camera Bodies</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.cameras}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Lenses</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.lenses}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">In Use</p>
                    <p className="text-2xl font-bold text-green-400">{stats.inUse}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Daily Rate</p>
                    <p className="text-2xl font-bold text-yellow-400">${stats.totalDailyRate.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search equipment..."
                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-white"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Types</option>
                    {Object.entries(ITEM_TYPES).map(([key, config]) => (
                        <option key={key} value={key}>{config.icon} {config.label}</option>
                    ))}
                </select>
            </div>

            {/* Items Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-4">
                    {filteredItems.length === 0 ? (
                        <div className="col-span-4 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-8 text-center text-gray-500">
                            No equipment found
                        </div>
                    ) : (
                        filteredItems.map((item) => {
                            const typeConfig = ITEM_TYPES[item.type];
                            const statusConfig = STATUS_CONFIG[item.status];

                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-colors ${
                                        selectionMode ? 'cursor-pointer' : ''
                                    }`}
                                    onClick={() => selectionMode && onSelect?.(item)}
                                >
                                    {/* Image */}
                                    <div className="aspect-square bg-white/5 relative">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl">
                                                {typeConfig.icon}
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2">
                                            <span className={`px-2 py-1 rounded text-xs ${typeConfig.color}`}>
                                                {typeConfig.label}
                                            </span>
                                        </div>
                                        {item.is_anamorphic && (
                                            <div className="absolute top-2 right-2">
                                                <span className="px-2 py-1 bg-purple-500 text-white rounded text-xs font-bold">
                                                    ANAM
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 left-2">
                                            <span className={`px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="text-gray-900 dark:text-white font-bold truncate">{item.name}</h3>
                                        
                                        {/* Camera-specific */}
                                        {item.type === 'camera' && (
                                            <div className="mt-1">
                                                {item.sensor_size && (
                                                    <p className="text-sm text-gray-400">{item.sensor_size}</p>
                                                )}
                                                {item.resolution && (
                                                    <p className="text-xs text-gray-500">{item.resolution}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Lens-specific */}
                                        {item.type === 'lens' && (
                                            <div className="mt-1 flex items-center gap-2">
                                                {item.focal_length && (
                                                    <span className="flex items-center gap-1 text-sm text-cyan-400">
                                                        <Focus size={12} />
                                                        {item.focal_length}
                                                    </span>
                                                )}
                                                {item.max_aperture && (
                                                    <span className="flex items-center gap-1 text-sm text-yellow-400">
                                                        <Aperture size={12} />
                                                        {item.max_aperture}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Rate */}
                                        {item.daily_rate && (
                                            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                                <DollarSign size={12} />
                                                {item.daily_rate}/day
                                            </p>
                                        )}

                                        {/* Actions */}
                                        {!selectionMode && (
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => updateStatus(item.id, e.target.value as any)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs bg-transparent border-none text-gray-400"
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                                                        className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                                                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#121212]">
                            <h3 className="text-lg font-bold text-white">Add Equipment</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Equipment Type</label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                >
                                    {Object.entries(ITEM_TYPES).map(([key, config]) => (
                                        <option key={key} value={key}>{config.icon} {config.label}</option>
                                    ))}
                                </select>
                            </div>

                            {form.type === 'camera' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Camera Make</label>
                                            <input
                                                type="text"
                                                value={form.camera_make}
                                                onChange={(e) => setForm({ ...form, camera_make: e.target.value })}
                                                list="camera-makes"
                                                placeholder="e.g., ARRI, RED"
                                                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                            />
                                            <datalist id="camera-makes">
                                                {['ARRI', 'RED', 'Sony', 'Canon', 'Blackmagic', 'Panasonic'].map(m => (
                                                    <option key={m} value={m} />
                                                ))}
                                            </datalist>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Camera Model</label>
                                            <input
                                                type="text"
                                                value={form.camera_model}
                                                onChange={(e) => setForm({ ...form, camera_model: e.target.value })}
                                                placeholder="e.g., ALEXA Mini LF"
                                                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Sensor Size</label>
                                            <select
                                                value={form.sensor_size}
                                                onChange={(e) => setForm({ ...form, sensor_size: e.target.value })}
                                                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                            >
                                                <option value="">Select...</option>
                                                <option value="Full Frame">Full Frame</option>
                                                <option value="Large Format">Large Format</option>
                                                <option value="Super 35">Super 35</option>
                                                <option value="APS-C">APS-C</option>
                                                <option value="Micro Four Thirds">Micro Four Thirds</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Resolution</label>
                                            <input
                                                type="text"
                                                value={form.resolution}
                                                onChange={(e) => setForm({ ...form, resolution: e.target.value })}
                                                placeholder="e.g., 8K, 6K, 4K"
                                                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {form.type === 'lens' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Lens Make</label>
                                            <input
                                                type="text"
                                                value={form.lens_make}
                                                onChange={(e) => setForm({ ...form, lens_make: e.target.value })}
                                                placeholder="e.g., Cooke, Zeiss"
                                                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Focal Length</label>
                                            <input
                                                type="text"
                                                value={form.focal_length}
                                                onChange={(e) => setForm({ ...form, focal_length: e.target.value })}
                                                placeholder="e.g., 50mm, 24-70mm"
                                                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Max Aperture</label>
                                            <input
                                                type="text"
                                                value={form.max_aperture}
                                                onChange={(e) => setForm({ ...form, max_aperture: e.target.value })}
                                                placeholder="e.g., T1.5, f/2.8"
                                                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Lens Mount</label>
                                            <select
                                                value={form.lens_mount}
                                                onChange={(e) => setForm({ ...form, lens_mount: e.target.value })}
                                                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                            >
                                                <option value="">Select...</option>
                                                <option value="PL">PL Mount</option>
                                                <option value="LPL">LPL Mount</option>
                                                <option value="EF">Canon EF</option>
                                                <option value="RF">Canon RF</option>
                                                <option value="E">Sony E</option>
                                            </select>
                                        </div>
                                        <div className="flex items-end gap-4">
                                            <label className="flex items-center gap-2 pb-3">
                                                <input
                                                    type="checkbox"
                                                    checked={form.is_prime}
                                                    onChange={(e) => setForm({ ...form, is_prime: e.target.checked })}
                                                    className="w-4 h-4 rounded"
                                                />
                                                <span className="text-sm text-gray-400">Prime</span>
                                            </label>
                                            <label className="flex items-center gap-2 pb-3">
                                                <input
                                                    type="checkbox"
                                                    checked={form.is_anamorphic}
                                                    onChange={(e) => setForm({ ...form, is_anamorphic: e.target.checked })}
                                                    className="w-4 h-4 rounded"
                                                />
                                                <span className="text-sm text-gray-400">Anamorphic</span>
                                            </label>
                                        </div>
                                    </div>
                                </>
                            )}

                            {(form.type !== 'camera' && form.type !== 'lens') && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Source</label>
                                    <select
                                        value={form.source}
                                        onChange={(e) => setForm({ ...form, source: e.target.value as any })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        <option value="rented">Rented</option>
                                        <option value="owned">Owned</option>
                                        <option value="borrowed">Borrowed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Daily Rate ($)</label>
                                    <input
                                        type="number"
                                        value={form.daily_rate}
                                        onChange={(e) => setForm({ ...form, daily_rate: parseInt(e.target.value) })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Vendor</label>
                                    <input
                                        type="text"
                                        value={form.vendor}
                                        onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Image URL</label>
                                <input
                                    type="text"
                                    value={form.image_url}
                                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-[#121212]">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={addItem}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                            >
                                Add Equipment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
