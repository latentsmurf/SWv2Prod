import { NextRequest, NextResponse } from 'next/server';
import { EmailCampaign } from '@/lib/email';

// In-memory store for campaigns (in production, use database)
const campaigns: Map<string, EmailCampaign> = new Map();

// Add some mock campaigns
const mockCampaigns: EmailCampaign[] = [
    {
        id: 'camp_1',
        name: 'Launch Announcement',
        subject: '🚀 SceneWeaver is Live!',
        templateId: 'promotional',
        status: 'sent',
        sentAt: '2024-01-15T10:00:00Z',
        recipientCount: 1250,
        openCount: 875,
        clickCount: 324,
        tags: ['launch', 'announcement'],
        createdAt: '2024-01-14T15:00:00Z',
    },
    {
        id: 'camp_2',
        name: 'New Feature: AI Storyboarding',
        subject: '✨ New Feature: AI Storyboarding',
        templateId: 'new-feature',
        status: 'sent',
        sentAt: '2024-02-01T14:00:00Z',
        recipientCount: 1480,
        openCount: 962,
        clickCount: 445,
        tags: ['feature', 'update'],
        createdAt: '2024-01-31T09:00:00Z',
    },
    {
        id: 'camp_3',
        name: 'February Newsletter',
        subject: '📬 SceneWeaver Monthly: February Edition',
        templateId: 'promotional',
        status: 'scheduled',
        scheduledFor: '2024-02-15T10:00:00Z',
        recipientCount: 1520,
        openCount: 0,
        clickCount: 0,
        tags: ['newsletter', 'monthly'],
        createdAt: '2024-02-10T11:00:00Z',
    },
    {
        id: 'camp_4',
        name: 'Pro Plan Promotion',
        subject: '💎 Upgrade to Pro - 50% Off This Week',
        templateId: 'promotional',
        status: 'draft',
        recipientCount: 0,
        openCount: 0,
        clickCount: 0,
        tags: ['promotion', 'upgrade'],
        createdAt: '2024-02-12T16:00:00Z',
    },
];

mockCampaigns.forEach(c => campaigns.set(c.id, c));

export async function GET() {
    const allCampaigns = Array.from(campaigns.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
        campaigns: allCampaigns,
        total: allCampaigns.length,
        stats: {
            draft: allCampaigns.filter(c => c.status === 'draft').length,
            scheduled: allCampaigns.filter(c => c.status === 'scheduled').length,
            sent: allCampaigns.filter(c => c.status === 'sent').length,
        },
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, subject, templateId, scheduledFor, tags } = body;

        if (!name || !subject || !templateId) {
            return NextResponse.json(
                { error: 'Name, subject, and templateId are required' },
                { status: 400 }
            );
        }

        const campaign: EmailCampaign = {
            id: `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            subject,
            templateId,
            status: scheduledFor ? 'scheduled' : 'draft',
            scheduledFor,
            recipientCount: 0,
            openCount: 0,
            clickCount: 0,
            tags: tags || [],
            createdAt: new Date().toISOString(),
        };

        campaigns.set(campaign.id, campaign);

        return NextResponse.json({
            message: 'Campaign created successfully',
            campaign,
        });
    } catch (error) {
        console.error('Create campaign error:', error);
        return NextResponse.json(
            { error: 'Failed to create campaign' },
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
                { error: 'Campaign ID is required' },
                { status: 400 }
            );
        }

        const existing = campaigns.get(id);
        if (!existing) {
            return NextResponse.json(
                { error: 'Campaign not found' },
                { status: 404 }
            );
        }

        const updated: EmailCampaign = {
            ...existing,
            ...updates,
            id: existing.id,
            createdAt: existing.createdAt,
        };

        campaigns.set(id, updated);

        return NextResponse.json({
            message: 'Campaign updated successfully',
            campaign: updated,
        });
    } catch (error) {
        console.error('Update campaign error:', error);
        return NextResponse.json(
            { error: 'Failed to update campaign' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json(
            { error: 'Campaign ID is required' },
            { status: 400 }
        );
    }

    if (!campaigns.has(id)) {
        return NextResponse.json(
            { error: 'Campaign not found' },
            { status: 404 }
        );
    }

    campaigns.delete(id);

    return NextResponse.json({
        message: 'Campaign deleted successfully',
    });
}
