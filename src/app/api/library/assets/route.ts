import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/library/assets - Get all global assets for the user
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const query = searchParams.get('q');

        let url = `${PYTHON_API_URL}/api/library/assets`;
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (query) params.append('q', query);
        if (params.toString()) url += `?${params}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch assets' },
                { status: response.status }
            );
        }

        const assets = await response.json();
        return NextResponse.json(assets);
    } catch (error) {
        console.error('Error fetching library assets:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/library/assets - Save an asset to global library
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/library/assets`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...body,
                is_global: true
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Failed to save asset' },
                { status: response.status }
            );
        }

        const asset = await response.json();
        return NextResponse.json(asset, { status: 201 });
    } catch (error) {
        console.error('Error saving to library:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
