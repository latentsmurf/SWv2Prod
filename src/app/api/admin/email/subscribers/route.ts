import { NextRequest, NextResponse } from 'next/server';
import { Subscriber } from '@/lib/email';

// In-memory store for subscribers (in production, use database)
const subscribers: Map<string, Subscriber> = new Map();

// Add some mock subscribers
const mockSubscribers: Subscriber[] = [
    { id: 'sub_1', email: 'john.filmmaker@gmail.com', name: 'John Filmmaker', status: 'active', source: 'website', tags: ['beta', 'pro'], subscribedAt: '2024-01-10T08:30:00Z' },
    { id: 'sub_2', email: 'sarah.director@outlook.com', name: 'Sarah Director', status: 'active', source: 'website', tags: ['beta'], subscribedAt: '2024-01-12T14:20:00Z' },
    { id: 'sub_3', email: 'mike.producer@yahoo.com', name: 'Mike Producer', status: 'active', source: 'import', tags: ['newsletter'], subscribedAt: '2024-01-15T09:45:00Z' },
    { id: 'sub_4', email: 'emma.writer@gmail.com', name: 'Emma Writer', status: 'active', source: 'website', tags: ['newsletter', 'updates'], subscribedAt: '2024-01-18T16:00:00Z' },
    { id: 'sub_5', email: 'alex.creator@proton.me', name: 'Alex Creator', status: 'unsubscribed', source: 'website', tags: ['beta'], subscribedAt: '2024-01-05T11:30:00Z', unsubscribedAt: '2024-02-01T10:00:00Z' },
    { id: 'sub_6', email: 'chris.animator@gmail.com', name: 'Chris Animator', status: 'active', source: 'api', tags: ['pro', 'enterprise'], subscribedAt: '2024-01-20T13:15:00Z' },
    { id: 'sub_7', email: 'diana.editor@icloud.com', name: 'Diana Editor', status: 'bounced', source: 'import', tags: ['newsletter'], subscribedAt: '2024-01-08T07:00:00Z' },
    { id: 'sub_8', email: 'frank.vfx@gmail.com', name: 'Frank VFX', status: 'active', source: 'website', tags: ['beta', 'newsletter'], subscribedAt: '2024-01-22T18:30:00Z' },
    { id: 'sub_9', email: 'grace.colorist@outlook.com', name: 'Grace Colorist', status: 'pending', source: 'website', tags: [], subscribedAt: '2024-02-10T09:00:00Z' },
    { id: 'sub_10', email: 'henry.sound@gmail.com', name: 'Henry Sound', status: 'active', source: 'manual', tags: ['pro'], subscribedAt: '2024-02-05T12:00:00Z' },
];

mockSubscribers.forEach(s => subscribers.set(s.id, s));

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    let result = Array.from(subscribers.values());

    // Filter by status
    if (status && status !== 'all') {
        result = result.filter(s => s.status === status);
    }

    // Filter by tag
    if (tag) {
        result = result.filter(s => s.tags.includes(tag));
    }

    // Search by email or name
    if (search) {
        const searchLower = search.toLowerCase();
        result = result.filter(
            s => s.email.toLowerCase().includes(searchLower) ||
                 (s.name && s.name.toLowerCase().includes(searchLower))
        );
    }

    // Sort by subscribed date (newest first)
    result.sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime());

    // Get all unique tags
    const allTags = new Set<string>();
    subscribers.forEach(s => s.tags.forEach(t => allTags.add(t)));

    return NextResponse.json({
        subscribers: result,
        total: subscribers.size,
        filtered: result.length,
        stats: {
            active: Array.from(subscribers.values()).filter(s => s.status === 'active').length,
            unsubscribed: Array.from(subscribers.values()).filter(s => s.status === 'unsubscribed').length,
            bounced: Array.from(subscribers.values()).filter(s => s.status === 'bounced').length,
            pending: Array.from(subscribers.values()).filter(s => s.status === 'pending').length,
        },
        tags: Array.from(allTags),
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name, tags = [], source = 'manual' } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if already exists
        const existing = Array.from(subscribers.values()).find(
            s => s.email.toLowerCase() === email.toLowerCase()
        );
        if (existing) {
            return NextResponse.json(
                { error: 'Subscriber already exists' },
                { status: 400 }
            );
        }

        const subscriber: Subscriber = {
            id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: email.toLowerCase(),
            name,
            status: 'active',
            source,
            tags,
            subscribedAt: new Date().toISOString(),
        };

        subscribers.set(subscriber.id, subscriber);

        return NextResponse.json({
            message: 'Subscriber added successfully',
            subscriber,
        });
    } catch (error) {
        console.error('Add subscriber error:', error);
        return NextResponse.json(
            { error: 'Failed to add subscriber' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Subscriber ID is required' },
                { status: 400 }
            );
        }

        const existing = subscribers.get(id);
        if (!existing) {
            return NextResponse.json(
                { error: 'Subscriber not found' },
                { status: 404 }
            );
        }

        const updated: Subscriber = {
            ...existing,
            ...updates,
            id: existing.id,
            subscribedAt: existing.subscribedAt,
        };

        // Track unsubscribe time
        if (updates.status === 'unsubscribed' && existing.status !== 'unsubscribed') {
            updated.unsubscribedAt = new Date().toISOString();
        }

        subscribers.set(id, updated);

        return NextResponse.json({
            message: 'Subscriber updated successfully',
            subscriber: updated,
        });
    } catch (error) {
        console.error('Update subscriber error:', error);
        return NextResponse.json(
            { error: 'Failed to update subscriber' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json(
            { error: 'Subscriber ID is required' },
            { status: 400 }
        );
    }

    if (!subscribers.has(id)) {
        return NextResponse.json(
            { error: 'Subscriber not found' },
            { status: 404 }
        );
    }

    subscribers.delete(id);

    return NextResponse.json({
        message: 'Subscriber deleted successfully',
    });
}
