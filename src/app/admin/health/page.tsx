import { verifyAdminAccess } from "@/lib/admin-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { getServerSession } from "next-auth";

async function getServiceHealth(token: string) {
    try {
        const res = await fetch("http://localhost:8000/api/admin/health/services", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) return { services: [] };
        return res.json();
    } catch (error) {
        console.error("Failed to fetch health:", error);
        return { services: [] };
    }
}

export default async function HealthPage() {
    await verifyAdminAccess();
    const session = await getServerSession();
    const token = session?.id_token;

    const data = token ? await getServiceHealth(token) : { services: [] };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
                    <p className="text-zinc-400">Real-time status of all services.</p>
                </div>
                <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.services.map((service: any) => (
                    <Card key={service.name} className="bg-zinc-900 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-200">{service.name}</CardTitle>
                            {service.status === "healthy" ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white capitalize">{service.status}</div>
                            <p className="text-xs text-zinc-500">{service.latency}ms latency</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
