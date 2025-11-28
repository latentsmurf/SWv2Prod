import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// POST /api/projects/[id]/shots/[shotId]/variations/generate - Generate new variations
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; shotId: string }> }
) {
    try {
        const { id, shotId } = await params;
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        const { count, prompt_variation } = body;

        const response = await fetch(
            `${PYTHON_API_URL}/api/projects/${id}/shots/${shotId}/variations/generate`,
            {
                method: 'POST',
                headers: {
                    'Authorization': authHeader || '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    count: count || 4,
                    prompt_variation
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Failed to generate variations' },
                { status: response.status }
            );
        }

        const variations = await response.json();
        return NextResponse.json(variations, { status: 201 });
    } catch (error) {
        console.error('Error generating variations:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
