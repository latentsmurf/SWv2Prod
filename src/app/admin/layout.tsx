import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    FolderOpen,
    Library,
    Bot,
    CreditCard,
    Activity,
    Settings,
    ShieldAlert,
    Flag
} from "lucide-react";
import { verifyAdminAccess } from "@/lib/admin-auth";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: FolderOpen, label: "Projects", href: "/admin/projects" },
    { icon: Library, label: "Libraries", href: "/admin/libraries" },
    { icon: Bot, label: "AI Services", href: "/admin/ai" },
    { icon: CreditCard, label: "Pricing", href: "/admin/pricing" },
    { icon: Activity, label: "Health", href: "/admin/health" },
    { icon: ShieldAlert, label: "Moderation", href: "/admin/moderation" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
    { icon: Flag, label: "Feature Flags", href: "/admin/flags" },
];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await verifyAdminAccess();

    return (
        <div className="flex h-screen w-full bg-black text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-zinc-950 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2">
                        <span className="text-primary">Control</span> Room
                    </h1>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            AD
                        </div>
                        <div className="text-xs">
                            <p className="font-medium text-white">{user.email}</p>
                            <p className="text-zinc-500 capitalize">{user.role}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-black">
                <div className="max-w-7xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
