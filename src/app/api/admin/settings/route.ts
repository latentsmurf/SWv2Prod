import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/admin-store';

export async function GET(request: NextRequest) {
    try {
        const settings = adminStore.getSettings();
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { section, updates } = body;
        
        if (!section || !updates) {
            return NextResponse.json({ error: 'Section and updates required' }, { status: 400 });
        }
        
        const settings = adminStore.updateSettings(section, updates);
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
