'use client';

import React, { useState } from 'react';
import {
    Archive, Package, Car, Dog, Swords, Camera, Lightbulb, Flame,
    Image, FolderOpen, Search
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import ReferenceLibrary from '@/components/library/ReferenceLibrary';
import PropsDatabase from '@/components/library/PropsDatabase';
import VehiclesDatabase from '@/components/library/VehiclesDatabase';
import AnimalsDatabase from '@/components/library/AnimalsDatabase';
import WeaponsDatabase from '@/components/library/WeaponsDatabase';
import CameraLensDatabase from '@/components/library/CameraLensDatabase';
import LightingGripDatabase from '@/components/library/LightingGripDatabase';
import SFXDatabase from '@/components/library/SFXDatabase';

type MainSection = 'references' | 'props' | 'equipment';

interface SubTab {
    key: string;
    label: string;
    icon: React.ReactNode;
}

const SECTIONS: { key: MainSection; label: string; icon: React.ReactNode; description: string }[] = [
    { key: 'references', label: 'References', icon: <Image size={16} />, description: 'Visual references and inspiration' },
    { key: 'props', label: 'Props & Objects', icon: <Package size={16} />, description: 'Props, vehicles, animals, weapons' },
    { key: 'equipment', label: 'Equipment', icon: <Camera size={16} />, description: 'Cameras, lighting, and SFX' },
];

const SUB_TABS: Record<MainSection, SubTab[]> = {
    references: [
        { key: 'library', label: 'Reference Library', icon: <Image size={14} /> },
    ],
    props: [
        { key: 'props', label: 'Props', icon: <Package size={14} /> },
        { key: 'vehicles', label: 'Vehicles', icon: <Car size={14} /> },
        { key: 'animals', label: 'Animals', icon: <Dog size={14} /> },
        { key: 'weapons', label: 'Weapons', icon: <Swords size={14} /> },
    ],
    equipment: [
        { key: 'cameras', label: 'Cameras & Lenses', icon: <Camera size={14} /> },
        { key: 'lighting', label: 'Lighting & Grip', icon: <Lightbulb size={14} /> },
        { key: 'sfx', label: 'Practical SFX', icon: <Flame size={14} /> },
    ],
};

export default function LibraryPage() {
    const [activeSection, setActiveSection] = useState<MainSection>('references');
    const [activeSubTab, setActiveSubTab] = useState<string>('library');
    const [searchQuery, setSearchQuery] = useState('');

    // Reset sub-tab when section changes
    React.useEffect(() => {
        const firstTab = SUB_TABS[activeSection][0];
        if (firstTab) {
            setActiveSubTab(firstTab.key);
        }
    }, [activeSection]);

    const renderContent = () => {
        // References section
        if (activeSection === 'references') {
            return <ReferenceLibrary />;
        }
        
        // Props section
        if (activeSection === 'props') {
            if (activeSubTab === 'props') return <PropsDatabase />;
            if (activeSubTab === 'vehicles') return <VehiclesDatabase />;
            if (activeSubTab === 'animals') return <AnimalsDatabase />;
            if (activeSubTab === 'weapons') return <WeaponsDatabase />;
        }
        
        // Equipment section
        if (activeSection === 'equipment') {
            if (activeSubTab === 'cameras') return <CameraLensDatabase />;
            if (activeSubTab === 'lighting') return <LightingGripDatabase />;
            if (activeSubTab === 'sfx') return <SFXDatabase />;
        }
        
        return null;
    };

    return (
        <div className="h-full flex flex-col -m-6">
            {/* Navigation Header */}
            <div className="bg-[#0a0a0a] border-b border-white/5 px-6 pt-4">
                {/* Header with search */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <Archive size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Asset Vault</h1>
                            <p className="text-xs text-gray-500">Production assets and references</p>
                        </div>
                    </div>
                    
                    {/* Global Search */}
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search all assets..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-white/20 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Main Section Tabs */}
                <div className="flex items-center gap-2 mb-3">
                    {SECTIONS.map((section) => {
                        const isActive = activeSection === section.key;
                        return (
                            <button
                                key={section.key}
                                onClick={() => setActiveSection(section.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-purple-500 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
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
                                            ? 'bg-white/10 text-white'
                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
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
            <div className="flex-1 overflow-auto p-6">
                {renderContent()}
            </div>
        </div>
    );
}
