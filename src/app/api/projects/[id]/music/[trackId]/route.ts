import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// DELETE /api/projects/[id]/music/[trackId] - Delete a music track
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; trackId: string }> }
) {
    try {
        const { id, trackId } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/music/${trackId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to delete track' },
                { status: response.status }
            );
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Error deleting music track:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/projects/[id]/music/[trackId] - Update a music track
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; trackId: string }> }
) {
    try {
        const { id, trackId } = await params;
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/music/${trackId}`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to update track' },
                { status: response.status }
            );
        }

        const track = await response.json();
        return NextResponse.json(track);
    } catch (error) {
        console.error('Error updating music track:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
