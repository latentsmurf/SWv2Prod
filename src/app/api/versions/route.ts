import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/versions - Get version history
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const { searchParams } = new URL(request.url);
        const entityType = searchParams.get('entity_type');
        const entityId = searchParams.get('entity_id');

        if (!entityType || !entityId) {
            return NextResponse.json(
                { error: 'entity_type and entity_id are required' },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${PYTHON_API_URL}/api/versions?entity_type=${entityType}&entity_id=${entityId}`,
            {
                headers: {
                    'Authorization': authHeader || '',
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            return NextResponse.json([]);
        }

        const versions = await response.json();
        return NextResponse.json(versions);
    } catch (error) {
        console.error('Error fetching versions:', error);
        return NextResponse.json([]);
    }
}
