import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/admin-store';

// Membership plan interface
interface MembershipPlan {
    id: string;
    name: string;
    price: number;
    billing_period: 'monthly' | 'yearly';
    credits_per_month: number;
    features: string[];
    active_subscribers: number;
    revenue: number;
    color: string;
    popular: boolean;
}

// Mock plans
const membershipPlans: MembershipPlan[] = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        billing_period: 'monthly',
        credits_per_month: 50,
        features: ['50 credits/month', 'Basic generation', 'Community support', 'Watermarked exports'],
        active_subscribers: 0,
        revenue: 0,
        color: 'gray',
        popular: false
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 29,
        billing_period: 'monthly',
        credits_per_month: 500,
        features: ['500 credits/month', 'HD generation', 'Priority support', 'No watermarks', 'API access'],
        active_subscribers: 0,
        revenue: 0,
        color: 'blue',
        popular: true
    },
    {
        id: 'studio',
        name: 'Studio',
        price: 99,
        billing_period: 'monthly',
        credits_per_month: 2500,
        features: ['2,500 credits/month', '4K generation', 'Dedicated support', 'Team collaboration', 'Custom styles', 'White-label exports'],
        active_subscribers: 0,
        revenue: 0,
        color: 'purple',
        popular: false
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 499,
        billing_period: 'monthly',
        credits_per_month: 15000,
        features: ['15,000 credits/month', '8K generation', 'SLA guarantee', 'Dedicated account manager', 'Custom integrations', 'On-premise option'],
        active_subscribers: 0,
        revenue: 0,
        color: 'yellow',
        popular: false
    },
];

export async function GET(request: NextRequest) {
    try {
        // Get users to calculate actual subscriber counts
        const users = adminStore.getUsers();
        
        // Calculate plan stats from users
        const planStats: Record<string, { subscribers: number; revenue: number }> = {
            user: { subscribers: 0, revenue: 0 },
            pro: { subscribers: 0, revenue: 0 },
            studio: { subscribers: 0, revenue: 0 },
            enterprise: { subscribers: 0, revenue: 0 },
        };
        
        users.forEach(user => {
            const plan = user.role === 'admin' ? 'enterprise' : user.role;
            if (planStats[plan]) {
                planStats[plan].subscribers++;
                planStats[plan].revenue += user.total_spent;
            }
        });
        
        // Update plans with actual stats
        const plans = membershipPlans.map(plan => {
            const stats = planStats[plan.id] || planStats['user'];
            return {
                ...plan,
                active_subscribers: stats?.subscribers || 0,
                revenue: stats?.revenue || 0,
            };
        });
        
        // Get subscribers with subscription info
        const subscribers = users
            .filter(u => u.subscription)
            .map(u => ({
                id: u.id,
                email: u.email,
                name: u.name,
                plan: u.subscription?.plan || 'Free',
                status: u.subscription?.status || 'active',
                started_at: u.subscription?.started_at || u.created_at,
                next_billing: u.subscription?.next_billing || '',
                total_paid: u.total_spent,
                credits_used: Math.floor(u.total_spent * 10),
            }));
        
        // Calculate summary stats
        const totalRevenue = plans.reduce((sum, p) => sum + p.revenue, 0);
        const totalSubscribers = plans.reduce((sum, p) => sum + p.active_subscribers, 0);
        const mrr = plans.reduce((sum, p) => sum + (p.price * p.active_subscribers), 0);
        
        return NextResponse.json({
            plans,
            subscribers,
            stats: {
                totalRevenue,
                totalSubscribers,
                mrr,
                avgSubscriptionValue: totalSubscribers > 0 ? Math.round(mrr / totalSubscribers) : 0,
                conversionRate: 23.5, // Mock
                churnRate: 4.2, // Mock
            }
        });
    } catch (error) {
        console.error('Error fetching memberships data:', error);
        return NextResponse.json({ error: 'Failed to fetch memberships data' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, userId, planId } = body;
        
        switch (action) {
            case 'change_plan': {
                const user = adminStore.updateUser(userId, { role: planId });
                if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
                return NextResponse.json({ success: true, user });
            }
            
            case 'cancel': {
                const user = adminStore.getUser(userId);
                if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
                // In real app, would update subscription status
                return NextResponse.json({ success: true });
            }
            
            case 'pause': {
                const user = adminStore.getUser(userId);
                if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
                // In real app, would pause subscription
                return NextResponse.json({ success: true });
            }
            
            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing membership action:', error);
        return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
    }
}
