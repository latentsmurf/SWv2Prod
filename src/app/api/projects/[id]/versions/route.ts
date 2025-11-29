import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// Mock versions for development
const MOCK_VERSIONS = [
    {
        id: '1',
        version_number: 3,
        name: 'Post feedback revisions',
        description: 'Updated shots based on director feedback',
        type: 'manual',
        created_at: new Date().toISOString(),
        created_by: 'Editor'
    },
    {
        id: '2',
        version_number: 2,
        name: 'Auto-save',
        type: 'auto',
        created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: '3',
        version_number: 1,
        name: 'Initial draft',
        description: 'First complete pass of all scenes',
        type: 'manual',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        created_by: 'Creator'
    }
];

// GET /api/projects/[id]/versions
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/versions`, {
            headers: {
                'Authorization': request.headers.get('Authorization') || '',
            }
        });

        if (response.ok) {
            return NextResponse.json(await response.json());
        }
        
        return NextResponse.json(MOCK_VERSIONS.map(v => ({ ...v, project_id: id })));
    } catch (error) {
        console.error('Error fetching versions:', error);
        return NextResponse.json(MOCK_VERSIONS);
    }
}

// POST /api/projects/[id]/versions - Create snapshot
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/versions`, {
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

        // Mock response
        return NextResponse.json({
            id: crypto.randomUUID(),
            project_id: id,
            version_number: MOCK_VERSIONS.length + 1,
            name: body.name || 'Snapshot',
            description: body.description,
            type: 'manual',
            created_at: new Date().toISOString(),
            created_by: 'User'
        });
    } catch (error) {
        console.error('Error creating version:', error);
        return NextResponse.json({ error: 'Failed to create version' }, { status: 500 });
    }
}
