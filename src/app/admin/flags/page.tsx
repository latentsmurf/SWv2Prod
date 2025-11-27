"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch"; // Need to create Switch component
import { Save } from "lucide-react";



const initialFlags = [
    { id: "video-gen", name: "Video Generation", description: "Enable AI video generation features", enabled: true },
    { id: "sora-integration", name: "Sora Integration", description: "Enable OpenAI Sora (Beta)", enabled: false },
    { id: "new-editor", name: "New Editor UI", description: "Enable the new React-based editor", enabled: true },
    { id: "payments", name: "Stripe Payments", description: "Enable real payment processing", enabled: false },
];

export default function FlagsPage() {
    const [flags, setFlags] = useState(initialFlags);

    const toggleFlag = (id: string) => {
        setFlags(flags.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Feature Flags</h2>
                <p className="text-zinc-400">Toggle features on or off globally.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {flags.map((flag) => (
                    <Card key={flag.id} className="bg-zinc-900 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium text-zinc-200">{flag.name}</CardTitle>
                            <Switch checked={flag.enabled} onCheckedChange={() => toggleFlag(flag.id)} />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-zinc-400 mb-2">{flag.description}</p>
                            <Badge variant={flag.enabled ? "default" : "secondary"}>
                                {flag.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end">
                <Button>
                    <Save className="mr-2 h-4 w-4" /> Save Flags
                </Button>
            </div>
        </div>
    );
}
