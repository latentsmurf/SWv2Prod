import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface TitlePageData {
    title: string;
    credit: string;
    author: string;
    source: string;
    contact: string;
}

interface TitlePageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: TitlePageData) => void;
    initialData: TitlePageData;
}

export default function TitlePageModal({ isOpen, onClose, onSave, initialData }: TitlePageModalProps) {
    const [formData, setFormData] = useState<TitlePageData>(initialData);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-lg p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Title Page</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="SCRIPT TITLE"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Credit</label>
                        <input
                            type="text"
                            value={formData.credit}
                            onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="written by"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Author(s)</label>
                        <input
                            type="text"
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="Author Name"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Source Material</label>
                        <input
                            type="text"
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="Based on..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Contact Info</label>
                        <textarea
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
                            placeholder="Address, Phone, Email..."
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors"
                        >
                            <Save size={16} />
                            Save Title Page
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
