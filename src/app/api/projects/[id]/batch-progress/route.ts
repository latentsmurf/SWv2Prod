import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/projects/[id]/batch-progress - Get batch generation progress
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/batch-progress`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // If no batch job exists, return idle status
            return NextResponse.json({
                total: 0,
                completed: 0,
                failed: 0,
                status: 'idle'
            });
        }

        const progress = await response.json();
        return NextResponse.json(progress);
    } catch (error) {
        console.error('Error fetching batch progress:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
