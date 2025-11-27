import { verifyAdminAccess } from "@/lib/admin-auth";
import UserTable from "./user-table";
import { headers } from "next/headers";

async function getUsers(token: string) {
    try {
        const res = await fetch("http://localhost:8000/api/admin/users", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
    }
}

export default async function UsersPage() {
    const session = await verifyAdminAccess();
    // We need the token to fetch users. verifyAdminAccess returns the user profile, 
    // but we need the token. 
    // Actually verifyAdminAccess gets the session internally.
    // We should modify verifyAdminAccess to return the session or token as well, 
    // or just get the session here again (it's cached).

    // For now, let's just get the session again to get the token.
    const { getServerSession } = await import("next-auth");
    const sessionData = await getServerSession();
    const token = sessionData?.id_token;

    const users = token ? await getUsers(token) : [];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                <p className="text-zinc-400">Manage users, roles, and credits.</p>
            </div>

            <UserTable initialUsers={users} />
        </div>
    );
}
