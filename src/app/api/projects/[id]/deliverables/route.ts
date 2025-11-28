import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/projects/[id]/deliverables - Get deliverables
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/deliverables`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json([]);
        }

        const deliverables = await response.json();
        return NextResponse.json(deliverables);
    } catch (error) {
        console.error('Error fetching deliverables:', error);
        return NextResponse.json([]);
    }
}

// POST /api/projects/[id]/deliverables - Create deliverable
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');
        const body = await request.json();

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/deliverables`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to create deliverable' }, { status: response.status });
        }

        const deliverable = await response.json();
        return NextResponse.json(deliverable);
    } catch (error) {
        console.error('Error creating deliverable:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
