"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { moderateItem } from "./actions";

interface ModerationItem {
    id: string;
    type: string;
    reason: string;
    user_id: string;
    content: string; // URL or text
    status: string;
}

export default function ModerationList({ initialItems }: { initialItems: ModerationItem[] }) {
    const [items, setItems] = useState(initialItems);

    const handleAction = async (id: string, action: "approve" | "reject") => {
        // Optimistic update
        setItems(items.filter(i => i.id !== id));

        const result = await moderateItem(id, action);
        if (result.error) {
            // Revert if error (simplified, ideally would re-fetch)
            console.error(result.error);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
                <Card key={item.id} className="bg-zinc-900 border-white/10">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-zinc-200 text-base">Flagged {item.type}</CardTitle>
                                <CardDescription className="text-xs">User: {item.user_id}</CardDescription>
                            </div>
                            <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> {item.reason}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {item.type === "image" ? (
                            <div className="relative aspect-square rounded-md overflow-hidden border border-white/10">
                                <Image src={item.content} alt="Flagged content" fill className="object-cover" />
                            </div>
                        ) : (
                            <div className="p-4 rounded-md bg-zinc-950 border border-white/10 text-sm text-zinc-300 max-h-40 overflow-y-auto">
                                {item.content}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between gap-2">
                        <Button variant="outline" className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10" onClick={() => handleAction(item.id, "reject")}>
                            <X className="mr-2 h-4 w-4" /> Reject
                        </Button>
                        <Button variant="outline" className="flex-1 border-green-500/50 text-green-500 hover:bg-green-500/10" onClick={() => handleAction(item.id, "approve")}>
                            <Check className="mr-2 h-4 w-4" /> Approve
                        </Button>
                    </CardFooter>
                </Card>
            ))}
            {items.length === 0 && (
                <div className="col-span-full text-center py-12 text-zinc-500">
                    <Check className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No flagged content to review.</p>
                </div>
            )}
        </div>
    );
}
