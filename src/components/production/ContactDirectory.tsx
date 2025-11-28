'use client';

import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Search, Filter, Phone, Mail, MapPin,
    Building, User, Download, Upload, X, Loader2, Edit,
    Trash2, Star, Copy, Check, ExternalLink
} from 'lucide-react';

interface Contact {
    id: string;
    name: string;
    department: string;
    role: string;
    email?: string;
    phone?: string;
    mobile?: string;
    company?: string;
    address?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    notes?: string;
    is_key_contact: boolean;
    photo_url?: string;
    start_date?: string;
    end_date?: string;
}

interface ContactDirectoryProps {
    projectId: string;
}

const DEPARTMENTS = [
    'Production', 'Direction', 'Camera', 'Lighting', 'Sound', 'Art',
    'Wardrobe', 'Makeup', 'Stunts', 'VFX', 'Editorial', 'Music',
    'Locations', 'Transportation', 'Catering', 'Security', 'Cast', 'Other'
];

export default function ContactDirectory({ projectId }: ContactDirectoryProps) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDepartment, setFilterDepartment] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Form state
    const [form, setForm] = useState({
        name: '',
        department: 'Production',
        role: '',
        email: '',
        phone: '',
        mobile: '',
        company: '',
        address: '',
        emergency_contact: '',
        emergency_phone: '',
        notes: '',
        is_key_contact: false
    });

    // Fetch contacts
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/contacts`);
                if (res.ok) {
                    setContacts(await res.json());
                }
            } catch (error) {
                console.error('Error fetching contacts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, [projectId]);

    // Filter contacts
    const filteredContacts = contacts.filter(contact => {
        if (filterDepartment !== 'all' && contact.department !== filterDepartment) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return contact.name.toLowerCase().includes(query) ||
                contact.role.toLowerCase().includes(query) ||
                contact.email?.toLowerCase().includes(query) ||
                contact.company?.toLowerCase().includes(query);
        }
        return true;
    });

    // Group by department
    const groupedContacts = filteredContacts.reduce((acc, contact) => {
        if (!acc[contact.department]) acc[contact.department] = [];
        acc[contact.department].push(contact);
        return acc;
    }, {} as Record<string, Contact[]>);

    // Add/Update contact
    const saveContact = async () => {
        const contactData = {
            id: editingContact?.id || crypto.randomUUID(),
            ...form
        };

        if (editingContact) {
            setContacts(prev => prev.map(c => c.id === editingContact.id ? contactData : c));
        } else {
            setContacts(prev => [...prev, contactData]);
        }

        setShowAddModal(false);
        setEditingContact(null);
        resetForm();

        try {
            await fetch(`/api/projects/${projectId}/contacts${editingContact ? `/${editingContact.id}` : ''}`, {
                method: editingContact ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });
        } catch (error) {
            console.error('Error saving contact:', error);
        }
    };

    // Delete contact
    const deleteContact = async (contactId: string) => {
        if (!confirm('Delete this contact?')) return;

        setContacts(prev => prev.filter(c => c.id !== contactId));

        try {
            await fetch(`/api/projects/${projectId}/contacts/${contactId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    // Toggle key contact
    const toggleKeyContact = async (contactId: string) => {
        setContacts(prev => prev.map(c =>
            c.id === contactId ? { ...c, is_key_contact: !c.is_key_contact } : c
        ));

        try {
            const contact = contacts.find(c => c.id === contactId);
            await fetch(`/api/projects/${projectId}/contacts/${contactId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_key_contact: !contact?.is_key_contact })
            });
        } catch (error) {
            console.error('Error updating contact:', error);
        }
    };

    // Copy to clipboard
    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Reset form
    const resetForm = () => {
        setForm({
            name: '', department: 'Production', role: '', email: '', phone: '',
            mobile: '', company: '', address: '', emergency_contact: '',
            emergency_phone: '', notes: '', is_key_contact: false
        });
    };

    // Edit contact
    const startEdit = (contact: Contact) => {
        setEditingContact(contact);
        setForm({
            name: contact.name,
            department: contact.department,
            role: contact.role,
            email: contact.email || '',
            phone: contact.phone || '',
            mobile: contact.mobile || '',
            company: contact.company || '',
            address: contact.address || '',
            emergency_contact: contact.emergency_contact || '',
            emergency_phone: contact.emergency_phone || '',
            notes: contact.notes || '',
            is_key_contact: contact.is_key_contact
        });
        setShowAddModal(true);
    };

    // Export contacts
    const exportContacts = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/contacts/export`);
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'crew_contact_list.pdf';
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error exporting:', error);
        }
    };

    // Stats
    const keyContacts = contacts.filter(c => c.is_key_contact);
    const departments = [...new Set(contacts.map(c => c.department))];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Users className="text-yellow-500" />
                        Contact Directory
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Crew and production contacts
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={exportContacts}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white"
                    >
                        <Download size={16} />
                        Export
                    </button>
                    <button
                        onClick={() => {
                            resetForm();
                            setEditingContact(null);
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                    >
                        <Plus size={18} />
                        Add Contact
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Contacts</p>
                    <p className="text-2xl font-bold text-white">{contacts.length}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Departments</p>
                    <p className="text-2xl font-bold text-blue-400">{departments.length}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Key Contacts</p>
                    <p className="text-2xl font-bold text-yellow-400">{keyContacts.length}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Cast</p>
                    <p className="text-2xl font-bold text-purple-400">
                        {contacts.filter(c => c.department === 'Cast').length}
                    </p>
                </div>
            </div>

            {/* Key Contacts Quick Access */}
            {keyContacts.length > 0 && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-yellow-500 mb-3 flex items-center gap-2">
                        <Star size={16} />
                        Key Contacts
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {keyContacts.map(contact => (
                            <div key={contact.id} className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
                                <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 font-bold text-sm">
                                    {contact.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">{contact.name}</p>
                                    <p className="text-xs text-gray-500">{contact.role}</p>
                                </div>
                                {contact.mobile && (
                                    <a href={`tel:${contact.mobile}`} className="ml-2 p-1 hover:bg-white/10 rounded">
                                        <Phone size={14} className="text-gray-400" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search contacts..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white"
                    />
                </div>
                <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Departments</option>
                    {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>
            </div>

            {/* Contacts List */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedContacts).sort().map(([department, deptContacts]) => (
                        <div key={department}>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Building size={18} className="text-gray-500" />
                                {department}
                                <span className="text-sm text-gray-500 font-normal">({deptContacts.length})</span>
                            </h3>
                            <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left p-4 text-sm font-medium text-gray-500">Name</th>
                                            <th className="text-left p-4 text-sm font-medium text-gray-500">Role</th>
                                            <th className="text-left p-4 text-sm font-medium text-gray-500">Contact</th>
                                            <th className="text-left p-4 text-sm font-medium text-gray-500">Company</th>
                                            <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deptContacts.map((contact) => (
                                            <tr key={contact.id} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                                            contact.is_key_contact ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/10 text-gray-400'
                                                        }`}>
                                                            {contact.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium flex items-center gap-2">
                                                                {contact.name}
                                                                {contact.is_key_contact && <Star size={12} className="text-yellow-500" />}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-gray-400">{contact.role}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-1">
                                                        {contact.email && (
                                                            <button
                                                                onClick={() => copyToClipboard(contact.email!, `email-${contact.id}`)}
                                                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                                                            >
                                                                <Mail size={14} />
                                                                {contact.email}
                                                                {copiedId === `email-${contact.id}` ? (
                                                                    <Check size={12} className="text-green-400" />
                                                                ) : (
                                                                    <Copy size={12} className="opacity-0 group-hover:opacity-100" />
                                                                )}
                                                            </button>
                                                        )}
                                                        {contact.mobile && (
                                                            <a href={`tel:${contact.mobile}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                                                                <Phone size={14} />
                                                                {contact.mobile}
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm text-gray-500">{contact.company || '-'}</span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => toggleKeyContact(contact.id)}
                                                            className={`p-2 rounded-lg ${
                                                                contact.is_key_contact ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-500 hover:text-yellow-500 hover:bg-white/5'
                                                            }`}
                                                            title="Toggle key contact"
                                                        >
                                                            <Star size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => startEdit(contact)}
                                                            className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteContact(contact.id)}
                                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#121212]">
                            <h3 className="text-lg font-bold text-white">
                                {editingContact ? 'Edit Contact' : 'Add Contact'}
                            </h3>
                            <button onClick={() => { setShowAddModal(false); setEditingContact(null); }} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Department</label>
                                    <select
                                        value={form.department}
                                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Role/Position</label>
                                    <input
                                        type="text"
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        placeholder="e.g., Director, Gaffer"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Mobile</label>
                                    <input
                                        type="tel"
                                        value={form.mobile}
                                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Company</label>
                                <input
                                    type="text"
                                    value={form.company}
                                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="key_contact"
                                    checked={form.is_key_contact}
                                    onChange={(e) => setForm({ ...form, is_key_contact: e.target.checked })}
                                    className="w-4 h-4 rounded"
                                />
                                <label htmlFor="key_contact" className="text-sm text-gray-400">
                                    Mark as key contact (quick access)
                                </label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-[#121212]">
                            <button onClick={() => { setShowAddModal(false); setEditingContact(null); }} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={saveContact}
                                disabled={!form.name || !form.role}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                {editingContact ? 'Save Changes' : 'Add Contact'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
