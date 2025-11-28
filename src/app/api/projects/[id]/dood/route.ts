import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/projects/[id]/dood - Get Day Out of Days
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/dood`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json({ entries: [], shoot_days: [] });
        }

        const dood = await response.json();
        return NextResponse.json(dood);
    } catch (error) {
        console.error('Error fetching DOOD:', error);
        return NextResponse.json({ entries: [], shoot_days: [] });
    }
}
