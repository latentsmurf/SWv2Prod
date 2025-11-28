import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
    try {
        const { ids, project_id } = await request.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: 'No media IDs provided' },
                { status: 400 }
            );
        }

        // Forward to Python backend for ZIP generation
        const response = await fetch(`${PYTHON_API_URL}/api/media/bulk-export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': request.headers.get('Authorization') || '',
            },
            body: JSON.stringify({ ids, project_id }),
        });

        if (!response.ok) {
            // If backend not available, return error with fallback instructions
            if (response.status === 404 || response.status === 502 || response.status === 503) {
                return NextResponse.json({ 
                    status: 'error',
                    message: 'Export service unavailable. Please download items individually.',
                    fallback: true
                }, { status: 503 });
            }
            
            const error = await response.json().catch(() => ({ detail: 'Export failed' }));
            return NextResponse.json(
                { error: error.detail },
                { status: response.status }
            );
        }

        // Return the ZIP file as a blob
        const blob = await response.blob();
        
        return new NextResponse(blob, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="media-export-${Date.now()}.zip"`,
            },
        });

    } catch (error) {
        console.error('Bulk export error:', error);
        return NextResponse.json({ 
            status: 'error',
            message: 'Export failed. Please try downloading items individually.',
            fallback: true
        }, { status: 500 });
    }
}
