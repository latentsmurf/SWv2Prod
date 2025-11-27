import { verifyAdminAccess } from "@/lib/admin-auth";
import { getServerSession } from "next-auth";
import LogsTable from "./logs-table";

async function getLogs(token: string) {
    try {
        const res = await fetch("http://localhost:8000/api/admin/logs", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Failed to fetch logs:", error);
        return [];
    }
}

export default async function LogsPage() {
    await verifyAdminAccess();
    const session = await getServerSession();
    const token = session?.id_token;

    const logs = token ? await getLogs(token) : [];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">System Logs</h2>
                <p className="text-zinc-400">View and filter system logs.</p>
            </div>

            <LogsTable initialLogs={logs} />
        </div>
    );
}
