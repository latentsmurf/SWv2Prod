import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/projects/[id]/music - Get all music tracks for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/music`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Return empty array if no tracks exist yet
            return NextResponse.json([]);
        }

        const tracks = await response.json();
        return NextResponse.json(tracks);
    } catch (error) {
        console.error('Error fetching music tracks:', error);
        return NextResponse.json([]);
    }
}
