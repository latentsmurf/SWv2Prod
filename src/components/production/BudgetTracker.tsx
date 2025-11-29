'use client';

import React, { useState, useEffect } from 'react';
import {
    DollarSign, Plus, Edit, Trash2, TrendingUp, TrendingDown,
    PieChart, BarChart3, Download, Upload, Loader2, Check, X,
    AlertTriangle, ChevronDown, ChevronRight, Filter
} from 'lucide-react';

interface BudgetCategory {
    id: string;
    name: string;
    code: string;
    budgeted: number;
    actual: number;
    items: BudgetItem[];
}

interface BudgetItem {
    id: string;
    category_id: string;
    description: string;
    vendor?: string;
    quantity: number;
    unit_cost: number;
    total_budgeted: number;
    total_actual: number;
    notes?: string;
    status: 'pending' | 'approved' | 'paid';
    date?: string;
}

interface BudgetTrackerProps {
    projectId: string;
}

const DEFAULT_CATEGORIES = [
    { code: '100', name: 'Story & Rights' },
    { code: '200', name: 'Talent' },
    { code: '300', name: 'Production Staff' },
    { code: '400', name: 'Set Operations' },
    { code: '500', name: 'Equipment' },
    { code: '600', name: 'Location' },
    { code: '700', name: 'Post-Production' },
    { code: '800', name: 'Music & Sound' },
    { code: '900', name: 'Insurance & Legal' },
    { code: '1000', name: 'Contingency' },
];

export default function BudgetTracker({ projectId }: BudgetTrackerProps) {
    const [categories, setCategories] = useState<BudgetCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [showAddItem, setShowAddItem] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

    // Form state
    const [itemForm, setItemForm] = useState({
        description: '',
        vendor: '',
        quantity: 1,
        unit_cost: 0,
        notes: '',
        status: 'pending' as const
    });

    // Fetch budget data
    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/budget`);
                if (res.ok) {
                    setCategories(await res.json());
                } else {
                    // Initialize with default categories
                    setCategories(DEFAULT_CATEGORIES.map(cat => ({
                        id: cat.code,
                        name: cat.name,
                        code: cat.code,
                        budgeted: 0,
                        actual: 0,
                        items: []
                    })));
                }
            } catch (error) {
                console.error('Error fetching budget:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBudget();
    }, [projectId]);

    // Calculate totals
    const totalBudgeted = categories.reduce((sum, cat) => sum + cat.budgeted, 0);
    const totalActual = categories.reduce((sum, cat) => sum + cat.actual, 0);
    const variance = totalBudgeted - totalActual;
    const variancePercent = totalBudgeted > 0 ? ((variance / totalBudgeted) * 100).toFixed(1) : '0';

    // Toggle category expansion
    const toggleCategory = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    // Add item
    const addItem = async (categoryId: string) => {
        const newItem: BudgetItem = {
            id: crypto.randomUUID(),
            category_id: categoryId,
            description: itemForm.description,
            vendor: itemForm.vendor,
            quantity: itemForm.quantity,
            unit_cost: itemForm.unit_cost,
            total_budgeted: itemForm.quantity * itemForm.unit_cost,
            total_actual: 0,
            notes: itemForm.notes,
            status: itemForm.status
        };

        const updatedCategories = categories.map(cat => {
            if (cat.id === categoryId) {
                const items = [...cat.items, newItem];
                return {
                    ...cat,
                    items,
                    budgeted: items.reduce((sum, i) => sum + i.total_budgeted, 0),
                    actual: items.reduce((sum, i) => sum + i.total_actual, 0)
                };
            }
            return cat;
        });

        setCategories(updatedCategories);
        setShowAddItem(null);
        setItemForm({ description: '', vendor: '', quantity: 1, unit_cost: 0, notes: '', status: 'pending' });

        try {
            await fetch(`/api/projects/${projectId}/budget/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    // Update item actual cost
    const updateItemActual = async (categoryId: string, itemId: string, actual: number) => {
        const updatedCategories = categories.map(cat => {
            if (cat.id === categoryId) {
                const items = cat.items.map(item =>
                    item.id === itemId ? { ...item, total_actual: actual } : item
                );
                return {
                    ...cat,
                    items,
                    actual: items.reduce((sum, i) => sum + i.total_actual, 0)
                };
            }
            return cat;
        });

        setCategories(updatedCategories);

        try {
            await fetch(`/api/projects/${projectId}/budget/items/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ total_actual: actual })
            });
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    // Delete item
    const deleteItem = async (categoryId: string, itemId: string) => {
        const updatedCategories = categories.map(cat => {
            if (cat.id === categoryId) {
                const items = cat.items.filter(item => item.id !== itemId);
                return {
                    ...cat,
                    items,
                    budgeted: items.reduce((sum, i) => sum + i.total_budgeted, 0),
                    actual: items.reduce((sum, i) => sum + i.total_actual, 0)
                };
            }
            return cat;
        });

        setCategories(updatedCategories);

        try {
            await fetch(`/api/projects/${projectId}/budget/items/${itemId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Get variance color
    const getVarianceColor = (budgeted: number, actual: number) => {
        if (actual === 0) return 'text-gray-500';
        const diff = budgeted - actual;
        if (diff >= 0) return 'text-green-400';
        if (diff >= -budgeted * 0.1) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <DollarSign className="text-yellow-500" />
                        Budget Tracker
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Track production costs and spending
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-6">
                    <p className="text-sm text-gray-500 mb-1">Total Budget</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(totalBudgeted)}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-6">
                    <p className="text-sm text-gray-500 mb-1">Actual Spent</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(totalActual)}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-6">
                    <p className="text-sm text-gray-500 mb-1">Variance</p>
                    <p className={`text-3xl font-bold flex items-center gap-2 ${
                        variance >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                        {variance >= 0 ? <TrendingDown size={24} /> : <TrendingUp size={24} />}
                        {formatCurrency(Math.abs(variance))}
                    </p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-6">
                    <p className="text-sm text-gray-500 mb-1">Budget Used</p>
                    <p className="text-3xl font-bold text-white">
                        {totalBudgeted > 0 ? ((totalActual / totalBudgeted) * 100).toFixed(0) : 0}%
                    </p>
                    <div className="h-2 bg-white/10 rounded-full mt-2">
                        <div
                            className={`h-full rounded-full ${
                                totalActual / totalBudgeted > 1 ? 'bg-red-500' :
                                totalActual / totalBudgeted > 0.9 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((totalActual / totalBudgeted) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Budget Categories */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-sm font-medium text-gray-500">
                        <div className="col-span-5">Category / Item</div>
                        <div className="col-span-2 text-right">Budgeted</div>
                        <div className="col-span-2 text-right">Actual</div>
                        <div className="col-span-2 text-right">Variance</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Categories */}
                    {categories.map((category) => {
                        const categoryVariance = category.budgeted - category.actual;
                        const isExpanded = expandedCategories.has(category.id);

                        return (
                            <div key={category.id} className="border-b border-white/5 last:border-0">
                                {/* Category Row */}
                                <button
                                    onClick={() => toggleCategory(category.id)}
                                    className="w-full grid grid-cols-12 gap-4 p-4 hover:bg-white/5 items-center"
                                >
                                    <div className="col-span-5 flex items-center gap-3">
                                        {isExpanded ? (
                                            <ChevronDown size={16} className="text-gray-500" />
                                        ) : (
                                            <ChevronRight size={16} className="text-gray-500" />
                                        )}
                                        <span className="text-xs text-gray-600 font-mono">{category.code}</span>
                                        <span className="text-white font-medium">{category.name}</span>
                                        <span className="text-xs text-gray-600">({category.items.length})</span>
                                    </div>
                                    <div className="col-span-2 text-right text-white">
                                        {formatCurrency(category.budgeted)}
                                    </div>
                                    <div className="col-span-2 text-right text-white">
                                        {formatCurrency(category.actual)}
                                    </div>
                                    <div className={`col-span-2 text-right ${getVarianceColor(category.budgeted, category.actual)}`}>
                                        {categoryVariance >= 0 ? '+' : ''}{formatCurrency(categoryVariance)}
                                    </div>
                                    <div className="col-span-1"></div>
                                </button>

                                {/* Items */}
                                {isExpanded && (
                                    <div className="bg-black/20">
                                        {category.items.map((item) => {
                                            const itemVariance = item.total_budgeted - item.total_actual;

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="grid grid-cols-12 gap-4 px-4 py-3 border-t border-white/5 items-center hover:bg-white/5"
                                                >
                                                    <div className="col-span-5 pl-10">
                                                        <p className="text-sm text-gray-300">{item.description}</p>
                                                        {item.vendor && (
                                                            <p className="text-xs text-gray-600">{item.vendor}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2 text-right text-sm text-gray-400">
                                                        {formatCurrency(item.total_budgeted)}
                                                    </div>
                                                    <div className="col-span-2 text-right">
                                                        <input
                                                            type="number"
                                                            value={item.total_actual}
                                                            onChange={(e) => updateItemActual(category.id, item.id, Number(e.target.value))}
                                                            className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white text-right"
                                                        />
                                                    </div>
                                                    <div className={`col-span-2 text-right text-sm ${getVarianceColor(item.total_budgeted, item.total_actual)}`}>
                                                        {itemVariance >= 0 ? '+' : ''}{formatCurrency(itemVariance)}
                                                    </div>
                                                    <div className="col-span-1 text-right">
                                                        <button
                                                            onClick={() => deleteItem(category.id, item.id)}
                                                            className="p-1 text-gray-600 hover:text-red-400"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Add Item Form */}
                                        {showAddItem === category.id ? (
                                            <div className="p-4 border-t border-white/5 bg-white/5">
                                                <div className="grid grid-cols-4 gap-4 mb-4">
                                                    <input
                                                        type="text"
                                                        value={itemForm.description}
                                                        onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                                                        placeholder="Description"
                                                        className="col-span-2 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={itemForm.quantity}
                                                        onChange={(e) => setItemForm({ ...itemForm, quantity: Number(e.target.value) })}
                                                        placeholder="Qty"
                                                        className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={itemForm.unit_cost}
                                                        onChange={(e) => setItemForm({ ...itemForm, unit_cost: Number(e.target.value) })}
                                                        placeholder="Unit Cost"
                                                        className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-400">
                                                        Total: {formatCurrency(itemForm.quantity * itemForm.unit_cost)}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setShowAddItem(null)}
                                                            className="px-3 py-1 text-gray-400 hover:text-white"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => addItem(category.id)}
                                                            disabled={!itemForm.description}
                                                            className="px-4 py-1 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg disabled:opacity-50"
                                                        >
                                                            Add Item
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setShowAddItem(category.id)}
                                                className="w-full p-3 border-t border-white/5 text-sm text-yellow-500 hover:bg-white/5 flex items-center justify-center gap-2"
                                            >
                                                <Plus size={14} />
                                                Add Line Item
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
