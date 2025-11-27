import { verifyAdminAccess } from "@/lib/admin-auth";
import { getServerSession } from "next-auth";
import AIConfigForm from "./ai-config-form";

async function getAIConfigs(token: string) {
    try {
        const res = await fetch("http://localhost:8000/api/admin/ai", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Failed to fetch AI configs:", error);
        return [];
    }
}

export default async function AIPage() {
    await verifyAdminAccess();
    const session = await getServerSession();
    const token = session?.id_token;

    const configs = token ? await getAIConfigs(token) : [];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">AI Services</h2>
                <p className="text-zinc-400">Configure AI providers and API keys.</p>
            </div>

            <AIConfigForm initialConfigs={configs} />
        </div>
    );
}
