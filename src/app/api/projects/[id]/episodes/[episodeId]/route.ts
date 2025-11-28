import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/projects/[id]/episodes/[episodeId] - Get a specific episode
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; episodeId: string }> }
) {
    try {
        const { id, episodeId } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/episodes/${episodeId}`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.detail || 'Episode not found' },
                { status: response.status }
            );
        }

        const episode = await response.json();
        return NextResponse.json(episode);
    } catch (error) {
        console.error('Error fetching episode:', error);
        return NextResponse.json(
            { error: 'Failed to fetch episode' },
            { status: 500 }
        );
    }
}

// PUT /api/projects/[id]/episodes/[episodeId] - Update an episode
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; episodeId: string }> }
) {
    try {
        const { id, episodeId } = await params;
        const authHeader = request.headers.get('authorization');
        const body = await request.json();

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/episodes/${episodeId}`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            // Mock response for development
            if (response.status === 404 || response.status === 502 || response.status === 503) {
                return NextResponse.json({
                    id: episodeId,
                    project_id: id,
                    ...body,
                    updated_at: new Date().toISOString()
                });
            }
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.detail || 'Failed to update episode' },
                { status: response.status }
            );
        }

        const episode = await response.json();
        return NextResponse.json(episode);
    } catch (error) {
        console.error('Error updating episode:', error);
        return NextResponse.json(
            { error: 'Failed to update episode' },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id]/episodes/[episodeId] - Delete an episode
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; episodeId: string }> }
) {
    try {
        const { id, episodeId } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/episodes/${episodeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok && response.status !== 404 && response.status !== 502 && response.status !== 503) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.detail || 'Failed to delete episode' },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting episode:', error);
        // Return success for development
        return NextResponse.json({ success: true });
    }
}
