import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// Mock characters for development
const MOCK_CHARACTERS = [
    {
        id: '1',
        name: 'Emma Chen',
        description: 'Ambitious young executive',
        age_range: 'Late 20s',
        references: [],
        costume_changes: [],
        face_locked: true,
        consistency_prompt: 'young asian woman, professional attire',
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Marcus Stone',
        description: 'Mysterious CEO',
        age_range: 'Mid 30s',
        references: [],
        costume_changes: [],
        face_locked: false,
        created_at: new Date().toISOString()
    }
];

// GET /api/projects/[id]/characters
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/characters`, {
            headers: {
                'Authorization': request.headers.get('Authorization') || '',
            }
        });

        if (response.ok) {
            return NextResponse.json(await response.json());
        }
        
        // Return mock data for development
        return NextResponse.json(MOCK_CHARACTERS.map(c => ({ ...c, project_id: id })));
    } catch (error) {
        console.error('Error fetching characters:', error);
        return NextResponse.json(MOCK_CHARACTERS);
    }
}

// POST /api/projects/[id]/characters
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/characters`, {
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
            ...body,
            references: [],
            costume_changes: [],
            face_locked: false,
            created_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating character:', error);
        return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
    }
}
