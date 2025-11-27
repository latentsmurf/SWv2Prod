"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";

interface Asset {
    id: string;
    type: string;
    project_id: string;
    gcs_path: string;
    public_url?: string;
    created_at: string;
}

export default function AssetGrid({ initialAssets }: { initialAssets: Asset[] }) {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [assets, setAssets] = useState(initialAssets);

    const filteredAssets = assets.filter((asset) => {
        const matchesSearch = asset.id.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter ? asset.type === typeFilter : true;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search assets by ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-zinc-900 border-white/10 text-white placeholder:text-zinc-500"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={typeFilter === null ? "secondary" : "outline"}
                        onClick={() => setTypeFilter(null)}
                        size="sm"
                    >
                        All
                    </Button>
                    <Button
                        variant={typeFilter === "image" ? "secondary" : "outline"}
                        onClick={() => setTypeFilter("image")}
                        size="sm"
                    >
                        Images
                    </Button>
                    <Button
                        variant={typeFilter === "video" ? "secondary" : "outline"}
                        onClick={() => setTypeFilter("video")}
                        size="sm"
                    >
                        Videos
                    </Button>
                    <Button
                        variant={typeFilter === "audio" ? "secondary" : "outline"}
                        onClick={() => setTypeFilter("audio")}
                        size="sm"
                    >
                        Audio
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredAssets.map((asset) => (
                    <div key={asset.id} className="group relative aspect-square rounded-lg border border-white/10 bg-zinc-900 overflow-hidden">
                        {asset.type === "image" && asset.public_url ? (
                            <Image
                                src={asset.public_url}
                                alt={asset.id}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-zinc-500">
                                <span className="capitalize">{asset.type}</span>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <p className="text-xs text-white truncate font-mono mb-2">{asset.id}</p>
                            <div className="flex gap-2">
                                <Button size="icon" variant="secondary" className="h-8 w-8">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="destructive" className="h-8 w-8">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 uppercase">
                                {asset.type}
                            </Badge>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
