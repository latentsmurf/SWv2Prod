import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// POST /api/ai/voice/clone
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audio = formData.get('audio') as File;
        const name = formData.get('name') as string;
        const projectId = formData.get('project_id') as string;

        if (!audio || !name) {
            return NextResponse.json({ error: 'Audio file and name are required' }, { status: 400 });
        }

        // Try Python backend first
        try {
            const backendFormData = new FormData();
            backendFormData.append('audio', audio);
            backendFormData.append('name', name);
            backendFormData.append('project_id', projectId);

            const response = await fetch(`${PYTHON_API_URL}/api/ai/voice/clone`, {
                method: 'POST',
                headers: {
                    'Authorization': request.headers.get('Authorization') || '',
                },
                body: backendFormData
            });

            if (response.ok) {
                return NextResponse.json(await response.json());
            }
        } catch (backendError) {
            console.log('Backend not available for voice cloning');
        }

        // Try ElevenLabs directly
        if (ELEVENLABS_API_KEY) {
            try {
                const elevenLabsFormData = new FormData();
                elevenLabsFormData.append('name', name);
                elevenLabsFormData.append('files', audio);

                const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
                    method: 'POST',
                    headers: {
                        'xi-api-key': ELEVENLABS_API_KEY,
                    },
                    body: elevenLabsFormData
                });

                if (response.ok) {
                    const data = await response.json();
                    return NextResponse.json({
                        id: data.voice_id,
                        name,
                        type: 'cloned',
                        source: 'elevenlabs',
                        created_at: new Date().toISOString()
                    });
                }
            } catch (elevenLabsError) {
                console.error('ElevenLabs clone error:', elevenLabsError);
            }
        }

        // Fallback: return mock cloned voice
        return NextResponse.json({
            id: crypto.randomUUID(),
            name,
            type: 'cloned',
            source: 'demo',
            created_at: new Date().toISOString(),
            message: 'Demo voice created. Set ELEVENLABS_API_KEY for real voice cloning.'
        });
    } catch (error) {
        console.error('Voice clone error:', error);
        return NextResponse.json({ error: 'Failed to clone voice' }, { status: 500 });
    }
}
