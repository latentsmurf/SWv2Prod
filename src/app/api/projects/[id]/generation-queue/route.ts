import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// Mock queue for development - returns empty to hide the panel by default
const MOCK_QUEUE: any[] = [];

// GET /api/projects/[id]/generation-queue
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/generation-queue`, {
            headers: {
                'Authorization': request.headers.get('Authorization') || '',
            }
        });

        if (response.ok) {
            return NextResponse.json(await response.json());
        }
        
        return NextResponse.json(MOCK_QUEUE);
    } catch (error) {
        console.error('Error fetching generation queue:', error);
        return NextResponse.json(MOCK_QUEUE);
    }
}
