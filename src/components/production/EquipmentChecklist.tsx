'use client';

import React, { useState, useEffect } from 'react';
import {
    Box, Plus, Check, X, Loader2, Search, Filter,
    Camera, Lightbulb, Mic, Monitor, Package, Truck,
    Clock, User, AlertTriangle, Download, ChevronDown
} from 'lucide-react';

interface EquipmentItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    quantity_available: number;
    rental_source?: string;
    daily_rate?: number;
    notes?: string;
    status: 'available' | 'reserved' | 'in_use' | 'maintenance' | 'returned';
    scenes?: string[];
    assigned_to?: string;
    check_out_date?: string;
    check_in_date?: string;
}

interface EquipmentCategory {
    id: string;
    name: string;
    icon: string;
    items: EquipmentItem[];
}

interface EquipmentChecklistProps {
    projectId: string;
}

const CATEGORY_CONFIG: { [key: string]: { icon: any; color: string } } = {
    camera: { icon: Camera, color: 'text-blue-400' },
    lighting: { icon: Lightbulb, color: 'text-yellow-400' },
    audio: { icon: Mic, color: 'text-green-400' },
    grip: { icon: Package, color: 'text-orange-400' },
    monitors: { icon: Monitor, color: 'text-purple-400' },
    transport: { icon: Truck, color: 'text-cyan-400' },
    other: { icon: Box, color: 'text-gray-400' }
};

const STATUS_CONFIG = {
    available: { label: 'Available', color: 'bg-green-500/10 text-green-400' },
    reserved: { label: 'Reserved', color: 'bg-blue-500/10 text-blue-400' },
    in_use: { label: 'In Use', color: 'bg-yellow-500/10 text-yellow-400' },
    maintenance: { label: 'Maintenance', color: 'bg-red-500/10 text-red-400' },
    returned: { label: 'Returned', color: 'bg-gray-500/10 text-gray-400' }
};

export default function EquipmentChecklist({ projectId }: EquipmentChecklistProps) {
    const [categories, setCategories] = useState<EquipmentCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);

    // Form state
    const [itemForm, setItemForm] = useState({
        name: '',
        category: 'camera',
        quantity: 1,
        rental_source: '',
        daily_rate: 0,
        notes: ''
    });

    // Fetch equipment
    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/equipment`);
                if (res.ok) {
                    setCategories(await res.json());
                }
            } catch (error) {
                console.error('Error fetching equipment:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEquipment();
    }, [projectId]);

    // Get all items
    const allItems = categories.flatMap(cat => cat.items);

    // Filter items
    const filteredItems = allItems.filter(item => {
        if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filterCategory !== 'all' && item.category !== filterCategory) return false;
        if (filterStatus !== 'all' && item.status !== filterStatus) return false;
        return true;
    });

    // Add item
    const addItem = async () => {
        const newItem: EquipmentItem = {
            id: crypto.randomUUID(),
            name: itemForm.name,
            category: itemForm.category,
            quantity: itemForm.quantity,
            quantity_available: itemForm.quantity,
            rental_source: itemForm.rental_source,
            daily_rate: itemForm.daily_rate,
            notes: itemForm.notes,
            status: 'available'
        };

        const updatedCategories = categories.map(cat => {
            if (cat.id === itemForm.category) {
                return { ...cat, items: [...cat.items, newItem] };
            }
            return cat;
        });

        // If category doesn't exist, create it
        if (!categories.find(cat => cat.id === itemForm.category)) {
            updatedCategories.push({
                id: itemForm.category,
                name: itemForm.category.charAt(0).toUpperCase() + itemForm.category.slice(1),
                icon: itemForm.category,
                items: [newItem]
            });
        }

        setCategories(updatedCategories);
        setShowAddModal(false);
        setItemForm({ name: '', category: 'camera', quantity: 1, rental_source: '', daily_rate: 0, notes: '' });

        try {
            await fetch(`/api/projects/${projectId}/equipment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    // Update item status
    const updateStatus = async (itemId: string, status: EquipmentItem['status']) => {
        const updatedCategories = categories.map(cat => ({
            ...cat,
            items: cat.items.map(item =>
                item.id === itemId ? { ...item, status } : item
            )
        }));

        setCategories(updatedCategories);

        try {
            await fetch(`/api/projects/${projectId}/equipment/${itemId}`, {
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
        if (!confirm('Delete this equipment item?')) return;

        const updatedCategories = categories.map(cat => ({
            ...cat,
            items: cat.items.filter(item => item.id !== itemId)
        }));

        setCategories(updatedCategories);

        try {
            await fetch(`/api/projects/${projectId}/equipment/${itemId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    // Calculate stats
    const totalItems = allItems.length;
    const inUseItems = allItems.filter(i => i.status === 'in_use').length;
    const maintenanceItems = allItems.filter(i => i.status === 'maintenance').length;
    const totalDailyRate = allItems.reduce((sum, i) => sum + (i.daily_rate || 0) * i.quantity, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Box className="text-yellow-500" />
                        Equipment Checklist
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Track and manage production equipment
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white">
                        <Download size={16} />
                        Export List
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                    >
                        <Plus size={18} />
                        Add Equipment
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Items</p>
                    <p className="text-2xl font-bold text-white">{totalItems}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">In Use</p>
                    <p className="text-2xl font-bold text-yellow-400">{inUseItems}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Maintenance</p>
                    <p className="text-2xl font-bold text-red-400">{maintenanceItems}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Daily Rate Total</p>
                    <p className="text-2xl font-bold text-green-400">${totalDailyRate.toLocaleString()}</p>
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
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Categories</option>
                    {Object.keys(CATEGORY_CONFIG).map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                    ))}
                </select>
            </div>

            {/* Equipment List */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Equipment</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Category</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Qty</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Source</th>
                                <th className="text-right p-4 text-sm font-medium text-gray-500">Daily Rate</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Status</th>
                                <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        No equipment found
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const categoryConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
                                    const Icon = categoryConfig.icon;
                                    const statusConfig = STATUS_CONFIG[item.status];

                                    return (
                                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 bg-white/5 rounded-lg ${categoryConfig.color}`}>
                                                        <Icon size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{item.name}</p>
                                                        {item.notes && (
                                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-400 capitalize">{item.category}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-white">{item.quantity}</span>
                                                {item.quantity_available !== item.quantity && (
                                                    <span className="text-gray-500 text-sm"> ({item.quantity_available} avail)</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-400">{item.rental_source || '-'}</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {item.daily_rate ? (
                                                    <span className="text-green-400">${item.daily_rate}</span>
                                                ) : (
                                                    <span className="text-gray-600">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => updateStatus(item.id, e.target.value as any)}
                                                    className={`px-3 py-1 rounded-lg text-sm font-medium ${statusConfig.color} bg-transparent`}
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => deleteItem(item.id)}
                                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Add Equipment</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 text-gray-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Equipment Name</label>
                                <input
                                    type="text"
                                    value={itemForm.name}
                                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                                    placeholder="e.g., ARRI Alexa Mini"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Category</label>
                                    <select
                                        value={itemForm.category}
                                        onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.keys(CATEGORY_CONFIG).map(cat => (
                                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        value={itemForm.quantity}
                                        onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) })}
                                        min="1"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Rental Source</label>
                                    <input
                                        type="text"
                                        value={itemForm.rental_source}
                                        onChange={(e) => setItemForm({ ...itemForm, rental_source: e.target.value })}
                                        placeholder="e.g., Panavision"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Daily Rate ($)</label>
                                    <input
                                        type="number"
                                        value={itemForm.daily_rate}
                                        onChange={(e) => setItemForm({ ...itemForm, daily_rate: parseInt(e.target.value) })}
                                        min="0"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Notes</label>
                                <textarea
                                    value={itemForm.notes}
                                    onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                                    placeholder="Any additional notes..."
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addItem}
                                disabled={!itemForm.name}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
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
