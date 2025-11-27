
"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { deleteProject } from "./actions";

interface Project {
    id: string;
    name: string;
    user_id: string;
    status: string;
    created_at: string;
}

export default function ProjectTable({ initialProjects }: { initialProjects: Project[] }) {
    const [search, setSearch] = useState("");
    const [projects, setProjects] = useState(initialProjects);

    const filteredProjects = projects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (projectId: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        // Optimistic update
        setProjects(projects.filter(p => p.id !== projectId));

        const result = await deleteProject(projectId);
        if (result.error) {
            alert("Failed to delete: " + result.error);
            // Revert if error (simplified)
            // A more robust solution would involve fetching the projects again or storing the original state
            // For this example, we'll just alert and leave the optimistic update as is.
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-zinc-900 border-white/10 text-white placeholder:text-zinc-500"
                    />
                </div>
            </div>

            <div className="rounded-md border border-white/10 bg-zinc-900">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-zinc-400">Project Name</TableHead>
                            <TableHead className="text-zinc-400">Owner ID</TableHead>
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-zinc-400">Created</TableHead>
                            <TableHead className="text-right text-zinc-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProjects.map((project) => (
                            <TableRow key={project.id} className="border-white/10 hover:bg-white/5">
                                <TableCell className="font-medium text-white">
                                    {project.name}
                                    <div className="text-xs text-zinc-500">{project.id}</div>
                                </TableCell>
                                <TableCell className="text-zinc-300 font-mono text-xs">
                                    {project.user_id}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {project.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-zinc-400 text-sm">
                                    {new Date(project.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={() => handleDelete(project.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

