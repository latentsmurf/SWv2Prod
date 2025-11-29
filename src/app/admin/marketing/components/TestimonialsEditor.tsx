'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Star, X } from 'lucide-react';
import { Testimonial } from '@/data/marketingPageData';

interface TestimonialsEditorProps {
    testimonials: Testimonial[];
    onChange: (testimonials: Testimonial[]) => void;
}

export default function TestimonialsEditor({ testimonials, onChange }: TestimonialsEditorProps) {
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

    const addTestimonial = () => {
        const newTestimonial: Testimonial = {
            id: Date.now().toString(),
            quote: 'Amazing product!',
            author: 'John Doe',
            role: 'CEO',
            company: 'Acme Inc',
            rating: 5
        };
        onChange([...testimonials, newTestimonial]);
        setEditingTestimonial(newTestimonial);
    };

    const deleteTestimonial = (id: string) => {
        onChange(testimonials.filter(t => t.id !== id));
    };

    const updateTestimonial = (updated: Testimonial) => {
        onChange(testimonials.map(t => t.id === updated.id ? updated : t));
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">Testimonials</h2>
                    <p className="text-sm text-gray-500">Customer reviews and feedback</p>
                </div>
                <button onClick={addTestimonial} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-black rounded-lg text-sm font-medium">
                    <Plus size={16} />
                    Add Testimonial
                </button>
            </div>
            <div className="p-4 space-y-3">
                {testimonials.map(testimonial => (
                    <div key={testimonial.id} className="p-4 bg-white/5 rounded-lg group">
                        <div className="flex items-start justify-between">
                            <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                <button onClick={() => setEditingTestimonial(testimonial)} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white">
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => deleteTestimonial(testimonial.id)} className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-medium">
                                {testimonial.author.charAt(0)}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">{testimonial.author}</div>
                                <div className="text-xs text-gray-500">{testimonial.role}, {testimonial.company}</div>
                            </div>
                            <div className="ml-auto flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} size={12} className={i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingTestimonial && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingTestimonial(null)}>
                    <div className="w-full max-w-lg p-6 bg-[#0a0a0a] border border-white/10 rounded-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Edit Testimonial</h3>
                            <button onClick={() => setEditingTestimonial(null)} className="p-1 hover:bg-white/10 rounded">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Quote</label>
                                <textarea
                                    value={editingTestimonial.quote}
                                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Author</label>
                                    <input
                                        type="text"
                                        value={editingTestimonial.author}
                                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, author: e.target.value })}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Role</label>
                                    <input
                                        type="text"
                                        value={editingTestimonial.role}
                                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Company</label>
                                <input
                                    type="text"
                                    value={editingTestimonial.company}
                                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Rating</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setEditingTestimonial({ ...editingTestimonial, rating: r })}
                                            className={`p-2 rounded ${editingTestimonial.rating >= r ? 'text-yellow-400' : 'text-gray-600'}`}
                                        >
                                            <Star size={20} className={editingTestimonial.rating >= r ? 'fill-yellow-400' : ''} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button onClick={() => setEditingTestimonial(null)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                <button
                                    onClick={() => { updateTestimonial(editingTestimonial); setEditingTestimonial(null); }}
                                    className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
