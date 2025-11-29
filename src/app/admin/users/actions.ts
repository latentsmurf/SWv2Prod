"use server";

import { revalidatePath } from "next/cache";
import { adminStore } from "@/lib/admin-store";

export async function updateUserRole(userId: string, role: string) {
    try {
        const user = adminStore.updateUser(userId, { role: role as any });
        if (!user) return { error: "User not found" };
        
        revalidatePath("/admin/users");
        return { success: true, user };
    } catch (error) {
        return { error: "Failed to update role" };
    }
}

export async function adjustUserCredits(userId: string, amount: number, reason?: string) {
    try {
        const user = adminStore.adjustUserCredits(userId, amount, reason || 'Admin adjustment');
        if (!user) return { error: "User not found" };
        
        revalidatePath("/admin/users");
        return { success: true, user };
    } catch (error) {
        return { error: "Failed to adjust credits" };
    }
}

export async function suspendUser(userId: string, reason?: string) {
    try {
        const user = adminStore.suspendUser(userId, reason || 'Admin action');
        if (!user) return { error: "User not found" };
        
        revalidatePath("/admin/users");
        return { success: true, user };
    } catch (error) {
        return { error: "Failed to suspend user" };
    }
}

export async function activateUser(userId: string) {
    try {
        const user = adminStore.activateUser(userId);
        if (!user) return { error: "User not found" };
        
        revalidatePath("/admin/users");
        return { success: true, user };
    } catch (error) {
        return { error: "Failed to activate user" };
    }
}

export async function getUsers(filters?: { role?: string; status?: string; search?: string }) {
    try {
        const users = adminStore.getUsers(filters);
        return { success: true, users };
    } catch (error) {
        return { error: "Failed to fetch users", users: [] };
    }
}
