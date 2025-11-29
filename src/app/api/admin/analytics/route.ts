import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// ANALYTICS DATA GENERATION
// ============================================================================

function generateDailyData(days: number): { date: string; users: number; revenue: number; credits: number; projects: number }[] {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        data.push({
            date: date.toISOString().split('T')[0],
            users: Math.floor(Math.random() * 50) + 10,
            revenue: Math.floor(Math.random() * 5000) + 500,
            credits: Math.floor(Math.random() * 50000) + 10000,
            projects: Math.floor(Math.random() * 100) + 20,
        });
    }
    
    return data;
}

function generatePlanDistribution() {
    return [
        { plan: 'Free', users: 8432, percentage: 68.5, color: '#6b7280' },
        { plan: 'Pro', users: 2847, percentage: 23.1, color: '#3b82f6' },
        { plan: 'Studio', users: 567, percentage: 4.6, color: '#8b5cf6' },
        { plan: 'Enterprise', users: 43, percentage: 0.4, color: '#eab308' },
    ];
}

function generateTopFeatures() {
    return [
        { feature: 'Script Editor', usage: 45230, growth: 12.5 },
        { feature: 'Shot Generator', usage: 38750, growth: 18.3 },
        { feature: 'Voice Cloning', usage: 28430, growth: 25.7 },
        { feature: 'Music Generator', usage: 15820, growth: 8.2 },
        { feature: 'Video Export', usage: 12450, growth: -3.1 },
        { feature: 'Collaboration', usage: 8930, growth: 45.2 },
    ];
}

function generateRevenueBreakdown() {
    return [
        { source: 'Subscriptions', amount: 89540, percentage: 70.2 },
        { source: 'Credit Packs', amount: 28430, percentage: 22.3 },
        { source: 'Enterprise Contracts', amount: 9530, percentage: 7.5 },
    ];
}

function generateChurnData() {
    return {
        rate: 4.2,
        trend: -0.8,
        reasons: [
            { reason: 'Too expensive', count: 45, percentage: 35.2 },
            { reason: 'Missing features', count: 32, percentage: 25.0 },
            { reason: 'Switched to competitor', count: 28, percentage: 21.9 },
            { reason: 'Not using anymore', count: 15, percentage: 11.7 },
            { reason: 'Other', count: 8, percentage: 6.2 },
        ]
    };
}

function generateGeographicData() {
    return [
        { country: 'United States', users: 5240, revenue: 68500, flag: '🇺🇸' },
        { country: 'United Kingdom', users: 1820, revenue: 24300, flag: '🇬🇧' },
        { country: 'Germany', users: 1450, revenue: 19800, flag: '🇩🇪' },
        { country: 'Canada', users: 980, revenue: 13200, flag: '🇨🇦' },
        { country: 'Australia', users: 720, revenue: 9800, flag: '🇦🇺' },
        { country: 'Japan', users: 650, revenue: 8900, flag: '🇯🇵' },
        { country: 'France', users: 580, revenue: 7600, flag: '🇫🇷' },
        { country: 'Others', users: 2450, revenue: 32100, flag: '🌍' },
    ];
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30';
        const days = parseInt(period);
        
        const dailyData = generateDailyData(days);
        const planDistribution = generatePlanDistribution();
        const topFeatures = generateTopFeatures();
        const revenueBreakdown = generateRevenueBreakdown();
        const churnData = generateChurnData();
        const geoData = generateGeographicData();
        
        // Calculate summary stats
        const totalUsers = dailyData.reduce((sum, d) => sum + d.users, 0);
        const totalRevenue = dailyData.reduce((sum, d) => sum + d.revenue, 0);
        const totalCredits = dailyData.reduce((sum, d) => sum + d.credits, 0);
        const totalProjects = dailyData.reduce((sum, d) => sum + d.projects, 0);
        
        // Calculate growth
        const halfPoint = Math.floor(dailyData.length / 2);
        const firstHalf = dailyData.slice(0, halfPoint);
        const secondHalf = dailyData.slice(halfPoint);
        
        const revenueGrowth = secondHalf.reduce((s, d) => s + d.revenue, 0) / firstHalf.reduce((s, d) => s + d.revenue, 0) - 1;
        const userGrowth = secondHalf.reduce((s, d) => s + d.users, 0) / firstHalf.reduce((s, d) => s + d.users, 0) - 1;
        
        return NextResponse.json({
            summary: {
                totalUsers,
                totalRevenue,
                totalCredits,
                totalProjects,
                avgRevenuePerUser: Math.round(totalRevenue / totalUsers * 100) / 100,
                revenueGrowth: Math.round(revenueGrowth * 1000) / 10,
                userGrowth: Math.round(userGrowth * 1000) / 10,
            },
            dailyData,
            planDistribution,
            topFeatures,
            revenueBreakdown,
            churnData,
            geoData,
            period: days,
        });
    } catch (error) {
        console.error('Error generating analytics:', error);
        return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 });
    }
}
