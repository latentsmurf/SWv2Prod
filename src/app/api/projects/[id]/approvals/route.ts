import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// Mock approvals for development
const MOCK_APPROVALS = [
    {
        id: '1',
        type: 'shot',
        item_id: 'shot-1',
        item_name: 'Shot 1 - CEO Office Establishing',
        status: 'pending',
        submitted_by: 'Creator',
        submitted_at: new Date().toISOString(),
        priority: 'high'
    },
    {
        id: '2',
        type: 'scene',
        item_id: 'scene-1',
        item_name: 'Scene 3 - Confrontation',
        status: 'approved',
        submitted_by: 'Editor',
        submitted_at: new Date(Date.now() - 86400000).toISOString(),
        reviewed_by: 'Director',
        reviewed_at: new Date().toISOString(),
        priority: 'normal'
    }
];

// GET /api/projects/[id]/approvals
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/approvals`, {
            headers: {
                'Authorization': request.headers.get('Authorization') || '',
            }
        });

        if (response.ok) {
            return NextResponse.json(await response.json());
        }
        
        return NextResponse.json(MOCK_APPROVALS.map(a => ({ ...a, project_id: id })));
    } catch (error) {
        console.error('Error fetching approvals:', error);
        return NextResponse.json(MOCK_APPROVALS);
    }
}

// POST /api/projects/[id]/approvals
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/approvals`, {
            method: 'POST',
            headers: {
                'Authorization': request.headers.get('Authorization') || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...body, project_id: id })
        });

        if (response.ok) {
            return NextResponse.json(await response.json());
        }

        return NextResponse.json({
            id: crypto.randomUUID(),
            project_id: id,
            ...body,
            status: 'pending',
            submitted_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating approval:', error);
        return NextResponse.json({ error: 'Failed to create approval' }, { status: 500 });
    }
}
