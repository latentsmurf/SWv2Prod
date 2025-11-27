"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

async function getAuthToken() {
    const session = await getServerSession();
    return session?.id_token;
}

export async function updatePricingConfig(config: any) {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };

    try {
        const res = await fetch("http://localhost:8000/api/admin/pricing", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(config),
        });

        if (!res.ok) {
            const error = await res.json();
            return { error: error.detail || "Failed to update pricing" };
        }

        revalidatePath("/admin/pricing");
        return { success: true };
    } catch (error) {
        return { error: "Failed to connect to server" };
    }
}
