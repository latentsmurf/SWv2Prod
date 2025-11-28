import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// DELETE /api/projects/[id]/shots/[shotId]/variations/[variationId] - Delete a variation
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; shotId: string; variationId: string }> }
) {
    try {
        const { id, shotId, variationId } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(
            `${PYTHON_API_URL}/api/projects/${id}/shots/${shotId}/variations/${variationId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': authHeader || '',
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to delete variation' },
                { status: response.status }
            );
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Error deleting variation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
