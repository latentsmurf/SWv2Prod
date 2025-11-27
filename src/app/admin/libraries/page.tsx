import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shirt, MapPin, Box, Palette } from "lucide-react";

const libraries = [
    { name: "Cast", href: "/admin/libraries/cast", icon: Users, description: "Manage characters and actors" },
    { name: "Wardrobe", href: "/admin/libraries/wardrobe", icon: Shirt, description: "Manage outfits and styles" },
    { name: "Locations", href: "/admin/libraries/locations", icon: MapPin, description: "Manage sets and environments" },
    { name: "Props", href: "/admin/libraries/props", icon: Box, description: "Manage objects and items" },
    { name: "Styles", href: "/admin/libraries/styles", icon: Palette, description: "Manage visual styles and presets" },
];

export default function LibrariesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Libraries</h2>
                <p className="text-zinc-400">Manage global assets and presets.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {libraries.map((lib) => (
                    <Link key={lib.name} href={lib.href}>
                        <Card className="bg-zinc-900 border-white/10 hover:bg-zinc-800 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-200">{lib.name}</CardTitle>
                                <lib.icon className="h-4 w-4 text-zinc-400" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-zinc-500">{lib.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
