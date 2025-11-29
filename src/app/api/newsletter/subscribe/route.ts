import { NextRequest, NextResponse } from 'next/server';
import { emailService, Subscriber } from '@/lib/email';

// In-memory store for demo (in production, use a database)
const subscribers: Map<string, Subscriber> = new Map();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name, source = 'website', tags = [] } = body;

        // Validate email
        if (!email || !emailService.isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Valid email address is required' },
                { status: 400 }
            );
        }

        // Check if already subscribed
        const existing = subscribers.get(email.toLowerCase());
        if (existing && existing.status === 'active') {
            return NextResponse.json(
                { message: 'Already subscribed', subscriber: existing },
                { status: 200 }
            );
        }

        // Create new subscriber
        const subscriber: Subscriber = {
            id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: email.toLowerCase(),
            name: name || undefined,
            status: 'active',
            source,
            tags,
            subscribedAt: new Date().toISOString(),
        };

        subscribers.set(email.toLowerCase(), subscriber);

        // Send welcome email
        try {
            await emailService.sendEmail({
                to: email,
                subject: 'Thanks for subscribing! 🎬',
                templateId: 'newsletter-welcome',
                variables: {
                    email: email,
                    unsubscribe_link: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(email)}`,
                },
            });
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the subscription if email fails
        }

        return NextResponse.json({
            message: 'Successfully subscribed',
            subscriber,
        });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { error: 'Failed to subscribe' },
            { status: 500 }
        );
    }
}

export async function GET() {
    // Return all subscribers (admin only in production)
    const allSubscribers = Array.from(subscribers.values());
    return NextResponse.json({
        subscribers: allSubscribers,
        total: allSubscribers.length,
        active: allSubscribers.filter(s => s.status === 'active').length,
    });
}
