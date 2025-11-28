import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/projects/[id]/shots/[shotId]/variations - Get all variations for a shot
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; shotId: string }> }
) {
    try {
        const { id, shotId } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(
            `${PYTHON_API_URL}/api/projects/${id}/shots/${shotId}/variations`,
            {
                headers: {
                    'Authorization': authHeader || '',
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            return NextResponse.json([]);
        }

        const variations = await response.json();
        return NextResponse.json(variations);
    } catch (error) {
        console.error('Error fetching shot variations:', error);
        return NextResponse.json([]);
    }
}
