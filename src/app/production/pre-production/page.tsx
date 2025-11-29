'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    FileText, Image, MapPin, Film, Users, Sparkles, ChevronDown,
    Clapperboard, Palette, Settings2, Shirt, Scissors, Loader2
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SectionTabs from '@/components/ui/SectionTabs';
import ScriptEditorOriginal from "@/components/pre-production/script/ScriptEditor";
import ScriptEditor from '@/components/pre-production/ScriptEditor';
import SceneBreakdownSheet from '@/components/pre-production/SceneBreakdownSheet';
import MoodBoard from '@/components/pre-production/MoodBoard';
import LocationScout from '@/components/pre-production/LocationScout';
import CastingManager from '@/components/pre-production/CastingManager';
import AIScriptAssistant from '@/components/pre-production/AIScriptAssistant';
import CastDatabase from '@/components/library/CastDatabase';
import WardrobeDatabase from '@/components/library/WardrobeDatabase';
import MakeupHairDatabase from '@/components/library/MakeupHairDatabase';
import EnvironmentsDatabase from '@/components/library/EnvironmentsDatabase';

type MainSection = 'script' | 'breakdown' | 'talent' | 'design';

interface SubTab {
    key: string;
    label: string;
    icon: React.ReactNode;
}

const SECTIONS: { key: MainSection; label: string; icon: React.ReactNode; description: string }[] = [
    { key: 'script', label: 'Script', icon: <FileText size={16} />, description: 'Write and edit your screenplay' },
    { key: 'breakdown', label: 'Breakdown', icon: <Scissors size={16} />, description: 'Analyze scenes and requirements' },
    { key: 'talent', label: 'Talent', icon: <Users size={16} />, description: 'Cast, wardrobe, and makeup' },
    { key: 'design', label: 'Design', icon: <Palette size={16} />, description: 'Mood boards and locations' },
];

const SUB_TABS: Record<MainSection, SubTab[]> = {
    script: [
        { key: 'editor', label: 'Script Editor', icon: <FileText size={14} /> },
        { key: 'fountain', label: 'Fountain', icon: <FileText size={14} /> },
        { key: 'assistant', label: 'AI Assistant', icon: <Sparkles size={14} /> },
    ],
    breakdown: [
        { key: 'scenes', label: 'Scene Breakdown', icon: <Film size={14} /> },
    ],
    talent: [
        { key: 'cast', label: 'Cast', icon: <Users size={14} /> },
        { key: 'wardrobe', label: 'Wardrobe', icon: <Shirt size={14} /> },
        { key: 'makeup', label: 'Makeup/Hair', icon: <Sparkles size={14} /> },
    ],
    design: [
        { key: 'moodboard', label: 'Mood Board', icon: <Image size={14} /> },
        { key: 'locations', label: 'Locations', icon: <MapPin size={14} /> },
    ],
};

function PreProductionLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <FileText className="text-yellow-500" size={24} />
                </div>
                <p className="text-gray-500 text-sm">Loading pre-production...</p>
            </div>
        </div>
    );
}

function PreProductionContent() {
    const searchParams = useSearchParams();
    const projectIdParam = searchParams.get('projectId');
    
    const [projectId, setProjectId] = useState<string | null>(projectIdParam);
    const [activeSection, setActiveSection] = useState<MainSection>('script');
    const [activeSubTab, setActiveSubTab] = useState<string>('editor');

    // Fetch project if not provided
    useEffect(() => {
        const fetchProject = async () => {
            if (!projectId) {
                try {
                    const res = await fetch('/api/projects');
                    if (res.ok) {
                        const projects = await res.json();
                        if (projects.length > 0) {
                            projects.sort((a: any, b: any) => 
                                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                            );
                            setProjectId(projects[0].id || projects[0]._id);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching projects:', error);
                }
            }
        };
        fetchProject();
    }, [projectId]);

    // Reset sub-tab when section changes
    useEffect(() => {
        const firstTab = SUB_TABS[activeSection][0];
        if (firstTab) {
            setActiveSubTab(firstTab.key);
        }
    }, [activeSection]);

    const renderContent = () => {
        const pid = projectId || 'default';
        
        // Script section
        if (activeSection === 'script') {
            if (activeSubTab === 'editor') return <ScriptEditorOriginal />;
            if (activeSubTab === 'fountain') return <ScriptEditor projectId={pid} />;
            if (activeSubTab === 'assistant') return <AIScriptAssistant projectId={pid} />;
        }
        
        // Breakdown section
        if (activeSection === 'breakdown') {
            return <SceneBreakdownSheet projectId={pid} />;
        }
        
        // Talent section
        if (activeSection === 'talent') {
            if (activeSubTab === 'cast') return <CastDatabase projectId={pid} />;
            if (activeSubTab === 'wardrobe') return <WardrobeDatabase projectId={pid} />;
            if (activeSubTab === 'makeup') return <MakeupHairDatabase projectId={pid} />;
        }
        
        // Design section
        if (activeSection === 'design') {
            if (activeSubTab === 'moodboard') return <MoodBoard projectId={pid} />;
            if (activeSubTab === 'locations') return <EnvironmentsDatabase />;
        }
        
        return null;
    };

    // Full-height content areas (editors)
    const isFullHeight = activeSection === 'script' && (activeSubTab === 'editor' || activeSubTab === 'fountain');

    return (
        <div className="h-full flex flex-col -m-6">
            {/* Main Section Selector */}
            <div className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/5 px-6 pt-4">
                {/* Section Tabs */}
                <div className="flex items-center gap-2 mb-4">
                    {SECTIONS.map((section) => {
                        const isActive = activeSection === section.key;
                        return (
                            <button
                                key={section.key}
                                onClick={() => setActiveSection(section.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-yellow-500 text-black'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                            >
                                {section.icon}
                                {section.label}
                            </button>
                        );
                    })}
                </div>

                {/* Sub-tabs */}
                {SUB_TABS[activeSection].length > 1 && (
                    <div className="flex items-center gap-1 pb-3">
                        {SUB_TABS[activeSection].map((tab) => {
                            const isActive = activeSubTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveSubTab(tab.key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        isActive
                                            ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white'
                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-transparent">
                {isFullHeight ? (
                    renderContent()
                ) : (
                    <div className="h-full overflow-auto p-6">
                        {renderContent()}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PreProductionPage() {
    return (
        <Suspense fallback={<PreProductionLoading />}>
            <PreProductionContent />
        </Suspense>
    );
}
