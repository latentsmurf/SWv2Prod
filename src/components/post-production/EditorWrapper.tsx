'use client';

import React from 'react';
import SaboteurEditor from '@/components/studio/SaboteurEditor';

export default function EditorWrapper({ projectId }: { projectId: string }) {
    return (
        <div className="w-full h-full bg-black">
            <SaboteurEditor projectId={projectId} />
        </div>
    );
}
