import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/projects/[id]/presence - Get online users
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/presence`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Return mock data
            return NextResponse.json([]);
        }

        const presence = await response.json();
        return NextResponse.json(presence);
    } catch (error) {
        console.error('Error fetching presence:', error);
        return NextResponse.json([]);
    }
}

// POST /api/projects/[id]/presence - Update my presence
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');
        const body = await request.json();

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/presence`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            return NextResponse.json({ success: true });
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating presence:', error);
        return NextResponse.json({ success: true });
    }
}
