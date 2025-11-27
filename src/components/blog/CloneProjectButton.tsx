'use client';

import React, { useState } from 'react';
import { Copy, Check, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CloneProjectButtonProps {
    template_id: string;
}

export default function CloneProjectButton({ template_id }: CloneProjectButtonProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleClone = async () => {
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);

            // Redirect after short delay
            setTimeout(() => {
                router.push('/production');
            }, 1500);
        }, 2000);

        // Real implementation:
        // await fetch('/api/projects/clone', { method: 'POST', body: JSON.stringify({ template_id }) });
    };

    return (
        <div className="my-8 p-6 rounded-xl bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h4 className="text-lg font-bold text-white mb-1">Try this Template</h4>
                <p className="text-sm text-gray-400">Clone this project to your workspace and start editing immediately.</p>
            </div>

            <button
                onClick={handleClone}
                disabled={loading || success}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-300 min-w-[160px] justify-center
          ${success
                        ? 'bg-green-500 text-black'
                        : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-105'
                    }
          ${loading ? 'opacity-80 cursor-wait' : ''}
        `}
            >
                {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : success ? (
                    <>
                        <Check size={20} /> Cloned!
                    </>
                ) : (
                    <>
                        <Copy size={20} /> Clone Project
                    </>
                )}
            </button>
        </div>
    );
}
