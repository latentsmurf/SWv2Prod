import { verifyAdminAccess } from "@/lib/admin-auth";
import { getServerSession } from "next-auth";
import PricingEditor from "./pricing-editor";

async function getPricingConfig(token: string) {
    try {
        const res = await fetch("http://localhost:8000/api/admin/pricing", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Failed to fetch pricing config:", error);
        return null;
    }
}

const defaultCosts = [
    { action: "Generate Story", cost: 5, unit: "per story" },
    { action: "Generate Image (SDXL)", cost: 1, unit: "per image" },
    { action: "Generate Image (DALL-E 3)", cost: 4, unit: "per image" },
    { action: "Generate Video (2s)", cost: 10, unit: "per video" },
    { action: "TTS (ElevenLabs)", cost: 2, unit: "per 100 chars" },
];

const defaultPacks = [
    { name: "Starter Pack", credits: 100, price: 9.99 },
    { name: "Pro Pack", credits: 500, price: 39.99 },
    { name: "Studio Pack", credits: 2000, price: 149.99 },
];

export default async function PricingPage() {
    await verifyAdminAccess();
    const session = await getServerSession();
    const token = session?.id_token;

    let config = token ? await getPricingConfig(token) : null;

    if (!config || (!config.actions && !config.packs)) {
        config = { actions: defaultCosts, packs: defaultPacks };
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Pricing & Credits</h2>
                <p className="text-zinc-400">Manage credit costs and subscription packs.</p>
            </div>

            <PricingEditor initialConfig={config} />
        </div>
    );
}
