'use client';

import React, { useState } from 'react';
import { Plus, Eye, Edit } from 'lucide-react';
import { EmailTemplate } from '@/lib/email';
import TemplatePreviewModal from './modals/TemplatePreviewModal';
import TemplateEditorModal from './modals/TemplateEditorModal';

interface TemplatesTabProps {
    templates: EmailTemplate[];
    onRefresh: () => void;
}

const categoryColors: Record<string, string> = {
    transactional: 'from-blue-500 to-cyan-500',
    marketing: 'from-purple-500 to-pink-500',
    notification: 'from-yellow-500 to-orange-500',
    onboarding: 'from-green-500 to-emerald-500',
};

export default function TemplatesTab({ templates, onRefresh }: TemplatesTabProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

    return (
        <div className="space-y-4">
            {/* Actions Bar */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    {templates.length} templates
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-yellow-500 hover:bg-yellow-400 text-black"
                >
                    <Plus size={16} />
                    New Template
                </button>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                    <div
                        key={template.id}
                        className="rounded-xl border overflow-hidden bg-[#0a0a0a] border-white/10"
                    >
                        {/* Preview Header */}
                        <div 
                            className={`h-24 bg-gradient-to-br ${categoryColors[template.category] || 'from-gray-500 to-gray-600'} p-4 flex items-end`}
                        >
                            <span className="px-2 py-1 rounded text-xs font-medium bg-black/30 text-white capitalize">
                                {template.category}
                            </span>
                        </div>
                        
                        {/* Content */}
                        <div className="p-4">
                            <h3 className="font-semibold mb-1 text-white">
                                {template.name}
                            </h3>
                            <p className="text-sm mb-3 line-clamp-2 text-gray-500">
                                {template.description || template.subject}
                            </p>
                            
                            {/* Variables */}
                            {template.variables.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {template.variables.slice(0, 3).map((v, i) => (
                                        <span 
                                            key={i}
                                            className="px-2 py-0.5 rounded text-xs font-mono bg-white/5 text-gray-400"
                                        >
                                            {v}
                                        </span>
                                    ))}
                                    {template.variables.length > 3 && (
                                        <span className="text-xs text-gray-500">
                                            +{template.variables.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPreviewTemplate(template)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors bg-white/5 hover:bg-white/10 text-white"
                                >
                                    <Eye size={14} />
                                    Preview
                                </button>
                                <button
                                    onClick={() => setEditingTemplate(template)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors bg-white/5 hover:bg-white/10 text-white"
                                >
                                    <Edit size={14} />
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {templates.length === 0 && (
                    <div className="col-span-3 p-8 text-center text-gray-500">
                        No templates yet
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {previewTemplate && (
                <TemplatePreviewModal 
                    template={previewTemplate}
                    onClose={() => setPreviewTemplate(null)}
                />
            )}

            {/* Edit Modal */}
            {(showCreateModal || editingTemplate) && (
                <TemplateEditorModal
                    template={editingTemplate}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingTemplate(null);
                    }}
                    onSaved={() => {
                        setShowCreateModal(false);
                        setEditingTemplate(null);
                        onRefresh();
                    }}
                />
            )}
        </div>
    );
}
