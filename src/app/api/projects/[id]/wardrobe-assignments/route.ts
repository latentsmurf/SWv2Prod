import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/projects/[id]/wardrobe-assignments - Get all wardrobe assignments for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/wardrobe-assignments`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Return empty array if no assignments exist yet
            return NextResponse.json([]);
        }

        const assignments = await response.json();
        return NextResponse.json(assignments);
    } catch (error) {
        console.error('Error fetching wardrobe assignments:', error);
        return NextResponse.json([]);
    }
}

// POST /api/projects/[id]/wardrobe-assignments - Create or update a wardrobe assignment
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        const { cast_id, wardrobe_id, scene_id } = body;

        if (!cast_id || !wardrobe_id) {
            return NextResponse.json(
                { error: 'cast_id and wardrobe_id are required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/wardrobe-assignments`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project_id: id,
                cast_id,
                wardrobe_id,
                scene_id: scene_id || null
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Failed to create assignment' },
                { status: response.status }
            );
        }

        const assignment = await response.json();
        return NextResponse.json(assignment, { status: 201 });
    } catch (error) {
        console.error('Error creating wardrobe assignment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id]/wardrobe-assignments - Delete a wardrobe assignment
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        const { cast_id, scene_id } = body;

        if (!cast_id) {
            return NextResponse.json(
                { error: 'cast_id is required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/wardrobe-assignments`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cast_id,
                scene_id: scene_id || null
            })
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to delete assignment' },
                { status: response.status }
            );
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Error deleting wardrobe assignment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
