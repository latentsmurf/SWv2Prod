import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/review/[token] - Get review link data (public)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        const response = await fetch(`${PYTHON_API_URL}/api/review/${token}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Review link not found or expired' },
                { status: 404 }
            );
        }

        // Also increment view count
        fetch(`${PYTHON_API_URL}/api/review/${token}/view`, { method: 'POST' }).catch(() => {});

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching review data:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
