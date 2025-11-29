'use client';

import React, { useState, useEffect } from 'react';
import {
    Car, Plus, Search, Filter, Edit, Trash2, Eye, X,
    Loader2, DollarSign, Calendar, MapPin, Truck, Plane,
    Ship, Bike, Train
} from 'lucide-react';

interface Vehicle {
    id: string;
    name: string;
    description?: string;
    type: 'car' | 'truck' | 'motorcycle' | 'boat' | 'aircraft' | 'train' | 'specialty' | 'other';
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    license_plate?: string;
    vin?: string;
    condition: 'showroom' | 'excellent' | 'good' | 'fair' | 'weathered' | 'damaged';
    source: 'owned' | 'rented' | 'picture_car';
    vendor?: string;
    vendor_contact?: string;
    daily_rate?: number;
    weekly_rate?: number;
    insurance_required: boolean;
    driver_required: boolean;
    special_equipment?: string[];
    modifications?: string[];
    image_url?: string;
    reference_images: string[];
    scenes?: string[];
    characters?: string[];
    notes?: string;
    is_hero: boolean;
    is_drivable: boolean;
    fuel_type?: string;
    status: 'needed' | 'sourcing' | 'booked' | 'on_set' | 'wrapped' | 'returned';
    availability_start?: string;
    availability_end?: string;
    created_at: string;
}

interface VehiclesDatabaseProps {
    projectId?: string;
    onSelect?: (vehicle: Vehicle) => void;
    selectionMode?: boolean;
}

const VEHICLE_TYPES = {
    car: { label: 'Car', icon: Car, color: 'bg-blue-500/10 text-blue-400' },
    truck: { label: 'Truck/SUV', icon: Truck, color: 'bg-green-500/10 text-green-400' },
    motorcycle: { label: 'Motorcycle', icon: Bike, color: 'bg-orange-500/10 text-orange-400' },
    boat: { label: 'Boat/Watercraft', icon: Ship, color: 'bg-cyan-500/10 text-cyan-400' },
    aircraft: { label: 'Aircraft', icon: Plane, color: 'bg-purple-500/10 text-purple-400' },
    train: { label: 'Train/Rail', icon: Train, color: 'bg-red-500/10 text-red-400' },
    specialty: { label: 'Specialty', icon: Car, color: 'bg-yellow-500/10 text-yellow-400' },
    other: { label: 'Other', icon: Car, color: 'bg-gray-500/10 text-gray-400' }
};

const STATUS_CONFIG = {
    needed: { label: 'Needed', color: 'bg-red-500/10 text-red-400' },
    sourcing: { label: 'Sourcing', color: 'bg-yellow-500/10 text-yellow-400' },
    booked: { label: 'Booked', color: 'bg-blue-500/10 text-blue-400' },
    on_set: { label: 'On Set', color: 'bg-green-500/10 text-green-400' },
    wrapped: { label: 'Wrapped', color: 'bg-purple-500/10 text-purple-400' },
    returned: { label: 'Returned', color: 'bg-gray-500/10 text-gray-400' }
};

export default function VehiclesDatabase({ projectId, onSelect, selectionMode }: VehiclesDatabaseProps) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    // Form state
    const [form, setForm] = useState({
        name: '',
        description: '',
        type: 'car' as Vehicle['type'],
        make: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        license_plate: '',
        condition: 'good' as Vehicle['condition'],
        source: 'rented' as Vehicle['source'],
        vendor: '',
        vendor_contact: '',
        daily_rate: 0,
        insurance_required: true,
        driver_required: false,
        special_equipment: '',
        modifications: '',
        image_url: '',
        notes: '',
        is_hero: false,
        is_drivable: true,
        fuel_type: ''
    });

    // Fetch vehicles
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const url = projectId 
                    ? `/api/projects/${projectId}/vehicles`
                    : '/api/library/vehicles';
                const res = await fetch(url);
                if (res.ok) {
                    setVehicles(await res.json());
                }
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, [projectId]);

    // Filter vehicles
    const filteredVehicles = vehicles.filter(vehicle => {
        if (filterType !== 'all' && vehicle.type !== filterType) return false;
        if (filterStatus !== 'all' && vehicle.status !== filterStatus) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return vehicle.name.toLowerCase().includes(query) ||
                vehicle.make?.toLowerCase().includes(query) ||
                vehicle.model?.toLowerCase().includes(query);
        }
        return true;
    });

    // Add vehicle
    const addVehicle = async () => {
        const newVehicle: Vehicle = {
            id: crypto.randomUUID(),
            name: form.name,
            description: form.description,
            type: form.type,
            make: form.make,
            model: form.model,
            year: form.year,
            color: form.color,
            license_plate: form.license_plate,
            condition: form.condition,
            source: form.source,
            vendor: form.vendor,
            vendor_contact: form.vendor_contact,
            daily_rate: form.daily_rate,
            insurance_required: form.insurance_required,
            driver_required: form.driver_required,
            special_equipment: form.special_equipment.split(',').map(s => s.trim()).filter(Boolean),
            modifications: form.modifications.split(',').map(m => m.trim()).filter(Boolean),
            image_url: form.image_url,
            reference_images: [],
            scenes: [],
            characters: [],
            notes: form.notes,
            is_hero: form.is_hero,
            is_drivable: form.is_drivable,
            fuel_type: form.fuel_type,
            status: 'needed',
            created_at: new Date().toISOString()
        };

        setVehicles(prev => [...prev, newVehicle]);
        setShowAddModal(false);
        resetForm();

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/vehicles`
                : '/api/library/vehicles';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newVehicle)
            });
        } catch (error) {
            console.error('Error adding vehicle:', error);
        }
    };

    // Update status
    const updateStatus = async (vehicleId: string, status: Vehicle['status']) => {
        setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status } : v));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/vehicles/${vehicleId}`
                : `/api/library/vehicles/${vehicleId}`;
            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Delete vehicle
    const deleteVehicle = async (vehicleId: string) => {
        if (!confirm('Delete this vehicle?')) return;

        setVehicles(prev => prev.filter(v => v.id !== vehicleId));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/vehicles/${vehicleId}`
                : `/api/library/vehicles/${vehicleId}`;
            await fetch(url, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setForm({
            name: '', description: '', type: 'car', make: '', model: '',
            year: new Date().getFullYear(), color: '', license_plate: '',
            condition: 'good', source: 'rented', vendor: '', vendor_contact: '',
            daily_rate: 0, insurance_required: true, driver_required: false,
            special_equipment: '', modifications: '', image_url: '', notes: '',
            is_hero: false, is_drivable: true, fuel_type: ''
        });
    };

    // Stats
    const stats = {
        total: vehicles.length,
        hero: vehicles.filter(v => v.is_hero).length,
        booked: vehicles.filter(v => v.status === 'booked' || v.status === 'on_set').length,
        total_daily: vehicles.reduce((sum, v) => sum + (v.daily_rate || 0), 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Car className="text-yellow-500" />
                        Vehicles Database
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage picture cars and vehicles
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                >
                    <Plus size={18} />
                    Add Vehicle
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Vehicles</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Hero Vehicles</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.hero}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Booked</p>
                    <p className="text-2xl font-bold text-green-400">{stats.booked}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Daily Rate</p>
                    <p className="text-2xl font-bold text-blue-400">${stats.total_daily}</p>
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
                        placeholder="Search vehicles..."
                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-white"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                >
                    <option value="all">All Types</option>
                    {Object.entries(VEHICLE_TYPES).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                    ))}
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                >
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                    ))}
                </select>
            </div>

            {/* Vehicles Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {filteredVehicles.length === 0 ? (
                        <div className="col-span-3 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-8 text-center text-gray-500">
                            No vehicles found
                        </div>
                    ) : (
                        filteredVehicles.map((vehicle) => {
                            const typeConfig = VEHICLE_TYPES[vehicle.type];
                            const statusConfig = STATUS_CONFIG[vehicle.status];
                            const TypeIcon = typeConfig.icon;

                            return (
                                <div
                                    key={vehicle.id}
                                    className={`bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-colors ${
                                        selectionMode ? 'cursor-pointer' : ''
                                    }`}
                                    onClick={() => selectionMode && onSelect?.(vehicle)}
                                >
                                    {/* Image */}
                                    <div className="aspect-video bg-white/5 relative">
                                        {vehicle.image_url ? (
                                            <img
                                                src={vehicle.image_url}
                                                alt={vehicle.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <TypeIcon className="text-gray-600" size={48} />
                                            </div>
                                        )}
                                        {vehicle.is_hero && (
                                            <div className="absolute top-2 left-2">
                                                <span className="px-2 py-1 bg-yellow-500 text-black rounded text-xs font-bold">
                                                    HERO
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-2 py-1 rounded text-xs ${typeConfig.color}`}>
                                                {typeConfig.label}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-2 left-2">
                                            <span className={`px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="text-white font-bold">{vehicle.name}</h3>
                                        {(vehicle.make || vehicle.model) && (
                                            <p className="text-sm text-gray-400">
                                                {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ')}
                                            </p>
                                        )}
                                        {vehicle.color && (
                                            <p className="text-xs text-gray-500 mt-1">{vehicle.color}</p>
                                        )}

                                        {/* Details */}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {vehicle.daily_rate && (
                                                <span className="flex items-center gap-1 text-xs text-green-400">
                                                    <DollarSign size={12} />
                                                    {vehicle.daily_rate}/day
                                                </span>
                                            )}
                                            {vehicle.is_drivable && (
                                                <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs">
                                                    Drivable
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {!selectionMode && (
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                                <select
                                                    value={vehicle.status}
                                                    onChange={(e) => updateStatus(vehicle.id, e.target.value as any)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs bg-transparent border-none text-gray-400"
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedVehicle(vehicle); }}
                                                        className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/5 rounded"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteVehicle(vehicle.id); }}
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
                        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-[#121212]">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Vehicle</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Vehicle Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g., John's Car, Police Cruiser #1"
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Type</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    >
                                        {Object.entries(VEHICLE_TYPES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Year</label>
                                    <input
                                        type="number"
                                        value={form.year}
                                        onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Make</label>
                                    <input
                                        type="text"
                                        value={form.make}
                                        onChange={(e) => setForm({ ...form, make: e.target.value })}
                                        placeholder="e.g., Ford"
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Model</label>
                                    <input
                                        type="text"
                                        value={form.model}
                                        onChange={(e) => setForm({ ...form, model: e.target.value })}
                                        placeholder="e.g., Mustang"
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Color</label>
                                    <input
                                        type="text"
                                        value={form.color}
                                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                                        placeholder="e.g., Red"
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Source</label>
                                    <select
                                        value={form.source}
                                        onChange={(e) => setForm({ ...form, source: e.target.value as any })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    >
                                        <option value="owned">Owned</option>
                                        <option value="rented">Rented</option>
                                        <option value="picture_car">Picture Car Co.</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Condition</label>
                                    <select
                                        value={form.condition}
                                        onChange={(e) => setForm({ ...form, condition: e.target.value as any })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    >
                                        <option value="showroom">Showroom</option>
                                        <option value="excellent">Excellent</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="weathered">Weathered</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Daily Rate ($)</label>
                                    <input
                                        type="number"
                                        value={form.daily_rate}
                                        onChange={(e) => setForm({ ...form, daily_rate: parseInt(e.target.value) })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Image URL</label>
                                <input
                                    type="text"
                                    value={form.image_url}
                                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.is_hero}
                                        onChange={(e) => setForm({ ...form, is_hero: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-gray-400">Hero Vehicle</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.is_drivable}
                                        onChange={(e) => setForm({ ...form, is_drivable: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-gray-400">Drivable</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.driver_required}
                                        onChange={(e) => setForm({ ...form, driver_required: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-gray-400">Driver Required</span>
                                </label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#121212]">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={addVehicle}
                                disabled={!form.name}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                Add Vehicle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
