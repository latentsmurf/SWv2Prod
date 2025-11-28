import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/team - Get team members
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/team`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Return mock data
            return NextResponse.json({
                members: [
                    {
                        id: 'user-1',
                        email: 'owner@example.com',
                        name: 'Project Owner',
                        role: 'owner',
                        status: 'active',
                        joined_at: new Date().toISOString()
                    }
                ],
                invitations: []
            });
        }

        const team = await response.json();
        return NextResponse.json(team);
    } catch (error) {
        console.error('Error fetching team:', error);
        return NextResponse.json({ members: [], invitations: [] });
    }
}
