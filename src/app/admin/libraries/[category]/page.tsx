import { verifyAdminAccess } from "@/lib/admin-auth";
import AssetGrid from "@/app/admin/assets/asset-grid"; // Reuse AssetGrid
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

async function getLibraryAssets(token: string, category: string) {
    try {
        // Map category to asset type if needed, or use direct mapping
        // cast -> cast, wardrobe -> wardrobe, etc.
        const res = await fetch(`http://localhost:8000/api/admin/assets?type=${category}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Failed to fetch library assets:", error);
        return [];
    }
}

export default async function LibraryCategoryPage({ params }: { params: { category: string } }) {
    await verifyAdminAccess();
    const session = await getServerSession();
    const token = session?.id_token;

    const category = params.category;
    const validCategories = ["cast", "wardrobe", "locations", "props", "styles"];

    if (!validCategories.includes(category)) {
        notFound();
    }

    const assets = token ? await getLibraryAssets(token, category) : [];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight capitalize">{category} Library</h2>
                <p className="text-zinc-400">Manage {category} assets.</p>
            </div>

            <AssetGrid initialAssets={assets} />
        </div>
    );
}
