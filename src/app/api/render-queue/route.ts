import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/render-queue - Get all render jobs
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('project_id');

        let url = `${PYTHON_API_URL}/api/render-queue`;
        if (projectId) url += `?project_id=${projectId}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json([]);
        }

        const jobs = await response.json();
        return NextResponse.json(jobs);
    } catch (error) {
        console.error('Error fetching render queue:', error);
        return NextResponse.json([]);
    }
}

// POST /api/render-queue - Add job to queue
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const body = await request.json();

        const response = await fetch(`${PYTHON_API_URL}/api/render-queue`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Failed to add job' },
                { status: response.status }
            );
        }

        const job = await response.json();
        return NextResponse.json(job);
    } catch (error) {
        console.error('Error adding to render queue:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
