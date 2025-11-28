import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/review/[token]/comments - Get comments for review
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        const response = await fetch(`${PYTHON_API_URL}/api/review/${token}/comments`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json([]);
        }

        const comments = await response.json();
        return NextResponse.json(comments);
    } catch (error) {
        console.error('Error fetching review comments:', error);
        return NextResponse.json([]);
    }
}

// POST /api/review/[token]/comments - Add comment to review
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const body = await request.json();

        const { content, reviewer_name, shot_id, timestamp } = body;

        if (!content) {
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${PYTHON_API_URL}/api/review/${token}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content,
                reviewer_name: reviewer_name || 'Anonymous',
                shot_id,
                timestamp: timestamp || 0,
                is_resolved: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Failed to add comment' },
                { status: response.status }
            );
        }

        const comment = await response.json();
        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error('Error adding review comment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
