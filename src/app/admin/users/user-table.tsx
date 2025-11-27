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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Search, Shield, Coins, Ban } from "lucide-react";
import { updateUserRole, adjustUserCredits, suspendUser } from "./actions";



interface User {
    id: string;
    email: string;
    role: string;
    credits_balance: number;
    created_at?: string;
}

export default function UserTable({ initialUsers }: { initialUsers: User[] }) {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState(initialUsers);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [creditAmount, setCreditAmount] = useState(0);
    const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);

    const filteredUsers = users.filter((user) =>
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleRoleChange = async (userId: string, newRole: string) => {
        await updateUserRole(userId, newRole);
        // Optimistic update
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    };

    const handleAdjustCredits = async () => {
        if (!selectedUser) return;
        await adjustUserCredits(selectedUser.id, creditAmount);
        // Optimistic update
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, credits_balance: u.credits_balance + creditAmount } : u));
        setIsCreditDialogOpen(false);
        setCreditAmount(0);
    };

    const handleSuspend = async (userId: string) => {
        if (!confirm("Are you sure you want to suspend this user?")) return;

        await suspendUser(userId);
        // Optimistic update
        setUsers(users.map(u => u.id === userId ? { ...u, role: "suspended" } : u));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search users..."
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
                            <TableHead className="text-zinc-400">User</TableHead>
                            <TableHead className="text-zinc-400">Role</TableHead>
                            <TableHead className="text-zinc-400">Credits</TableHead>
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-right text-zinc-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                                <TableCell className="font-medium text-white">
                                    {user.email}
                                    <div className="text-xs text-zinc-500">{user.id}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-zinc-300">{user.credits_balance}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">
                                        Active
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-white">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                                Copy ID
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem onClick={() => {
                                                setSelectedUser(user);
                                                setIsCreditDialogOpen(true);
                                            }}>
                                                <Coins className="mr-2 h-4 w-4" /> Adjust Credits
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuLabel>Role</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, "user")}>
                                                <Shield className="mr-2 h-4 w-4" /> Set as User
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, "admin")}>
                                                <Shield className="mr-2 h-4 w-4 text-primary" /> Set as Admin
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem
                                                className="text-red-500 focus:text-red-500"
                                                onClick={() => handleSuspend(user.id)}
                                            >
                                                <Ban className="mr-2 h-4 w-4" /> Suspend User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
                <DialogContent className="bg-zinc-950 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Adjust Credits</DialogTitle>
                        <DialogDescription>
                            Add or remove credits for {selectedUser?.email}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="amount" className="text-right text-sm">
                                Amount
                            </label>
                            <Input
                                id="amount"
                                type="number"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(parseInt(e.target.value))}
                                className="col-span-3 bg-zinc-900 border-white/10"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdjustCredits}>Confirm Adjustment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
