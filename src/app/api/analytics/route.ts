import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/analytics - Get production analytics
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || 'month';
        const projectId = searchParams.get('project_id');

        let url = `${PYTHON_API_URL}/api/analytics?range=${range}`;
        if (projectId) url += `&project_id=${projectId}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Return mock data for development
            return NextResponse.json({
                overview: {
                    total_projects: 12,
                    total_scenes: 48,
                    total_shots: 256,
                    total_assets: 89,
                    credits_used: 1240,
                    generation_time_avg: 12.5
                },
                trends: Array.from({ length: 14 }, (_, i) => ({
                    date: new Date(Date.now() - (13 - i) * 86400000).toISOString(),
                    shots_generated: Math.floor(Math.random() * 30) + 5,
                    credits_used: Math.floor(Math.random() * 50) + 10
                })),
                generation_stats: {
                    total_generations: 256,
                    successful: 248,
                    failed: 8,
                    avg_time: 12
                },
                asset_breakdown: {
                    cast: 24,
                    locations: 18,
                    wardrobe: 32,
                    props: 15
                },
                recent_activity: [
                    { type: 'shots', count: 45, change: 12 },
                    { type: 'scenes', count: 8, change: -5 },
                    { type: 'exports', count: 12, change: 25 },
                    { type: 'reviews', count: 6, change: 0 },
                    { type: 'assets', count: 15, change: 8 }
                ]
            });
        }

        const analytics = await response.json();
        return NextResponse.json(analytics);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
