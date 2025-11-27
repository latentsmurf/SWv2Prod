import { verifyAdminAccess } from "@/lib/admin-auth";
import ProjectTable from "./project-table";
import { getServerSession } from "next-auth";

async function getProjects(token: string) {
    try {
        const res = await fetch("http://localhost:8000/api/admin/projects", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Failed to fetch projects:", error);
        return [];
    }
}

export default async function ProjectsPage() {
    await verifyAdminAccess();
    const session = await getServerSession();
    const token = session?.id_token;

    const projects = token ? await getProjects(token) : [];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                <p className="text-zinc-400">Manage all user projects.</p>
            </div>

            <ProjectTable initialProjects={projects} />
        </div>
    );
}
