import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const response = await fetch(`${PYTHON_API_URL}/api/library/environments`, {
            headers: { 'Authorization': authHeader || '', 'Content-Type': 'application/json' }
        });
        if (!response.ok) return NextResponse.json([]);
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Error fetching environments:', error);
        return NextResponse.json([]);
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const body = await request.json();
        const response = await fetch(`${PYTHON_API_URL}/api/library/environments`, {
            method: 'POST',
            headers: { 'Authorization': authHeader || '', 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) return NextResponse.json({ error: 'Failed' }, { status: response.status });
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Error adding environment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
