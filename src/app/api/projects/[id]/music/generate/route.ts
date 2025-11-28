import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// POST /api/projects/[id]/music/generate - Generate a new music track
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        const { genre, mood, duration, tempo, prompt, name } = body;

        const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/music/generate`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project_id: id,
                genre: genre || 'cinematic',
                mood: mood || 'epic',
                duration: duration || 60,
                tempo: tempo || 120,
                prompt: prompt || `${mood} ${genre} music`,
                name: name || 'Untitled Track'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Failed to generate music' },
                { status: response.status }
            );
        }

        const track = await response.json();
        return NextResponse.json(track, { status: 201 });
    } catch (error) {
        console.error('Error generating music:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
