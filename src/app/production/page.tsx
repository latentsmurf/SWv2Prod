'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
    Film, Layers, Camera, List, Users, Layout, Zap, Grid, Video,
    Calendar, FileText, Eye, Images, Smartphone, Wand2, Mic, Music,
    Download, Subtitles, UserCheck, History, Play, Sparkles
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import LooksPanel from '@/components/production/LooksPanel';
import ShotList from '@/components/production/ShotList';
import SceneManager from '@/components/production/SceneManager';
import StoryboardViewer from '@/components/production/StoryboardViewer';
import StoryboardExport from '@/components/production/StoryboardExport';
import ShotListManager from '@/components/production/ShotListManager';
import ExtrasManager from '@/components/production/ExtrasManager';
import BlockingDiagram from '@/components/production/BlockingDiagram';
import StuntCoordination from '@/components/production/StuntCoordination';
import MultiCamSetup from '@/components/production/MultiCamSetup';
import GeneratedMediaLibrary from '@/components/production/GeneratedMediaLibrary';
import EpisodeManager from '@/components/production/EpisodeManager';
import ScriptToShotPipeline from '@/components/production/ScriptToShotPipeline';
import CharacterConsistencyPanel from '@/components/production/CharacterConsistencyPanel';
import TimelinePreview from '@/components/production/TimelinePreview';
import GenerationProgress from '@/components/production/GenerationProgress';
import VoiceCloning from '@/components/ai/VoiceCloning';
import MusicGenerator from '@/components/ai/MusicGenerator';
import PlatformExporter from '@/components/export/PlatformExporter';
import SubtitleExporter from '@/components/export/SubtitleExporter';
import ApprovalWorkflow from '@/components/collaboration/ApprovalWorkflow';
import ProjectVersioning from '@/components/project/ProjectVersioning';
import { Scene, Shot, Project } from '@/types';

type MainSection = 'creative' | 'planning' | 'coordination' | 'media' | 'ai-tools' | 'export' | 'collaboration';

interface SubTab {
    key: string;
    label: string;
    icon: React.ReactNode;
}

const SECTIONS: { key: MainSection; label: string; icon: React.ReactNode; description: string }[] = [
    { key: 'creative', label: 'Creative', icon: <Film size={16} />, description: 'Scenes, storyboards, and shot generation' },
    { key: 'planning', label: 'Planning', icon: <List size={16} />, description: 'Shot lists, blocking, and setups' },
    { key: 'coordination', label: 'Coordination', icon: <Users size={16} />, description: 'Extras, stunts, and multi-cam' },
    { key: 'ai-tools', label: 'AI Tools', icon: <Wand2 size={16} />, description: 'Voice, music, and smart prompts' },
    { key: 'media', label: 'Media Library', icon: <Images size={16} />, description: 'Browse and manage generated media' },
    { key: 'export', label: 'Export', icon: <Download size={16} />, description: 'Platform export and subtitles' },
    { key: 'collaboration', label: 'Collaborate', icon: <UserCheck size={16} />, description: 'Approvals and versioning' },
];

// Standard sub-tabs (non-micro-drama)
const STANDARD_SUB_TABS: Record<MainSection, SubTab[]> = {
    creative: [
        { key: 'scenes', label: 'Scenes', icon: <Film size={14} /> },
        { key: 'storyboard', label: 'Storyboard', icon: <Layers size={14} /> },
        { key: 'pipeline', label: 'Script to Shot', icon: <Sparkles size={14} /> },
        { key: 'generate', label: 'Generate Shots', icon: <Camera size={14} /> },
        { key: 'characters', label: 'Characters', icon: <Users size={14} /> },
    ],
    planning: [
        { key: 'shot-list', label: 'Shot List', icon: <List size={14} /> },
        { key: 'blocking', label: 'Blocking', icon: <Layout size={14} /> },
        { key: 'multicam', label: 'Multi-Cam', icon: <Grid size={14} /> },
        { key: 'preview', label: 'Timeline Preview', icon: <Play size={14} /> },
    ],
    coordination: [
        { key: 'extras', label: 'Background/Extras', icon: <Users size={14} /> },
        { key: 'stunts', label: 'Stunts', icon: <Zap size={14} /> },
    ],
    'ai-tools': [
        { key: 'voice', label: 'Voice Studio', icon: <Mic size={14} /> },
        { key: 'music', label: 'Music Generator', icon: <Music size={14} /> },
    ],
    media: [
        { key: 'library', label: 'All Media', icon: <Images size={14} /> },
    ],
    export: [
        { key: 'platforms', label: 'Platform Export', icon: <Download size={14} /> },
        { key: 'subtitles', label: 'Subtitles', icon: <Subtitles size={14} /> },
    ],
    collaboration: [
        { key: 'approvals', label: 'Approvals', icon: <UserCheck size={14} /> },
        { key: 'versions', label: 'Version History', icon: <History size={14} /> },
    ],
};

// Micro drama sub-tabs (with Episodes)
const MICRO_DRAMA_SUB_TABS: Record<MainSection, SubTab[]> = {
    creative: [
        { key: 'episodes', label: 'Episodes', icon: <Smartphone size={14} /> },
        { key: 'scenes', label: 'Scenes', icon: <Film size={14} /> },
        { key: 'storyboard', label: 'Storyboard', icon: <Layers size={14} /> },
        { key: 'pipeline', label: 'Script to Shot', icon: <Sparkles size={14} /> },
        { key: 'generate', label: 'Generate Shots', icon: <Camera size={14} /> },
        { key: 'characters', label: 'Characters', icon: <Users size={14} /> },
    ],
    planning: [
        { key: 'shot-list', label: 'Shot List', icon: <List size={14} /> },
        { key: 'blocking', label: 'Blocking', icon: <Layout size={14} /> },
        { key: 'multicam', label: 'Multi-Cam', icon: <Grid size={14} /> },
        { key: 'preview', label: 'Timeline Preview', icon: <Play size={14} /> },
    ],
    coordination: [
        { key: 'extras', label: 'Background/Extras', icon: <Users size={14} /> },
        { key: 'stunts', label: 'Stunts', icon: <Zap size={14} /> },
    ],
    'ai-tools': [
        { key: 'voice', label: 'Voice Studio', icon: <Mic size={14} /> },
        { key: 'music', label: 'Music Generator', icon: <Music size={14} /> },
    ],
    media: [
        { key: 'library', label: 'All Media', icon: <Images size={14} /> },
    ],
    export: [
        { key: 'platforms', label: 'Platform Export', icon: <Download size={14} /> },
        { key: 'subtitles', label: 'Subtitles', icon: <Subtitles size={14} /> },
    ],
    collaboration: [
        { key: 'approvals', label: 'Approvals', icon: <UserCheck size={14} /> },
        { key: 'versions', label: 'Version History', icon: <History size={14} /> },
    ],
};

function ProductionLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Film className="text-yellow-500" size={24} />
                </div>
                <p className="text-gray-500 text-sm">Loading production studio...</p>
            </div>
        </div>
    );
}

function ProductionContent() {
    const searchParams = useSearchParams();
    const projectIdParam = searchParams.get('projectId');
    
    const [projectId, setProjectId] = useState<string | null>(projectIdParam);
    const [project, setProject] = useState<Project | null>(null);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [shots, setShots] = useState<Shot[]>([]);
    const [activeSection, setActiveSection] = useState<MainSection>('creative');
    const [activeSubTab, setActiveSubTab] = useState<string>('scenes');
    const [showExportModal, setShowExportModal] = useState(false);
    const [showLooksPanel, setShowLooksPanel] = useState(true);

    // Fetch project
    useEffect(() => {
        const fetchProject = async () => {
            try {
                let pid = projectId;
                
                // If no projectId, get the latest project
                if (!pid) {
                    const res = await fetch('/api/projects');
                    if (res.ok) {
                        const projects = await res.json();
                        if (projects.length > 0) {
                            projects.sort((a: Project, b: Project) => 
                                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                            );
                            pid = projects[0].id || projects[0]._id;
                            setProjectId(pid);
                        }
                    }
                }

                if (pid) {
                    const res = await fetch(`/api/projects/${pid}`);
                    if (res.ok) {
                        setProject(await res.json());
                    }
                    
                    // Fetch scenes
                    const scenesRes = await fetch(`/api/projects/${pid}/scenes`);
                    if (scenesRes.ok) {
                        setScenes(await scenesRes.json());
                    }
                    
                    // Fetch shots
                    const shotsRes = await fetch(`/api/projects/${pid}/shots`);
                    if (shotsRes.ok) {
                        setShots(await shotsRes.json());
                    }
                }
            } catch (error) {
                console.error('Error fetching project:', error);
            }
        };

        fetchProject();
    }, [projectId]);

    // Detect if this is a micro drama project
    const isMicroDrama = project?.genre?.startsWith('micro-');
    
    // Use appropriate sub-tabs based on project type
    const SUB_TABS = isMicroDrama ? MICRO_DRAMA_SUB_TABS : STANDARD_SUB_TABS;

    // Reset sub-tab when section changes
    useEffect(() => {
        const firstTab = SUB_TABS[activeSection][0];
        if (firstTab) {
            setActiveSubTab(firstTab.key);
        }
    }, [activeSection, isMicroDrama]);

    // Determine if looks panel should show (hide for full-width panels)
    const hideLooksPanel = [
        'shot-list', 'extras', 'blocking', 'stunts', 'multicam', 'library', 
        'episodes', 'pipeline', 'characters', 'preview', 'voice', 'music',
        'platforms', 'subtitles', 'approvals', 'versions'
    ].includes(activeSubTab) || ['media', 'ai-tools', 'export', 'collaboration'].includes(activeSection);

    const renderContent = () => {
        if (!projectId) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center mx-auto mb-4">
                            <Film className="text-gray-400 dark:text-gray-500" size={28} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No project selected</h3>
                        <p className="text-sm text-gray-500 max-w-xs">
                            Create a new project or select an existing one to start production.
                        </p>
                    </div>
                </div>
            );
        }

        // Creative section
        if (activeSection === 'creative') {
            if (activeSubTab === 'episodes') return <EpisodeManager projectId={projectId} genre={project?.genre} />;
            if (activeSubTab === 'scenes') return <SceneManager projectId={projectId} onScenesChange={setScenes} />;
            if (activeSubTab === 'storyboard') return <StoryboardViewer projectId={projectId} scenes={scenes} onExport={() => setShowExportModal(true)} />;
            if (activeSubTab === 'pipeline') return <ScriptToShotPipeline projectId={projectId} scenes={scenes} />;
            if (activeSubTab === 'generate') return <ShotList projectId={projectId} />;
            if (activeSubTab === 'characters') return <CharacterConsistencyPanel projectId={projectId} />;
        }
        
        // Planning section
        if (activeSection === 'planning') {
            if (activeSubTab === 'shot-list') return <ShotListManager projectId={projectId} />;
            if (activeSubTab === 'blocking') return <BlockingDiagram projectId={projectId} />;
            if (activeSubTab === 'multicam') return <MultiCamSetup projectId={projectId} />;
            if (activeSubTab === 'preview') return <TimelinePreview projectId={projectId} shots={shots} />;
        }
        
        // Coordination section
        if (activeSection === 'coordination') {
            if (activeSubTab === 'extras') return <ExtrasManager projectId={projectId} />;
            if (activeSubTab === 'stunts') return <StuntCoordination projectId={projectId} />;
        }
        
        // AI Tools section
        if (activeSection === 'ai-tools') {
            if (activeSubTab === 'voice') return <VoiceCloning projectId={projectId} />;
            if (activeSubTab === 'music') return <MusicGenerator projectId={projectId} sceneMood={project?.genre} />;
        }
        
        // Media section
        if (activeSection === 'media') {
            return <GeneratedMediaLibrary projectId={projectId} />;
        }
        
        // Export section
        if (activeSection === 'export') {
            if (activeSubTab === 'platforms') return <PlatformExporter projectId={projectId} />;
            if (activeSubTab === 'subtitles') return <SubtitleExporter projectId={projectId} />;
        }
        
        // Collaboration section
        if (activeSection === 'collaboration') {
            if (activeSubTab === 'approvals') return <ApprovalWorkflow projectId={projectId} userRole="director" />;
            if (activeSubTab === 'versions') return <ProjectVersioning projectId={projectId} />;
        }
        
        return null;
    };

    // Stats
    const stats = {
        scenes: scenes.length,
        shots: shots.length,
        rendered: shots.filter(s => s.status === 'completed').length
    };

    return (
        <div className="h-full flex -m-6">
            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {/* Navigation Header */}
                <div className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/5 px-6 pt-4">
                    {/* Main Section Tabs */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {SECTIONS.map((section) => {
                                const isActive = activeSection === section.key;
                                return (
                                    <button
                                        key={section.key}
                                        onClick={() => setActiveSection(section.key)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            isActive
                                                ? 'bg-yellow-500 text-black'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {section.icon}
                                        {section.label}
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <Film size={12} />
                                {stats.scenes} scenes
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Camera size={12} />
                                {stats.shots} shots
                            </span>
                            <span className="flex items-center gap-1.5 text-green-500 dark:text-green-400">
                                <Eye size={12} />
                                {stats.rendered} rendered
                            </span>
                        </div>
                    </div>

                    {/* Sub-tabs */}
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
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                    {hideLooksPanel ? (
                        <div className="h-full overflow-auto p-6">
                            {renderContent()}
                        </div>
                    ) : (
                        renderContent()
                    )}
                </div>
            </div>

            {/* Right Sidebar - Looks Panel (only for certain tabs) */}
            {!hideLooksPanel && showLooksPanel && <LooksPanel />}

            {/* Export Modal */}
            {showExportModal && projectId && (
                <StoryboardExport
                    projectId={projectId}
                    projectName={project?.name || 'Untitled'}
                    scenes={scenes}
                    shots={shots}
                    onClose={() => setShowExportModal(false)}
                />
            )}

            {/* Floating Generation Progress */}
            {projectId && (
                <GenerationProgress 
                    projectId={projectId}
                    onItemComplete={(item) => console.log('Completed:', item)}
                />
            )}
        </div>
    );
}

export default function ProductionPage() {
    return (
        <Suspense fallback={<ProductionLoading />}>
            <ProductionContent />
        </Suspense>
    );
}
