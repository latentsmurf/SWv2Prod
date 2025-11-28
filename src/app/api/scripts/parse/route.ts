import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// POST /api/scripts/parse - Parse uploaded script file
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Forward to Python backend for parsing
        const backendFormData = new FormData();
        backendFormData.append('file', file);

        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/scripts/parse`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || ''
            },
            body: backendFormData
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Failed to parse script' },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error parsing script:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
