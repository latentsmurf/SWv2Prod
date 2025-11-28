import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/notifications/unread-count - Get unread notification count
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/notifications/unread-count`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json({ count: 0 });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return NextResponse.json({ count: 0 });
    }
}
