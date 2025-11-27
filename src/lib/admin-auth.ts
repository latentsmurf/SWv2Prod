import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function verifyAdminAccess() {
    const session = await getServerSession();

    if (!session?.user || !session.id_token) {
        redirect("/api/auth/signin");
    }

    try {
        const res = await fetch("http://localhost:8000/api/users/me", {
            headers: {
                Authorization: `Bearer ${session.id_token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) {
            console.error("Failed to fetch user profile:", res.status, res.statusText);
            // If backend is down or token invalid, redirect to home or show error
            redirect("/");
        }

        const user = await res.json();

        if (user.role !== "admin") {
            redirect("/"); // Or a 403 page
        }

        return user;
    } catch (error) {
        console.error("Error verifying admin access:", error);
        redirect("/");
    }
}
