import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/admin-store';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || undefined;
        const resource_type = searchParams.get('resource_type') || undefined;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
        
        const logs = adminStore.getAuditLog({ action, resource_type, limit });
        
        return NextResponse.json(logs);
    } catch (error) {
        console.error('Error fetching audit log:', error);
        return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const entry = adminStore.addAuditLog(body);
        return NextResponse.json(entry);
    } catch (error) {
        console.error('Error adding audit log:', error);
        return NextResponse.json({ error: 'Failed to add audit log' }, { status: 500 });
    }
}
