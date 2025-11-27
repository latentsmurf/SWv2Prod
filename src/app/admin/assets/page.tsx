import { verifyAdminAccess } from "@/lib/admin-auth";
import AssetGrid from "./asset-grid";
import { getServerSession } from "next-auth";

async function getAssets(token: string) {
    try {
        const res = await fetch("http://localhost:8000/api/admin/assets", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Failed to fetch assets:", error);
        return [];
    }
}

export default async function AssetsPage() {
    await verifyAdminAccess();
    const session = await getServerSession();
    const token = session?.id_token;

    const assets = token ? await getAssets(token) : [];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Assets</h2>
                <p className="text-zinc-400">Manage global assets and storage.</p>
            </div>

            <AssetGrid initialAssets={assets} />
        </div>
    );
}
