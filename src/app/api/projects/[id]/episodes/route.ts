import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/projects/[id]/episodes - List all episodes for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/episodes`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Return empty array for development when backend unavailable
            if (response.status === 404 || response.status === 502 || response.status === 503) {
                return NextResponse.json([]);
            }
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.detail || 'Failed to fetch episodes' },
                { status: response.status }
            );
        }

        const episodes = await response.json();
        return NextResponse.json(episodes);
    } catch (error) {
        console.error('Error fetching episodes:', error);
        // Return empty array for development
        return NextResponse.json([]);
    }
}

// POST /api/projects/[id]/episodes - Create a new episode
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');
        const body = await request.json();

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/episodes`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...body,
                project_id: id
            })
        });

        if (!response.ok) {
            // Mock response for development
            if (response.status === 404 || response.status === 502 || response.status === 503) {
                return NextResponse.json({
                    id: crypto.randomUUID(),
                    project_id: id,
                    ...body,
                    created_at: new Date().toISOString()
                });
            }
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.detail || 'Failed to create episode' },
                { status: response.status }
            );
        }

        const episode = await response.json();
        return NextResponse.json(episode);
    } catch (error) {
        console.error('Error creating episode:', error);
        // Return mock for development
        const body = await request.json().catch(() => ({}));
        return NextResponse.json({
            id: crypto.randomUUID(),
            ...body,
            created_at: new Date().toISOString()
        });
    }
}
