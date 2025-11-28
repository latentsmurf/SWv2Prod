import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// POST /api/generate/voiceover - Generate voice-over audio from text
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        const { project_id, scene_id, text, voice_id } = body;

        if (!text) {
            return NextResponse.json(
                { error: 'text is required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${PYTHON_API_URL}/api/generate/voiceover`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project_id,
                scene_id,
                text,
                voice_id: voice_id || 'narrator_male'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Voice-over generation failed' },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error generating voice-over:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
