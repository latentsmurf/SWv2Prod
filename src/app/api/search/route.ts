import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/search - Search across projects, assets, scenes
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json({
                projects: [],
                assets: [],
                scenes: []
            });
        }

        const response = await fetch(
            `${PYTHON_API_URL}/api/search?q=${encodeURIComponent(query)}`,
            {
                headers: {
                    'Authorization': authHeader || '',
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            return NextResponse.json({
                projects: [],
                assets: [],
                scenes: []
            });
        }

        const results = await response.json();
        return NextResponse.json(results);
    } catch (error) {
        console.error('Error searching:', error);
        return NextResponse.json({
            projects: [],
            assets: [],
            scenes: []
        });
    }
}
