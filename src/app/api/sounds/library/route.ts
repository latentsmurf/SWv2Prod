import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// GET /api/sounds/library - Get sound library
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${PYTHON_API_URL}/api/sounds/library`, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Return mock data
            return NextResponse.json([
                { id: '1', name: 'City Ambience', category: 'ambience', duration: 120, url: '', tags: ['urban', 'background'] },
                { id: '2', name: 'Footsteps - Concrete', category: 'foley', duration: 5, url: '', tags: ['walking', 'steps'] },
                { id: '3', name: 'Door Slam', category: 'sfx', duration: 2, url: '', tags: ['door', 'impact'] },
                { id: '4', name: 'Thunder Rumble', category: 'sfx', duration: 8, url: '', tags: ['weather', 'storm'] },
                { id: '5', name: 'Wind Howling', category: 'ambience', duration: 60, url: '', tags: ['weather', 'wind'] },
            ]);
        }

        const library = await response.json();
        return NextResponse.json(library);
    } catch (error) {
        console.error('Error fetching sound library:', error);
        return NextResponse.json([]);
    }
}
