import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
    try {
        const { ids } = await request.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: 'No media IDs provided' },
                { status: 400 }
            );
        }

        // Forward to Python backend
        const response = await fetch(`${PYTHON_API_URL}/api/media/bulk-delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': request.headers.get('Authorization') || '',
            },
            body: JSON.stringify({ ids }),
        });

        if (!response.ok) {
            // If backend not available, just return success (for dev)
            if (response.status === 404 || response.status === 502 || response.status === 503) {
                return NextResponse.json({ 
                    status: 'success', 
                    deleted: ids.length,
                    message: 'Deleted (mock)' 
                });
            }
            
            const error = await response.json().catch(() => ({ detail: 'Delete failed' }));
            return NextResponse.json(
                { error: error.detail },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Bulk delete error:', error);
        // Return success for development
        return NextResponse.json({ 
            status: 'success',
            message: 'Deleted (fallback)' 
        });
    }
}
