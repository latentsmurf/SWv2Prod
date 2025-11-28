import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// DELETE /api/projects/[id]/review-links/[linkId] - Delete a review link
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; linkId: string }> }
) {
    try {
        const { id, linkId } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/review-links/${linkId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to delete review link' },
                { status: response.status }
            );
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Error deleting review link:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/projects/[id]/review-links/[linkId] - Update a review link
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; linkId: string }> }
) {
    try {
        const { id, linkId } = await params;
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/review-links/${linkId}`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to update review link' },
                { status: response.status }
            );
        }

        const link = await response.json();
        return NextResponse.json(link);
    } catch (error) {
        console.error('Error updating review link:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
