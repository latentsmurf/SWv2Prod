"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
                <p className="text-zinc-400">Configure global application settings.</p>
            </div>

            <div className="grid gap-8 max-w-2xl">
                <Card className="bg-zinc-900 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-zinc-200">Branding</CardTitle>
                        <CardDescription>Customize the look and feel of the application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Application Name</label>
                            <Input defaultValue="SceneWeaver" className="bg-zinc-950 border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Support Email</label>
                            <Input defaultValue="support@sceneweaver.ai" className="bg-zinc-950 border-white/10" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-zinc-200">Quotas & Limits</CardTitle>
                        <CardDescription>Set global limits for users.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Max Projects per User (Free)</label>
                            <Input type="number" defaultValue="3" className="bg-zinc-950 border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Max Storage (GB)</label>
                            <Input type="number" defaultValue="5" className="bg-zinc-950 border-white/10" />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button>
                        <Save className="mr-2 h-4 w-4" /> Save All Settings
                    </Button>
                </div>
            </div>
        </div>
    );
}
