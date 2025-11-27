"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

async function getAuthToken() {
    const session = await getServerSession();
    return session?.id_token;
}

export async function deleteProject(projectId: string) {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };

    try {
        const res = await fetch(`http://localhost:8000/api/admin/projects/${projectId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const error = await res.json();
            return { error: error.detail || "Failed to delete project" };
        }

        revalidatePath("/admin/projects");
        return { success: true };
    } catch (error) {
        return { error: "Failed to connect to server" };
    }
}
