'use client';

import React, { useState, useEffect } from 'react';
import {
    Link2, Film, Image, FileText, MapPin, Users, Shirt,
    Package, ChevronRight, ExternalLink, Loader2, AlertCircle
} from 'lucide-react';
import { Asset, Scene, Shot, Project } from '@/types';

interface AssetUsage {
    type: 'project' | 'scene' | 'shot';
    id: string;
    name: string;
    thumbnail?: string;
    project_name?: string;
}

interface AssetDependenciesProps {
    assetId: string;
    assetType: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
    project: Film,
    scene: FileText,
    shot: Image,
    cast: Users,
    location: MapPin,
    wardrobe: Shirt,
    prop: Package,
};

export default function AssetDependencies({ assetId, assetType }: AssetDependenciesProps) {
    const [usages, setUsages] = useState<AssetUsage[]>([]);
    const [loading, setLoading] = useState(true);
    const [asset, setAsset] = useState<Asset | null>(null);

    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                // Fetch asset details
                const assetRes = await fetch(`/api/library/assets/${assetId}`);
                if (assetRes.ok) {
                    setAsset(await assetRes.json());
                }

                // Fetch where this asset is used
                const usageRes = await fetch(`/api/library/assets/${assetId}/usage`);
                if (usageRes.ok) {
                    setUsages(await usageRes.json());
                }
            } catch (error) {
                console.error('Error fetching dependencies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDependencies();
    }, [assetId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin text-yellow-500" size={24} />
            </div>
        );
    }

    const Icon = TYPE_ICONS[assetType] || Package;

    // Group usages by project
    const groupedUsages = usages.reduce((acc, usage) => {
        const projectName = usage.project_name || 'Unknown Project';
        if (!acc[projectName]) acc[projectName] = [];
        acc[projectName].push(usage);
        return acc;
    }, {} as Record<string, AssetUsage[]>);

    return (
        <div className="bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden">
            {/* Asset Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-start gap-4">
                    {asset?.public_url || asset?.gcs_path ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-black">
                            <img
                                src={asset.public_url || asset.gcs_path}
                                alt={asset.name || 'Asset'}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center">
                            <Icon className="text-gray-500" size={24} />
                        </div>
                    )}
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{asset?.name || 'Unknown Asset'}</h2>
                        <p className="text-sm text-gray-500 capitalize">{assetType}</p>
                    </div>
                </div>
            </div>

            {/* Dependencies */}
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Link2 className="text-yellow-500" size={18} />
                    <h3 className="font-medium text-white">Used In</h3>
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                        {usages.length} references
                    </span>
                </div>

                {usages.length === 0 ? (
                    <div className="text-center py-8">
                        <AlertCircle className="mx-auto text-gray-600 mb-2" size={32} />
                        <p className="text-sm text-gray-500">This asset is not used anywhere</p>
                        <p className="text-xs text-gray-600 mt-1">
                            Link it to scenes or shots to see dependencies here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedUsages).map(([projectName, projectUsages]) => (
                            <div key={projectName}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Film size={14} className="text-gray-500" />
                                    <span className="text-sm font-medium text-gray-400">{projectName}</span>
                                </div>
                                <div className="space-y-2 ml-6">
                                    {projectUsages.map((usage) => {
                                        const UsageIcon = TYPE_ICONS[usage.type];
                                        return (
                                            <a
                                                key={`${usage.type}-${usage.id}`}
                                                href={`/production?${usage.type}=${usage.id}`}
                                                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                                            >
                                                {usage.thumbnail ? (
                                                    <div className="w-10 h-10 rounded overflow-hidden">
                                                        <img
                                                            src={usage.thumbnail}
                                                            alt={usage.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded bg-black flex items-center justify-center">
                                                        <UsageIcon size={16} className="text-gray-500" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm text-white">{usage.name}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{usage.type}</p>
                                                </div>
                                                <ChevronRight
                                                    size={16}
                                                    className="text-gray-600 group-hover:text-white transition-colors"
                                                />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Mini dependency indicator for asset cards
export function DependencyBadge({ count }: { count: number }) {
    if (count === 0) return null;

    return (
        <div className="flex items-center gap-1 text-xs text-gray-500">
            <Link2 size={12} />
            <span>{count} use{count !== 1 ? 's' : ''}</span>
        </div>
    );
}
