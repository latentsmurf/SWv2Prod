import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/exports - Get export history
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('project_id');
        const limit = searchParams.get('limit');

        let url = `${PYTHON_API_URL}/api/exports`;
        const params = new URLSearchParams();
        if (projectId) params.append('project_id', projectId);
        if (limit) params.append('limit', limit);
        if (params.toString()) url += `?${params}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json([]);
        }

        const exports = await response.json();
        return NextResponse.json(exports);
    } catch (error) {
        console.error('Error fetching exports:', error);
        return NextResponse.json([]);
    }
}
