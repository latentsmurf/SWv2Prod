import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/projects/[id]/script/revisions - Get script revisions
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/script/revisions`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json([]);
        }

        const revisions = await response.json();
        return NextResponse.json(revisions);
    } catch (error) {
        console.error('Error fetching revisions:', error);
        return NextResponse.json([]);
    }
}

// POST /api/projects/[id]/script/revisions - Upload new revision
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');
        const formData = await request.formData();

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/script/revisions`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || ''
            },
            body: formData
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to upload revision' }, { status: response.status });
        }

        const revision = await response.json();
        return NextResponse.json(revision);
    } catch (error) {
        console.error('Error uploading revision:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
