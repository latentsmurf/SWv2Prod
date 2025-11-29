'use client';

import React, { useState } from 'react';
import {
    Database, Search, Download, Upload, Trash2, RefreshCw, HardDrive,
    Table, FileJson, Clock, AlertTriangle, CheckCircle, Play, Pause,
    BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface TableInfo {
    name: string;
    rows: number;
    size: string;
    lastModified: string;
    indexes: number;
}

interface BackupInfo {
    id: string;
    name: string;
    size: string;
    createdAt: string;
    type: 'manual' | 'automatic';
    status: 'completed' | 'in_progress' | 'failed';
}

// ============================================================================
// DATA
// ============================================================================

const TABLES: TableInfo[] = [
    { name: 'users', rows: 12847, size: '45.2 MB', lastModified: '2024-11-27T10:30:00Z', indexes: 5 },
    { name: 'projects', rows: 45692, size: '1.2 GB', lastModified: '2024-11-27T10:29:00Z', indexes: 8 },
    { name: 'scenes', rows: 234567, size: '890 MB', lastModified: '2024-11-27T10:28:00Z', indexes: 6 },
    { name: 'shots', rows: 1234567, size: '3.4 GB', lastModified: '2024-11-27T10:27:00Z', indexes: 10 },
    { name: 'media', rows: 567890, size: '12.5 GB', lastModified: '2024-11-27T10:26:00Z', indexes: 4 },
    { name: 'credits_transactions', rows: 2345678, size: '450 MB', lastModified: '2024-11-27T10:25:00Z', indexes: 6 },
    { name: 'audit_logs', rows: 5678901, size: '2.1 GB', lastModified: '2024-11-27T10:24:00Z', indexes: 5 },
    { name: 'sessions', rows: 45678, size: '12 MB', lastModified: '2024-11-27T10:23:00Z', indexes: 3 },
];

const BACKUPS: BackupInfo[] = [
    { id: '1', name: 'backup_2024-11-27_auto', size: '18.5 GB', createdAt: '2024-11-27T02:00:00Z', type: 'automatic', status: 'completed' },
    { id: '2', name: 'backup_2024-11-26_auto', size: '18.4 GB', createdAt: '2024-11-26T02:00:00Z', type: 'automatic', status: 'completed' },
    { id: '3', name: 'backup_2024-11-25_manual', size: '18.3 GB', createdAt: '2024-11-25T14:30:00Z', type: 'manual', status: 'completed' },
    { id: '4', name: 'backup_2024-11-25_auto', size: '18.3 GB', createdAt: '2024-11-25T02:00:00Z', type: 'automatic', status: 'completed' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DatabasePage() {
    const [tables, setTables] = useState(TABLES);
    const [backups, setBackups] = useState(BACKUPS);
    const [activeTab, setActiveTab] = useState<'tables' | 'backups' | 'maintenance'>('tables');
    const [searchQuery, setSearchQuery] = useState('');
    const [isBackingUp, setIsBackingUp] = useState(false);

    // Stats
    const totalSize = '18.5 GB';
    const totalRows = tables.reduce((sum, t) => sum + t.rows, 0);

    const filteredTables = tables.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const startBackup = () => {
        setIsBackingUp(true);
        setTimeout(() => {
            setBackups(prev => [{
                id: `${Date.now()}`,
                name: `backup_${new Date().toISOString().split('T')[0]}_manual`,
                size: totalSize,
                createdAt: new Date().toISOString(),
                type: 'manual',
                status: 'completed'
            }, ...prev]);
            setIsBackingUp(false);
        }, 3000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Database</h1>
                    <p className="text-sm text-gray-500">Manage database tables and backups</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={startBackup}
                        disabled={isBackingUp}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/50 text-black font-semibold rounded-lg text-sm"
                    >
                        {isBackingUp ? (
                            <RefreshCw size={14} className="animate-spin" />
                        ) : (
                            <Download size={14} />
                        )}
                        {isBackingUp ? 'Backing up...' : 'Create Backup'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Database size={16} className="text-blue-400" />
                        <p className="text-xs text-gray-500">Total Size</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{totalSize}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Table size={16} className="text-purple-400" />
                        <p className="text-xs text-gray-500">Tables</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{tables.length}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 size={16} className="text-green-400" />
                        <p className="text-xs text-gray-500">Total Rows</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{totalRows.toLocaleString()}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <HardDrive size={16} className="text-yellow-400" />
                        <p className="text-xs text-gray-500">Backups</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{backups.length}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 w-fit">
                {['tables', 'backups', 'maintenance'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-1.5 rounded-md text-sm capitalize transition-colors ${
                            activeTab === tab ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tables Tab */}
            {activeTab === 'tables' && (
                <div className="space-y-4">
                    <div className="relative max-w-md">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search tables..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                        />
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="p-4 text-left text-xs text-gray-500 font-medium">Table Name</th>
                                    <th className="p-4 text-left text-xs text-gray-500 font-medium">Rows</th>
                                    <th className="p-4 text-left text-xs text-gray-500 font-medium">Size</th>
                                    <th className="p-4 text-left text-xs text-gray-500 font-medium">Indexes</th>
                                    <th className="p-4 text-left text-xs text-gray-500 font-medium">Last Modified</th>
                                    <th className="p-4 text-right text-xs text-gray-500 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTables.map(table => (
                                    <tr key={table.name} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Table size={14} className="text-gray-500" />
                                                <span className="font-mono text-sm text-white">{table.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">{table.rows.toLocaleString()}</td>
                                        <td className="p-4 text-sm text-gray-400">{table.size}</td>
                                        <td className="p-4 text-sm text-gray-400">{table.indexes}</td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {new Date(table.lastModified).toLocaleTimeString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                                                <FileJson size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Backups Tab */}
            {activeTab === 'backups' && (
                <div className="space-y-4">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="p-4 text-left text-xs text-gray-500 font-medium">Backup Name</th>
                                    <th className="p-4 text-left text-xs text-gray-500 font-medium">Size</th>
                                    <th className="p-4 text-left text-xs text-gray-500 font-medium">Type</th>
                                    <th className="p-4 text-left text-xs text-gray-500 font-medium">Status</th>
                                    <th className="p-4 text-left text-xs text-gray-500 font-medium">Created</th>
                                    <th className="p-4 text-right text-xs text-gray-500 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {backups.map(backup => (
                                    <tr key={backup.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4">
                                            <span className="font-mono text-sm text-white">{backup.name}</span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">{backup.size}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                backup.type === 'automatic'
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : 'bg-purple-500/20 text-purple-400'
                                            }`}>
                                                {backup.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-1 text-xs ${
                                                backup.status === 'completed' ? 'text-green-400' :
                                                backup.status === 'in_progress' ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                                {backup.status === 'completed' ? <CheckCircle size={12} /> :
                                                 backup.status === 'in_progress' ? <RefreshCw size={12} className="animate-spin" /> :
                                                 <AlertTriangle size={12} />}
                                                {backup.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {new Date(backup.createdAt).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                                                    <Download size={14} />
                                                </button>
                                                <button className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && (
                <div className="grid grid-cols-2 gap-4">
                    <button className="p-6 bg-[#0a0a0a] border border-white/10 rounded-xl hover:border-white/20 transition-colors text-left">
                        <RefreshCw size={24} className="text-blue-400 mb-3" />
                        <h3 className="font-semibold text-white mb-1">Vacuum Database</h3>
                        <p className="text-sm text-gray-500">Reclaim storage and optimize performance</p>
                    </button>
                    <button className="p-6 bg-[#0a0a0a] border border-white/10 rounded-xl hover:border-white/20 transition-colors text-left">
                        <BarChart3 size={24} className="text-purple-400 mb-3" />
                        <h3 className="font-semibold text-white mb-1">Rebuild Indexes</h3>
                        <p className="text-sm text-gray-500">Rebuild all database indexes</p>
                    </button>
                    <button className="p-6 bg-[#0a0a0a] border border-white/10 rounded-xl hover:border-white/20 transition-colors text-left">
                        <Trash2 size={24} className="text-yellow-400 mb-3" />
                        <h3 className="font-semibold text-white mb-1">Clear Cache</h3>
                        <p className="text-sm text-gray-500">Clear query and result caches</p>
                    </button>
                    <button className="p-6 bg-[#0a0a0a] border border-white/10 rounded-xl hover:border-white/20 transition-colors text-left">
                        <Clock size={24} className="text-green-400 mb-3" />
                        <h3 className="font-semibold text-white mb-1">Archive Old Data</h3>
                        <p className="text-sm text-gray-500">Move old records to archive</p>
                    </button>
                </div>
            )}
        </div>
    );
}
