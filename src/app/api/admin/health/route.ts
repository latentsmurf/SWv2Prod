import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/admin-store';

export async function GET(request: NextRequest) {
    try {
        const services = adminStore.getHealthChecks();
        
        // Group by category
        const grouped = services.reduce((acc, s) => {
            if (!acc[s.category]) acc[s.category] = [];
            acc[s.category].push(s);
            return acc;
        }, {} as Record<string, typeof services>);
        
        // Calculate overall status
        const allHealthy = services.every(s => s.status === 'healthy');
        const anyDown = services.some(s => s.status === 'down');
        const overallStatus = anyDown ? 'down' : allHealthy ? 'healthy' : 'degraded';
        
        // Calculate average latency
        const avgLatency = Math.round(services.reduce((sum, s) => sum + s.latency, 0) / services.length);
        
        return NextResponse.json({
            overall: {
                status: overallStatus,
                avgLatency,
                servicesCount: services.length,
                healthyCount: services.filter(s => s.status === 'healthy').length,
                degradedCount: services.filter(s => s.status === 'degraded').length,
                downCount: services.filter(s => s.status === 'down').length,
            },
            services,
            grouped
        });
    } catch (error) {
        console.error('Error fetching health:', error);
        return NextResponse.json({ error: 'Failed to fetch health' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { service } = body;
        
        const results = await adminStore.runHealthCheck(service);
        
        return NextResponse.json(results);
    } catch (error) {
        console.error('Error running health check:', error);
        return NextResponse.json({ error: 'Failed to run health check' }, { status: 500 });
    }
}
