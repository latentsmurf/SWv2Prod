import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/admin-store';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role') || undefined;
        const status = searchParams.get('status') || undefined;
        const search = searchParams.get('search') || undefined;
        
        const users = adminStore.getUsers({ role, status, search });
        
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, userId, ...data } = body;
        
        switch (action) {
            case 'suspend': {
                const user = adminStore.suspendUser(userId, data.reason || 'Admin action');
                if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
                return NextResponse.json(user);
            }
            
            case 'activate': {
                const user = adminStore.activateUser(userId);
                if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
                return NextResponse.json(user);
            }
            
            case 'adjust_credits': {
                const user = adminStore.adjustUserCredits(userId, data.amount, data.reason || 'Manual adjustment');
                if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
                return NextResponse.json(user);
            }
            
            case 'update_role': {
                const user = adminStore.updateUser(userId, { role: data.role });
                if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
                return NextResponse.json(user);
            }
            
            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing user action:', error);
        return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
    }
}
