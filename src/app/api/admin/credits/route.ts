import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/admin-store';

// Credit transaction types
interface CreditTransaction {
    id: string;
    user_id: string;
    user_email: string;
    type: 'purchase' | 'consumption' | 'refund' | 'bonus' | 'adjustment';
    amount: number;
    balance_after: number;
    description: string;
    metadata?: Record<string, any>;
    created_at: string;
}

// Mock transactions store
const transactions: CreditTransaction[] = [
    { id: '1', user_id: 'user-1', user_email: 'john@example.com', type: 'purchase', amount: 1000, balance_after: 1500, description: 'Purchased Pro Pack', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: '2', user_id: 'user-2', user_email: 'sarah@studio.com', type: 'consumption', amount: -50, balance_after: 8450, description: 'Video generation (HD)', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: '3', user_id: 'user-4', user_email: 'mike@films.io', type: 'bonus', amount: 100, balance_after: 300, description: 'Referral bonus', created_at: new Date(Date.now() - 10800000).toISOString() },
    { id: '4', user_id: 'user-1', user_email: 'john@example.com', type: 'consumption', amount: -150, balance_after: 1350, description: 'Batch image generation (15 shots)', created_at: new Date(Date.now() - 14400000).toISOString() },
    { id: '5', user_id: 'user-2', user_email: 'sarah@studio.com', type: 'refund', amount: 500, balance_after: 9000, description: 'Refund for failed generation', created_at: new Date(Date.now() - 18000000).toISOString() },
    { id: '6', user_id: 'user-3', user_email: 'netflix@partner.com', type: 'purchase', amount: 50000, balance_after: 125000, description: 'Purchased Enterprise Pack', created_at: new Date(Date.now() - 21600000).toISOString() },
];

// Credit plans
const creditPlans = [
    { id: 'starter', name: 'Starter Pack', credits: 100, price: 9.99, popular: false, active: true },
    { id: 'pro', name: 'Pro Pack', credits: 1000, price: 79.99, popular: true, active: true },
    { id: 'studio', name: 'Studio Pack', credits: 5000, price: 299.99, popular: false, active: true },
    { id: 'enterprise', name: 'Enterprise Pack', credits: 25000, price: 999.99, popular: false, active: true },
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || undefined;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
        
        let filteredTransactions = [...transactions];
        if (type && type !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.type === type);
        }
        
        // Get users for stats
        const users = adminStore.getUsers();
        
        // Calculate stats
        const totalCreditsIssued = users.reduce((sum, u) => sum + u.credits + (u.total_spent * 10), 0);
        const totalCreditsConsumed = Math.floor(totalCreditsIssued * 0.6);
        const revenue = users.reduce((sum, u) => sum + u.total_spent, 0);
        
        return NextResponse.json({
            transactions: filteredTransactions.slice(0, limit),
            plans: creditPlans,
            stats: {
                totalCreditsIssued,
                totalCreditsConsumed,
                revenue,
                avgCreditPrice: 0.08,
            },
            topUsers: users
                .sort((a, b) => b.credits - a.credits)
                .slice(0, 5)
                .map(u => ({
                    user_id: u.id,
                    email: u.email,
                    name: u.name,
                    balance: u.credits,
                    total_purchased: Math.floor(u.total_spent * 12.5),
                    total_consumed: Math.floor(u.total_spent * 7.5),
                    plan: u.role,
                }))
        });
    } catch (error) {
        console.error('Error fetching credits data:', error);
        return NextResponse.json({ error: 'Failed to fetch credits data' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, userId, amount, reason } = body;
        
        switch (action) {
            case 'adjust': {
                const user = adminStore.adjustUserCredits(userId, amount, reason || 'Admin adjustment');
                if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
                
                // Add transaction
                const newTransaction: CreditTransaction = {
                    id: `tx-${Date.now()}`,
                    user_id: userId,
                    user_email: user.email,
                    type: amount > 0 ? 'bonus' : 'adjustment',
                    amount,
                    balance_after: user.credits,
                    description: reason || 'Admin adjustment',
                    created_at: new Date().toISOString()
                };
                transactions.unshift(newTransaction);
                
                return NextResponse.json({ success: true, transaction: newTransaction, user });
            }
            
            case 'grant_bonus': {
                const user = adminStore.adjustUserCredits(userId, amount, 'Promotional bonus');
                if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
                return NextResponse.json({ success: true, user });
            }
            
            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing credits action:', error);
        return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
    }
}
