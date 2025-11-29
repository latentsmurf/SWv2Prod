import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/admin-store';

export async function GET(request: NextRequest) {
    try {
        const stats = adminStore.getDashboardStats();
        const activity = adminStore.getRecentActivity(10);
        const services = adminStore.getHealthChecks().slice(0, 6);
        
        return NextResponse.json({
            stats,
            activity,
            services: services.map(s => ({
                name: s.service,
                status: s.status,
                latency: s.latency,
                lastCheck: s.lastCheck
            }))
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
