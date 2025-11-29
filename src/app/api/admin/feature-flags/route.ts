import { NextRequest, NextResponse } from 'next/server';

// Feature flag interface
interface FeatureFlag {
    id: string;
    key: string;
    name: string;
    description: string;
    enabled: boolean;
    type: 'boolean' | 'percentage' | 'user_segment';
    percentage?: number;
    segments?: string[];
    created_at: string;
    updated_at: string;
    category: 'ai' | 'ui' | 'billing' | 'experimental' | 'beta';
}

// Mock feature flags
const featureFlags: FeatureFlag[] = [
    { id: 'ff-1', key: 'new_editor', name: 'New Editor UI', description: 'Enable the redesigned video editor interface', enabled: true, type: 'boolean', created_at: '2024-09-01T10:00:00Z', updated_at: '2024-11-20T10:00:00Z', category: 'ui' },
    { id: 'ff-2', key: 'ai_voice_v2', name: 'AI Voice V2', description: 'Use the new AI voice generation model', enabled: true, type: 'percentage', percentage: 50, created_at: '2024-10-01T10:00:00Z', updated_at: '2024-11-15T10:00:00Z', category: 'ai' },
    { id: 'ff-3', key: 'collaboration', name: 'Real-time Collaboration', description: 'Enable real-time collaboration features', enabled: false, type: 'user_segment', segments: ['enterprise', 'studio'], created_at: '2024-08-15T10:00:00Z', updated_at: '2024-11-10T10:00:00Z', category: 'beta' },
    { id: 'ff-4', key: 'stripe_checkout', name: 'Stripe Checkout V2', description: 'Use new Stripe checkout flow', enabled: true, type: 'boolean', created_at: '2024-11-01T10:00:00Z', updated_at: '2024-11-20T10:00:00Z', category: 'billing' },
    { id: 'ff-5', key: 'ai_script_analysis', name: 'AI Script Analysis', description: 'Enable AI-powered script analysis and suggestions', enabled: false, type: 'percentage', percentage: 25, created_at: '2024-11-10T10:00:00Z', updated_at: '2024-11-20T10:00:00Z', category: 'experimental' },
    { id: 'ff-6', key: 'dark_mode_v2', name: 'Dark Mode V2', description: 'New dark mode theme with improved colors', enabled: true, type: 'boolean', created_at: '2024-10-20T10:00:00Z', updated_at: '2024-11-18T10:00:00Z', category: 'ui' },
    { id: 'ff-7', key: 'video_gen_parallel', name: 'Parallel Video Generation', description: 'Allow parallel video generation jobs', enabled: false, type: 'user_segment', segments: ['enterprise'], created_at: '2024-11-05T10:00:00Z', updated_at: '2024-11-22T10:00:00Z', category: 'ai' },
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || undefined;
        const enabled = searchParams.get('enabled');
        
        let filtered = [...featureFlags];
        
        if (category && category !== 'all') {
            filtered = filtered.filter(f => f.category === category);
        }
        if (enabled !== null && enabled !== undefined) {
            filtered = filtered.filter(f => f.enabled === (enabled === 'true'));
        }
        
        // Calculate stats
        const stats = {
            total: featureFlags.length,
            enabled: featureFlags.filter(f => f.enabled).length,
            disabled: featureFlags.filter(f => !f.enabled).length,
            byCategory: {
                ai: featureFlags.filter(f => f.category === 'ai').length,
                ui: featureFlags.filter(f => f.category === 'ui').length,
                billing: featureFlags.filter(f => f.category === 'billing').length,
                experimental: featureFlags.filter(f => f.category === 'experimental').length,
                beta: featureFlags.filter(f => f.category === 'beta').length,
            }
        };
        
        return NextResponse.json({
            flags: filtered,
            stats,
            categories: ['ai', 'ui', 'billing', 'experimental', 'beta']
        });
    } catch (error) {
        console.error('Error fetching feature flags:', error);
        return NextResponse.json({ error: 'Failed to fetch feature flags' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, flagId, updates } = body;
        
        const flagIndex = featureFlags.findIndex(f => f.id === flagId);
        if (flagIndex === -1 && action !== 'create') {
            return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 });
        }
        
        switch (action) {
            case 'toggle':
                featureFlags[flagIndex].enabled = !featureFlags[flagIndex].enabled;
                featureFlags[flagIndex].updated_at = new Date().toISOString();
                return NextResponse.json({ success: true, flag: featureFlags[flagIndex] });
            
            case 'update':
                featureFlags[flagIndex] = {
                    ...featureFlags[flagIndex],
                    ...updates,
                    updated_at: new Date().toISOString()
                };
                return NextResponse.json({ success: true, flag: featureFlags[flagIndex] });
            
            case 'create':
                const newFlag: FeatureFlag = {
                    id: `ff-${Date.now()}`,
                    ...updates,
                    enabled: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                featureFlags.push(newFlag);
                return NextResponse.json({ success: true, flag: newFlag });
            
            case 'delete':
                featureFlags.splice(flagIndex, 1);
                return NextResponse.json({ success: true });
            
            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing feature flag action:', error);
        return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
    }
}
