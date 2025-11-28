import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// POST /api/projects/[id]/shots/[shotId]/variations/[variationId]/select - Select a variation as main
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; shotId: string; variationId: string }> }
) {
    try {
        const { id, shotId, variationId } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(
            `${PYTHON_API_URL}/api/projects/${id}/shots/${shotId}/variations/${variationId}/select`,
            {
                method: 'POST',
                headers: {
                    'Authorization': authHeader || '',
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Failed to select variation' },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error selecting variation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
