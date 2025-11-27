"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Save, RotateCw } from "lucide-react";
import { updateAIConfig } from "./actions";

interface AIConfig {
    provider_id: string;
    name: string;
    models: string[];
    api_key?: string;
    enabled_models?: string[];
    is_active?: boolean;
}

const defaultProviders = [
    { id: "openai", name: "OpenAI", models: ["gpt-4-turbo", "dall-e-3", "tts-1"] },
    { id: "replicate", name: "Replicate", models: ["stability-ai/sdxl", "meta/llama-2"] },
    { id: "elevenlabs", name: "ElevenLabs", models: ["multilingual_v2"] },
    { id: "google", name: "Google Vertex", models: ["gemini-pro", "imagen-2"] },
];

export default function AIConfigForm({ initialConfigs }: { initialConfigs: AIConfig[] }) {
    const [configs, setConfigs] = useState<AIConfig[]>(() => {
        // Merge defaults with saved configs
        return defaultProviders.map(p => {
            const saved = initialConfigs.find(c => c.provider_id === p.id);
            return {
                provider_id: p.id,
                name: p.name,
                models: p.models,
                api_key: saved?.api_key || "",
                enabled_models: saved?.enabled_models || p.models,
                is_active: saved?.is_active ?? true
            };
        });
    });

    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [saving, setSaving] = useState<Record<string, boolean>>({});

    const toggleShowKey = (id: string) => {
        setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleKeyChange = (id: string, value: string) => {
        setConfigs(prev => prev.map(c => c.provider_id === id ? { ...c, api_key: value } : c));
    };

    const handleSave = async (config: AIConfig) => {
        setSaving(prev => ({ ...prev, [config.provider_id]: true }));

        const payload = {
            provider_id: config.provider_id,
            api_key: config.api_key,
            enabled_models: config.enabled_models,
            is_active: config.is_active
        };

        const result = await updateAIConfig(payload);

        setSaving(prev => ({ ...prev, [config.provider_id]: false }));

        if (result.error) {
            alert(`Failed to save ${config.name}: ${result.error}`);
        } else {
            // alert(`Saved ${config.name}`); // Optional feedback
        }
    };

    return (
        <div className="grid gap-6">
            {configs.map((provider) => (
                <Card key={provider.provider_id} className="bg-zinc-900 border-white/10">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-zinc-200">{provider.name}</CardTitle>
                                <CardDescription>Manage API keys and models for {provider.name}.</CardDescription>
                            </div>
                            <Badge variant="outline" className={provider.is_active ? "text-green-500 border-green-500/20 bg-green-500/10" : "text-zinc-500"}>
                                {provider.is_active ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Input
                                    type={showKeys[provider.provider_id] ? "text" : "password"}
                                    value={provider.api_key}
                                    onChange={(e) => handleKeyChange(provider.provider_id, e.target.value)}
                                    placeholder="Enter API Key"
                                    className="bg-zinc-950 border-white/10 pr-10"
                                />
                                <button
                                    onClick={() => toggleShowKey(provider.provider_id)}
                                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-white"
                                >
                                    {showKeys[provider.provider_id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <Button
                                onClick={() => handleSave(provider)}
                                disabled={saving[provider.provider_id]}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {saving[provider.provider_id] ? "Saving..." : "Save"}
                            </Button>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-zinc-400 mb-2">Enabled Models</h4>
                            <div className="flex flex-wrap gap-2">
                                {provider.models.map(model => (
                                    <Badge key={model} variant="secondary" className="bg-white/5 hover:bg-white/10">
                                        {model}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
