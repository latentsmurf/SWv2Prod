'use client';

import React, { useState } from 'react';
import {
    Shield, Users, Check, X, Edit2, Plus, Trash2, Save, ChevronDown,
    Eye, Zap, FolderOpen, Settings, CreditCard, Bot
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
}

interface Role {
    id: string;
    name: string;
    description: string;
    color: string;
    permissions: string[];
    userCount: number;
    isSystem: boolean;
}

// ============================================================================
// DATA
// ============================================================================

const PERMISSIONS: Permission[] = [
    // Projects
    { id: 'projects.view', name: 'View Projects', description: 'View own projects', category: 'Projects' },
    { id: 'projects.create', name: 'Create Projects', description: 'Create new projects', category: 'Projects' },
    { id: 'projects.edit', name: 'Edit Projects', description: 'Edit own projects', category: 'Projects' },
    { id: 'projects.delete', name: 'Delete Projects', description: 'Delete own projects', category: 'Projects' },
    { id: 'projects.share', name: 'Share Projects', description: 'Share projects with team', category: 'Projects' },
    // AI Features
    { id: 'ai.generate', name: 'AI Generation', description: 'Use AI generation features', category: 'AI Features' },
    { id: 'ai.voice', name: 'Voice Cloning', description: 'Use voice cloning', category: 'AI Features' },
    { id: 'ai.music', name: 'Music Generation', description: 'Generate AI music', category: 'AI Features' },
    { id: 'ai.batch', name: 'Batch Generation', description: 'Run batch generations', category: 'AI Features' },
    // Export
    { id: 'export.hd', name: 'HD Export', description: 'Export in HD quality', category: 'Export' },
    { id: 'export.4k', name: '4K Export', description: 'Export in 4K quality', category: 'Export' },
    { id: 'export.watermark', name: 'No Watermark', description: 'Export without watermark', category: 'Export' },
    // Team
    { id: 'team.invite', name: 'Invite Team', description: 'Invite team members', category: 'Team' },
    { id: 'team.manage', name: 'Manage Team', description: 'Manage team settings', category: 'Team' },
    // Admin
    { id: 'admin.users', name: 'Manage Users', description: 'Admin user management', category: 'Admin' },
    { id: 'admin.settings', name: 'System Settings', description: 'Modify system settings', category: 'Admin' },
    { id: 'admin.billing', name: 'Billing Access', description: 'Access billing settings', category: 'Admin' },
];

const ROLES: Role[] = [
    {
        id: 'free',
        name: 'Free',
        description: 'Basic access with limited features',
        color: 'gray',
        permissions: ['projects.view', 'projects.create', 'projects.edit', 'ai.generate'],
        userCount: 8432,
        isSystem: true
    },
    {
        id: 'pro',
        name: 'Pro',
        description: 'Full access to core features',
        color: 'blue',
        permissions: ['projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.share', 'ai.generate', 'ai.voice', 'ai.music', 'export.hd', 'export.watermark'],
        userCount: 2847,
        isSystem: true
    },
    {
        id: 'studio',
        name: 'Studio',
        description: 'Advanced features for professional teams',
        color: 'purple',
        permissions: ['projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.share', 'ai.generate', 'ai.voice', 'ai.music', 'ai.batch', 'export.hd', 'export.4k', 'export.watermark', 'team.invite', 'team.manage'],
        userCount: 567,
        isSystem: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Full platform access with admin features',
        color: 'yellow',
        permissions: PERMISSIONS.map(p => p.id),
        userCount: 43,
        isSystem: true
    },
    {
        id: 'admin',
        name: 'Admin',
        description: 'System administrator with full access',
        color: 'red',
        permissions: PERMISSIONS.map(p => p.id),
        userCount: 3,
        isSystem: true
    },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RolesPage() {
    const [roles, setRoles] = useState(ROLES);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [editMode, setEditMode] = useState(false);

    const roleColors: Record<string, string> = {
        gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        red: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    // Group permissions by category
    const permissionsByCategory = PERMISSIONS.reduce((acc, p) => {
        if (!acc[p.category]) acc[p.category] = [];
        acc[p.category].push(p);
        return acc;
    }, {} as Record<string, Permission[]>);

    const togglePermission = (permissionId: string) => {
        if (!selectedRole || !editMode) return;
        
        setSelectedRole(prev => {
            if (!prev) return prev;
            const hasPermission = prev.permissions.includes(permissionId);
            return {
                ...prev,
                permissions: hasPermission
                    ? prev.permissions.filter(p => p !== permissionId)
                    : [...prev.permissions, permissionId]
            };
        });
    };

    const saveRole = () => {
        if (!selectedRole) return;
        setRoles(prev => prev.map(r => r.id === selectedRole.id ? selectedRole : r));
        setEditMode(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
                    <p className="text-sm text-gray-500">Manage user roles and their permissions</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Roles List */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Roles</h3>
                    {roles.map(role => (
                        <button
                            key={role.id}
                            onClick={() => {
                                setSelectedRole(role);
                                setEditMode(false);
                            }}
                            className={`w-full p-4 rounded-xl border text-left transition-colors ${
                                selectedRole?.id === role.id
                                    ? 'bg-white/10 border-white/20'
                                    : 'bg-[#0a0a0a] border-white/10 hover:border-white/20'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${roleColors[role.color]}`}>
                                    {role.name}
                                </span>
                                <span className="text-xs text-gray-500">{role.userCount} users</span>
                            </div>
                            <p className="text-sm text-gray-400">{role.description}</p>
                            <p className="text-xs text-gray-600 mt-2">
                                {role.permissions.length} permissions
                            </p>
                        </button>
                    ))}
                </div>

                {/* Permissions Panel */}
                <div className="col-span-2">
                    {selectedRole ? (
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-white">{selectedRole.name} Permissions</h3>
                                    <p className="text-sm text-gray-500">{selectedRole.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {editMode ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setSelectedRole(roles.find(r => r.id === selectedRole.id) || null);
                                                    setEditMode(false);
                                                }}
                                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={saveRole}
                                                className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 rounded-lg text-sm text-black font-medium flex items-center gap-1"
                                            >
                                                <Save size={14} />
                                                Save
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 flex items-center gap-1"
                                        >
                                            <Edit2 size={14} />
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
                                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                                    <div key={category}>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                            {category}
                                        </h4>
                                        <div className="space-y-2">
                                            {permissions.map(permission => {
                                                const hasPermission = selectedRole.permissions.includes(permission.id);
                                                return (
                                                    <div
                                                        key={permission.id}
                                                        onClick={() => togglePermission(permission.id)}
                                                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                                                            editMode ? 'cursor-pointer hover:bg-white/5' : ''
                                                        } ${hasPermission ? 'bg-green-500/5' : 'bg-white/5'}`}
                                                    >
                                                        <div>
                                                            <p className="text-sm text-white">{permission.name}</p>
                                                            <p className="text-xs text-gray-500">{permission.description}</p>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                                            hasPermission ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-500'
                                                        }`}>
                                                            {hasPermission ? <Check size={12} /> : <X size={12} />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8 text-center text-gray-500">
                            <Shield size={40} className="mx-auto mb-4 opacity-50" />
                            <p>Select a role to view permissions</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
