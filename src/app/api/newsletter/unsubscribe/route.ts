import { NextRequest, NextResponse } from 'next/server';

// This would connect to the same store as subscribe route
// For demo, we'll just acknowledge the request

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email) {
        return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
        );
    }

    // In production, validate token and update database
    return NextResponse.json({
        message: 'Successfully unsubscribed',
        email: email,
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, reason } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // In production, update database and log reason
        console.log(`Unsubscribe: ${email}, reason: ${reason || 'not provided'}`);

        return NextResponse.json({
            message: 'Successfully unsubscribed',
            email: email,
        });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return NextResponse.json(
            { error: 'Failed to unsubscribe' },
            { status: 500 }
        );
    }
}
