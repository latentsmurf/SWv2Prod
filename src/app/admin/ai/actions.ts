"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

async function getAuthToken() {
    const session = await getServerSession();
    return session?.id_token;
}

interface AIConfigPayload {
    provider_id: string;
    api_key?: string;
    enabled_models?: string[];
    is_active?: boolean;
}

export async function updateAIConfig(config: AIConfigPayload) {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };

    try {
        const res = await fetch("http://localhost:8000/api/admin/ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(config),
        });

        if (!res.ok) {
            const error = await res.json();
            return { error: error.detail || "Failed to update config" };
        }

        revalidatePath("/admin/ai");
        return { success: true };
    } catch (error) {
        return { error: "Failed to connect to server" };
    }
}
