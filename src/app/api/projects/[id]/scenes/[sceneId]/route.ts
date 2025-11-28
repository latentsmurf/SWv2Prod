import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/projects/[id]/scenes/[sceneId] - Get a single scene
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
    try {
        const { id, sceneId } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/scenes/${sceneId}`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Scene not found' },
                { status: response.status }
            );
        }

        const scene = await response.json();
        return NextResponse.json(scene);
    } catch (error) {
        console.error('Error fetching scene:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/projects/[id]/scenes/[sceneId] - Update a scene
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
    try {
        const { id, sceneId } = await params;
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/scenes/${sceneId}`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Failed to update scene' },
                { status: response.status }
            );
        }

        const scene = await response.json();
        return NextResponse.json(scene);
    } catch (error) {
        console.error('Error updating scene:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id]/scenes/[sceneId] - Delete a scene
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
    try {
        const { id, sceneId } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/scenes/${sceneId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to delete scene' },
                { status: response.status }
            );
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Error deleting scene:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
