'use client';

import React, { useState } from 'react';
import { Download, FileCode } from 'lucide-react';

export function ExportManager() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Mock export call
            console.log('Exporting EDL...');
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate download
            const element = document.createElement("a");
            const file = new Blob(["TITLE: SCENEWEAVER_DEMO\n001  AX       V     C        00:00:00:00 00:00:05:00 00:00:00:00 00:00:05:00"], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = "project.edl";
            document.body.appendChild(element);
            element.click();
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="p-6 bg-neutral-900 rounded-xl border border-neutral-800 text-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileCode size={24} className="text-orange-500" />
                Export Project
            </h2>
            <p className="text-neutral-400 mb-6">Generate professional exchange formats for finishing.</p>

            <div className="flex gap-4">
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                >
                    {isExporting ? 'Generating...' : <><Download size={18} /> Export EDL (CMX 3600)</>}
                </button>
                <button
                    disabled
                    className="flex-1 bg-neutral-800/50 text-neutral-500 border border-neutral-800 py-3 rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                >
                    <Download size={18} /> Export XML (Coming Soon)
                </button>
            </div>
        </div>
    );
}
