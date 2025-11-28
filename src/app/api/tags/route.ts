import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/tags - Get all tags
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/tags`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Return mock data
            return NextResponse.json([
                { id: '1', name: 'Action', color: '#EF4444', count: 12 },
                { id: '2', name: 'Drama', color: '#3B82F6', count: 8 },
                { id: '3', name: 'VFX Heavy', color: '#A855F7', count: 5 },
                { id: '4', name: 'Night Scene', color: '#6B7280', count: 3 },
                { id: '5', name: 'Exterior', color: '#22C55E', count: 15 },
            ]);
        }

        const tags = await response.json();
        return NextResponse.json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json([]);
    }
}

// POST /api/tags - Create tag
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const body = await request.json();

        const response = await fetch(`${PYTHON_API_URL}/api/tags`, {
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
                { error: errorData.detail || 'Failed to create tag' },
                { status: response.status }
            );
        }

        const tag = await response.json();
        return NextResponse.json(tag);
    } catch (error) {
        console.error('Error creating tag:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
