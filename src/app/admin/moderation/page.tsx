import { verifyAdminAccess } from "@/lib/admin-auth";
import { getServerSession } from "next-auth";
import ModerationList from "./moderation-list";

async function getModerationQueue(token: string) {
    try {
        const res = await fetch("http://localhost:8000/api/admin/moderation", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Failed to fetch moderation queue:", error);
        return [];
    }
}

export default async function ModerationPage() {
    await verifyAdminAccess();
    const session = await getServerSession();
    const token = session?.id_token;

    const items = token ? await getModerationQueue(token) : [];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Moderation Queue</h2>
                <p className="text-zinc-400">Review flagged content and prompts.</p>
            </div>

            <ModerationList initialItems={items} />
        </div>
    );
}
