import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';
const SUNO_API_KEY = process.env.SUNO_API_KEY;

// POST /api/ai/music/generate
export async function POST(request: NextRequest) {
    try {
        const { project_id, mood, genre, duration, tempo, prompt } = await request.json();

        // Try Python backend first
        try {
            const response = await fetch(`${PYTHON_API_URL}/api/ai/music/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': request.headers.get('Authorization') || '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ project_id, mood, genre, duration, tempo, prompt })
            });

            if (response.ok) {
                return NextResponse.json(await response.json());
            }
        } catch (backendError) {
            console.log('Backend not available for music generation');
        }

        // Try Suno API if available
        if (SUNO_API_KEY) {
            try {
                // Note: Suno API integration would go here
                // This is a placeholder for the actual integration
                console.log('Suno API key present but integration pending');
            } catch (sunoError) {
                console.error('Suno error:', sunoError);
            }
        }

        // Simulate generation delay
        await new Promise(r => setTimeout(r, 2000));

        // Return demo track
        return NextResponse.json({
            id: crypto.randomUUID(),
            name: `${mood?.charAt(0).toUpperCase()}${mood?.slice(1) || 'Custom'} ${genre || 'Cinematic'} Track`,
            url: '/sounds/placeholder.mp3',
            duration: duration || 60,
            mood: mood || 'dramatic',
            genre: genre || 'cinematic',
            tempo: tempo || 100,
            created_at: new Date().toISOString(),
            source: 'demo',
            message: 'Demo track. Set SUNO_API_KEY for AI-generated music.'
        });
    } catch (error) {
        console.error('Music generation error:', error);
        return NextResponse.json({ error: 'Failed to generate music' }, { status: 500 });
    }
}
