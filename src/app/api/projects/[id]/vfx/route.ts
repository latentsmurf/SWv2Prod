import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/projects/[id]/vfx - Get VFX shots
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/vfx`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json({ shots: [], vendors: [] });
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Error fetching VFX:', error);
        return NextResponse.json({ shots: [], vendors: [] });
    }
}

// POST /api/projects/[id]/vfx - Add VFX shot
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');
        const body = await request.json();

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/vfx`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to add VFX shot' }, { status: response.status });
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Error adding VFX shot:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
