import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/projects/[id]/scenes/[sceneId]/shots - Get all shots for a scene
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
    try {
        const { id, sceneId } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/scenes/${sceneId}/shots`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch shots' },
                { status: response.status }
            );
        }

        const shots = await response.json();
        return NextResponse.json(shots);
    } catch (error) {
        console.error('Error fetching shots:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/projects/[id]/scenes/[sceneId]/shots - Create a new shot
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
    try {
        const { id, sceneId } = await params;
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/scenes/${sceneId}/shots`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project_id: id,
                scene_id: sceneId,
                ...body
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Failed to create shot' },
                { status: response.status }
            );
        }

        const shot = await response.json();
        return NextResponse.json(shot, { status: 201 });
    } catch (error) {
        console.error('Error creating shot:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
