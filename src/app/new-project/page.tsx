import React from 'react';
import GreenlightWizard from '@/components/wizard/GreenlightWizard';

export default function NewProjectPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">Create a new project</h1>
                <p className="text-gray-400 mb-8">You can always adjust cast, wardrobe, locations, and props later, but choosing them now helps keep your visuals consistent from the first storyboard.</p>
                <GreenlightWizard />
            </div>
        </div>
    );
}
