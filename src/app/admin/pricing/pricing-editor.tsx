"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save } from "lucide-react";
import { updatePricingConfig } from "./actions";

interface PricingAction {
    action: string;
    cost: number;
    unit: string;
}

interface CreditPack {
    name: string;
    credits: number;
    price: number;
}

interface PricingConfig {
    actions: PricingAction[];
    packs: CreditPack[];
}

export default function PricingEditor({ initialConfig }: { initialConfig: PricingConfig }) {
    const [config, setConfig] = useState(initialConfig);
    const [isSaving, setIsSaving] = useState(false);

    const handleCostChange = (index: number, value: number) => {
        const newActions = [...config.actions];
        newActions[index].cost = value;
        setConfig({ ...config, actions: newActions });
    };

    const handlePackChange = (index: number, field: keyof CreditPack, value: string | number) => {
        const newPacks = [...config.packs];
        newPacks[index] = { ...newPacks[index], [field]: value };
        setConfig({ ...config, packs: newPacks });
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updatePricingConfig(config);
        setIsSaving(false);
        if (result.error) {
            alert("Failed to save: " + result.error);
        } else {
            alert("Settings saved successfully!");
        }
    };

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <Card className="bg-zinc-900 border-white/10">
                <CardHeader>
                    <CardTitle className="text-zinc-200">Action Costs</CardTitle>
                    <CardDescription>Set the credit cost for each AI action.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-white/5">
                                <TableHead className="text-zinc-400">Action</TableHead>
                                <TableHead className="text-zinc-400">Cost (Credits)</TableHead>
                                <TableHead className="text-zinc-400">Unit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {config.actions.map((item, index) => (
                                <TableRow key={index} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-medium text-white">{item.action}</TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={item.cost}
                                            onChange={(e) => handleCostChange(index, parseInt(e.target.value))}
                                            className="w-20 bg-zinc-950 border-white/10 h-8"
                                        />
                                    </TableCell>
                                    <TableCell className="text-zinc-500 text-xs">{item.unit}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-white/10">
                <CardHeader>
                    <CardTitle className="text-zinc-200">Credit Packs</CardTitle>
                    <CardDescription>Configure purchasable credit bundles.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-white/5">
                                <TableHead className="text-zinc-400">Pack Name</TableHead>
                                <TableHead className="text-zinc-400">Credits</TableHead>
                                <TableHead className="text-zinc-400">Price ($)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {config.packs.map((pack, index) => (
                                <TableRow key={index} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-medium text-white">{pack.name}</TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={pack.credits}
                                            onChange={(e) => handlePackChange(index, "credits", parseInt(e.target.value))}
                                            className="w-24 bg-zinc-950 border-white/10 h-8"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={pack.price}
                                            onChange={(e) => handlePackChange(index, "price", parseFloat(e.target.value))}
                                            className="w-24 bg-zinc-950 border-white/10 h-8"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleSave} disabled={isSaving}>
                            <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
