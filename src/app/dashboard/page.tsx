import React from 'react';
import { QuickActions, ResourceWidget, RecentProjects, ActivityFeed } from '@/components/dashboard/DashboardWidgets';

// Mock Data
const MOCK_PROJECTS = [
    { id: '1', name: 'Neon Rain', thumbnail: '', lastEdited: '2 hours ago', status: 'In Progress' as const },
    { id: '2', name: 'Cyber Cafe Commercial', thumbnail: '', lastEdited: '1 day ago', status: 'Rendering' as const },
    { id: '3', name: 'Mars Rover Doc', thumbnail: '', lastEdited: '3 days ago', status: 'Completed' as const },
];

const MOCK_ACTIVITIES = [
    { id: '1', text: "Audio finished processing for Scene 3", timestamp: "10 mins ago", type: 'render' as const },
    { id: '2', text: "Client left a comment on 'Neon Rain'", timestamp: "1 hour ago", type: 'comment' as const },
    { id: '3', text: "Export 'Final_v2.mp4' completed", timestamp: "2 hours ago", type: 'system' as const },
    { id: '4', text: "New script 'The Heist' imported", timestamp: "5 hours ago", type: 'system' as const },
];

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back to SceneWeaver.</h1>
                    <p className="text-neutral-400 mt-1">Pick up where you left off, or start a new project by choosing your cast, wardrobe, locations, and props.</p>
                </header>

                <QuickActions />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2">
                        <RecentProjects projects={MOCK_PROJECTS} />

                        {/* Maybe another widget here? */}
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">
                        <ResourceWidget />
                        <ActivityFeed activities={MOCK_ACTIVITIES} />
                    </div>
                </div>
            </div>
        </div>
    );
}
