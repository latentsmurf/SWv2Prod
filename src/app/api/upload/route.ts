import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// POST /api/upload - Upload a file
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const projectId = formData.get('project_id') as string;
        const category = formData.get('category') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Forward to Python backend
        const backendFormData = new FormData();
        backendFormData.append('file', file);
        if (projectId) backendFormData.append('project_id', projectId);
        if (category) backendFormData.append('category', category);

        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/upload`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || ''
            },
            body: backendFormData
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Upload failed' },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
