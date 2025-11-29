'use client';

import React, { useState, useEffect } from 'react';
import {
    Dog, Plus, Search, Filter, Trash2, Eye, X,
    Loader2, AlertTriangle, User, Shield, Clock, DollarSign
} from 'lucide-react';

interface Animal {
    id: string;
    name: string;
    species: string;
    breed?: string;
    type: 'dog' | 'cat' | 'horse' | 'bird' | 'exotic' | 'farm' | 'marine' | 'reptile' | 'insect' | 'other';
    age?: string;
    gender?: string;
    color?: string;
    size?: string;
    weight?: string;
    trained_behaviors?: string[];
    special_abilities?: string[];
    temperament?: string;
    handler_name?: string;
    handler_phone?: string;
    handler_email?: string;
    company?: string;
    daily_rate?: number;
    insurance_required: boolean;
    veterinary_cert: boolean;
    image_url?: string;
    reference_images: string[];
    scenes?: string[];
    notes?: string;
    dietary_requirements?: string;
    safety_requirements?: string[];
    work_restrictions?: string;
    status: 'available' | 'booked' | 'on_set' | 'wrapped';
    created_at: string;
}

interface AnimalsDatabaseProps {
    projectId?: string;
    onSelect?: (animal: Animal) => void;
    selectionMode?: boolean;
}

const ANIMAL_TYPES = {
    dog: { label: 'Dog', emoji: '🐕', color: 'bg-amber-500/10 text-amber-400' },
    cat: { label: 'Cat', emoji: '🐈', color: 'bg-orange-500/10 text-orange-400' },
    horse: { label: 'Horse', emoji: '🐎', color: 'bg-brown-500/10 text-yellow-600' },
    bird: { label: 'Bird', emoji: '🦅', color: 'bg-blue-500/10 text-blue-400' },
    exotic: { label: 'Exotic', emoji: '🦁', color: 'bg-purple-500/10 text-purple-400' },
    farm: { label: 'Farm Animal', emoji: '🐄', color: 'bg-green-500/10 text-green-400' },
    marine: { label: 'Marine', emoji: '🐬', color: 'bg-cyan-500/10 text-cyan-400' },
    reptile: { label: 'Reptile', emoji: '🦎', color: 'bg-lime-500/10 text-lime-400' },
    insect: { label: 'Insect', emoji: '🦋', color: 'bg-pink-500/10 text-pink-400' },
    other: { label: 'Other', emoji: '🐾', color: 'bg-gray-500/10 text-gray-400' }
};

const STATUS_CONFIG = {
    available: { label: 'Available', color: 'bg-green-500/10 text-green-400' },
    booked: { label: 'Booked', color: 'bg-blue-500/10 text-blue-400' },
    on_set: { label: 'On Set', color: 'bg-yellow-500/10 text-yellow-400' },
    wrapped: { label: 'Wrapped', color: 'bg-purple-500/10 text-purple-400' }
};

export default function AnimalsDatabase({ projectId, onSelect, selectionMode }: AnimalsDatabaseProps) {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

    // Form state
    const [form, setForm] = useState({
        name: '',
        species: '',
        breed: '',
        type: 'dog' as Animal['type'],
        age: '',
        gender: '',
        color: '',
        size: '',
        trained_behaviors: '',
        temperament: '',
        handler_name: '',
        handler_phone: '',
        handler_email: '',
        company: '',
        daily_rate: 0,
        insurance_required: true,
        veterinary_cert: false,
        image_url: '',
        notes: '',
        safety_requirements: ''
    });

    // Fetch animals
    useEffect(() => {
        const fetchAnimals = async () => {
            try {
                const url = projectId 
                    ? `/api/projects/${projectId}/animals`
                    : '/api/library/animals';
                const res = await fetch(url);
                if (res.ok) {
                    setAnimals(await res.json());
                }
            } catch (error) {
                console.error('Error fetching animals:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnimals();
    }, [projectId]);

    // Filter animals
    const filteredAnimals = animals.filter(animal => {
        if (filterType !== 'all' && animal.type !== filterType) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return animal.name.toLowerCase().includes(query) ||
                animal.species.toLowerCase().includes(query) ||
                animal.breed?.toLowerCase().includes(query);
        }
        return true;
    });

    // Add animal
    const addAnimal = async () => {
        const newAnimal: Animal = {
            id: crypto.randomUUID(),
            name: form.name,
            species: form.species,
            breed: form.breed,
            type: form.type,
            age: form.age,
            gender: form.gender,
            color: form.color,
            size: form.size,
            trained_behaviors: form.trained_behaviors.split(',').map(b => b.trim()).filter(Boolean),
            temperament: form.temperament,
            handler_name: form.handler_name,
            handler_phone: form.handler_phone,
            handler_email: form.handler_email,
            company: form.company,
            daily_rate: form.daily_rate,
            insurance_required: form.insurance_required,
            veterinary_cert: form.veterinary_cert,
            image_url: form.image_url,
            reference_images: [],
            scenes: [],
            notes: form.notes,
            safety_requirements: form.safety_requirements.split(',').map(r => r.trim()).filter(Boolean),
            status: 'available',
            created_at: new Date().toISOString()
        };

        setAnimals(prev => [...prev, newAnimal]);
        setShowAddModal(false);
        resetForm();

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/animals`
                : '/api/library/animals';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAnimal)
            });
        } catch (error) {
            console.error('Error adding animal:', error);
        }
    };

    // Update status
    const updateStatus = async (animalId: string, status: Animal['status']) => {
        setAnimals(prev => prev.map(a => a.id === animalId ? { ...a, status } : a));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/animals/${animalId}`
                : `/api/library/animals/${animalId}`;
            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Delete animal
    const deleteAnimal = async (animalId: string) => {
        if (!confirm('Delete this animal?')) return;

        setAnimals(prev => prev.filter(a => a.id !== animalId));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/animals/${animalId}`
                : `/api/library/animals/${animalId}`;
            await fetch(url, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setForm({
            name: '', species: '', breed: '', type: 'dog', age: '', gender: '',
            color: '', size: '', trained_behaviors: '', temperament: '',
            handler_name: '', handler_phone: '', handler_email: '', company: '',
            daily_rate: 0, insurance_required: true, veterinary_cert: false,
            image_url: '', notes: '', safety_requirements: ''
        });
    };

    // Stats
    const stats = {
        total: animals.length,
        booked: animals.filter(a => a.status === 'booked' || a.status === 'on_set').length,
        with_handler: animals.filter(a => a.handler_name).length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Dog className="text-yellow-500" />
                        Animals & Creatures
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage animal actors and handlers
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                >
                    <Plus size={18} />
                    Add Animal
                </button>
            </div>

            {/* Safety Notice */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="text-orange-500 flex-shrink-0" size={20} />
                <p className="text-sm text-orange-400">
                    Always ensure proper animal welfare protocols, handlers, and safety measures are in place.
                    Verify veterinary certificates and insurance before shoot days.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Animals</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Booked/On Set</p>
                    <p className="text-2xl font-bold text-green-400">{stats.booked}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">With Handler</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.with_handler}</p>
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
                        placeholder="Search animals..."
                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-white"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Types</option>
                    {Object.entries(ANIMAL_TYPES).map(([key, config]) => (
                        <option key={key} value={key}>{config.emoji} {config.label}</option>
                    ))}
                </select>
            </div>

            {/* Animals Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-4">
                    {filteredAnimals.length === 0 ? (
                        <div className="col-span-4 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-8 text-center text-gray-500">
                            No animals found
                        </div>
                    ) : (
                        filteredAnimals.map((animal) => {
                            const typeConfig = ANIMAL_TYPES[animal.type];
                            const statusConfig = STATUS_CONFIG[animal.status];

                            return (
                                <div
                                    key={animal.id}
                                    className={`bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-colors ${
                                        selectionMode ? 'cursor-pointer' : ''
                                    }`}
                                    onClick={() => selectionMode && onSelect?.(animal)}
                                >
                                    {/* Image */}
                                    <div className="aspect-square bg-white/5 relative">
                                        {animal.image_url ? (
                                            <img
                                                src={animal.image_url}
                                                alt={animal.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl">
                                                {typeConfig.emoji}
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
                                        {animal.veterinary_cert && (
                                            <div className="absolute top-2 left-2">
                                                <span className="px-2 py-1 bg-green-500 text-white rounded text-xs" title="Vet Certified">
                                                    ✓ VET
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="text-white font-bold">{animal.name}</h3>
                                        <p className="text-sm text-gray-400">
                                            {animal.breed ? `${animal.breed} ${animal.species}` : animal.species}
                                        </p>

                                        {/* Handler */}
                                        {animal.handler_name && (
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                                                <User size={12} />
                                                {animal.handler_name}
                                            </p>
                                        )}

                                        {/* Trained behaviors */}
                                        {animal.trained_behaviors && animal.trained_behaviors.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {animal.trained_behaviors.slice(0, 2).map((b, i) => (
                                                    <span key={i} className="px-1.5 py-0.5 bg-white/5 rounded text-xs text-gray-400">
                                                        {b}
                                                    </span>
                                                ))}
                                                {animal.trained_behaviors.length > 2 && (
                                                    <span className="text-xs text-gray-600">+{animal.trained_behaviors.length - 2}</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {!selectionMode && (
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                                <select
                                                    value={animal.status}
                                                    onChange={(e) => updateStatus(animal.id, e.target.value as any)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs bg-transparent border-none text-gray-400"
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedAnimal(animal); }}
                                                        className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteAnimal(animal.id); }}
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
                            <h3 className="text-lg font-bold text-white">Add Animal</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Animal's name"
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Type</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.entries(ANIMAL_TYPES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.emoji} {config.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Species</label>
                                    <input
                                        type="text"
                                        value={form.species}
                                        onChange={(e) => setForm({ ...form, species: e.target.value })}
                                        placeholder="e.g., Dog, Cat, Horse"
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Breed</label>
                                    <input
                                        type="text"
                                        value={form.breed}
                                        onChange={(e) => setForm({ ...form, breed: e.target.value })}
                                        placeholder="e.g., Golden Retriever"
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Trained Behaviors (comma-separated)</label>
                                <input
                                    type="text"
                                    value={form.trained_behaviors}
                                    onChange={(e) => setForm({ ...form, trained_behaviors: e.target.value })}
                                    placeholder="e.g., Sit, Stay, Bark on cue, Fetch"
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Handler Name</label>
                                    <input
                                        type="text"
                                        value={form.handler_name}
                                        onChange={(e) => setForm({ ...form, handler_name: e.target.value })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Handler Phone</label>
                                    <input
                                        type="text"
                                        value={form.handler_phone}
                                        onChange={(e) => setForm({ ...form, handler_phone: e.target.value })}
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

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.veterinary_cert}
                                        onChange={(e) => setForm({ ...form, veterinary_cert: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-gray-400">Veterinary Certificate</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.insurance_required}
                                        onChange={(e) => setForm({ ...form, insurance_required: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-gray-400">Insurance Required</span>
                                </label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-[#121212]">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={addAnimal}
                                disabled={!form.name}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                Add Animal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
