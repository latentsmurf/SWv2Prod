"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface Log {
    id: string;
    timestamp: string;
    level: string;
    service: string;
    message: string;
}

export default function LogsTable({ initialLogs }: { initialLogs: Log[] }) {
    const [search, setSearch] = useState("");
    const [logs, setLogs] = useState(initialLogs);

    const filteredLogs = logs.filter((log) =>
        log.message.toLowerCase().includes(search.toLowerCase()) ||
        log.service.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search logs..."
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
                            <TableHead className="text-zinc-400">Timestamp</TableHead>
                            <TableHead className="text-zinc-400">Level</TableHead>
                            <TableHead className="text-zinc-400">Service</TableHead>
                            <TableHead className="text-zinc-400">Message</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map((log) => (
                                <TableRow key={log.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="text-zinc-400 font-mono text-xs">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={log.level === "error" ? "destructive" : log.level === "warning" ? "secondary" : "outline"}>
                                            {log.level}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-zinc-300">{log.service}</TableCell>
                                    <TableCell className="text-white">{log.message}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                                    No logs found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
