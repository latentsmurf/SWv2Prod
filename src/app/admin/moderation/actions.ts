"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

async function getAuthToken() {
    const session = await getServerSession();
    return session?.id_token;
}

export async function moderateItem(itemId: string, action: "approve" | "reject") {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };

    try {
        const res = await fetch(`http://localhost:8000/api/admin/moderation/${itemId}/${action}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const error = await res.json();
            return { error: error.detail || "Failed to moderate item" };
        }

        revalidatePath("/admin/moderation");
        return { success: true };
    } catch (error) {
        return { error: "Failed to connect to server" };
    }
}
