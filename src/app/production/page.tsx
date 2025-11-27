import React from 'react';
import LooksPanel from '@/components/production/LooksPanel';
import ShotList from '@/components/production/ShotList';

export default function ProductionPage() {
    return (
        <div className="flex h-full">
            {/* Main Content Area - Shot List */}
            <div className="flex-1 overflow-hidden">
                <ShotList />
            </div>

            {/* Right Sidebar - Looks Panel */}
            <LooksPanel />
        </div>
    );
}
