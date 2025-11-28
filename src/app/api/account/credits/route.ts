import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/account/credits - Get credit balance and transactions
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/account/credits`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Return default balance if API fails
            return NextResponse.json({
                balance: {
                    total: 100,
                    used: 0,
                    remaining: 100,
                    plan: 'free',
                    renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                },
                transactions: []
            });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching credits:', error);
        // Return default balance on error
        return NextResponse.json({
            balance: {
                total: 100,
                used: 0,
                remaining: 100,
                plan: 'free',
                renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            transactions: []
        });
    }
}

// POST /api/account/credits - Deduct credits for usage
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        const { amount, category, description, project_id } = body;

        if (!amount || !category) {
            return NextResponse.json(
                { error: 'amount and category are required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${PYTHON_API_URL}/api/account/credits/deduct`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount,
                category,
                description: description || `${category} generation`,
                project_id
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Failed to deduct credits' },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error deducting credits:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
