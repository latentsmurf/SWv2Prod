"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

async function getAuthToken() {
    const session = await getServerSession();
    return session?.id_token;
}

export async function updateUserRole(userId: string, role: string) {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };

    try {
        const res = await fetch(`http://localhost:8000/api/admin/users/${userId}/role?role=${role}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const error = await res.json();
            return { error: error.detail || "Failed to update role" };
        }

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        return { error: "Failed to connect to server" };
    }
}

export async function adjustUserCredits(userId: string, amount: number) {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };

    try {
        const res = await fetch(`http://localhost:8000/api/admin/users/${userId}/credits?amount=${amount}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const error = await res.json();
            return { error: error.detail || "Failed to adjust credits" };
        }

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        return { error: "Failed to connect to server" };
    }
}

export async function suspendUser(userId: string) {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };

    try {
        const res = await fetch(`http://localhost:8000/api/admin/users/${userId}/suspend`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const error = await res.json();
            return { error: error.detail || "Failed to suspend user" };
        }

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        return { error: "Failed to connect to server" };
    }
}
