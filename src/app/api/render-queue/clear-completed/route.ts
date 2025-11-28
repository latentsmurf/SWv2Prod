import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// DELETE /api/render-queue/clear-completed - Clear completed jobs
export async function DELETE(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/render-queue/clear-completed`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to clear completed jobs' },
                { status: response.status }
            );
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Error clearing completed jobs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
