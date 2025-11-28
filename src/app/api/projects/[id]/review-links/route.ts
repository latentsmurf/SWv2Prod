import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// Generate a secure random token
function generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

// GET /api/projects/[id]/review-links - Get all review links for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/review-links`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch review links' },
                { status: response.status }
            );
        }

        const links = await response.json();
        return NextResponse.json(links);
    } catch (error) {
        console.error('Error fetching review links:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/projects/[id]/review-links - Create a new review link
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        // Generate token
        const token = generateToken();
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const url = `${baseUrl}/review/${token}`;

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/review-links`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project_id: id,
                token,
                url,
                name: body.name,
                password_protected: body.password_protected || false,
                password: body.password,
                expires_at: body.expires_at,
                allow_comments: body.allow_comments !== false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Failed to create review link' },
                { status: response.status }
            );
        }

        const link = await response.json();
        return NextResponse.json(link, { status: 201 });
    } catch (error) {
        console.error('Error creating review link:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
