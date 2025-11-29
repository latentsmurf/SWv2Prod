import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// POST /api/ai/voice/generate
export async function POST(request: NextRequest) {
    try {
        const { voice_id, text, project_id } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Try Python backend first
        try {
            const response = await fetch(`${PYTHON_API_URL}/api/ai/voice/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': request.headers.get('Authorization') || '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ voice_id, text, project_id })
            });

            if (response.ok) {
                return NextResponse.json(await response.json());
            }
        } catch (backendError) {
            console.log('Backend not available, trying ElevenLabs...');
        }

        // Try ElevenLabs directly
        if (ELEVENLABS_API_KEY) {
            try {
                const elevenLabsVoiceId = voice_id || '21m00Tcm4TlvDq8ikWAM'; // Default voice
                
                const response = await fetch(
                    `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`,
                    {
                        method: 'POST',
                        headers: {
                            'xi-api-key': ELEVENLABS_API_KEY,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            text,
                            model_id: 'eleven_monolingual_v1',
                            voice_settings: {
                                stability: 0.5,
                                similarity_boost: 0.75
                            }
                        })
                    }
                );

                if (response.ok) {
                    const audioBuffer = await response.arrayBuffer();
                    const base64Audio = Buffer.from(audioBuffer).toString('base64');
                    
                    return NextResponse.json({
                        audio_url: `data:audio/mpeg;base64,${base64Audio}`,
                        source: 'elevenlabs'
                    });
                }
            } catch (elevenLabsError) {
                console.error('ElevenLabs error:', elevenLabsError);
            }
        }

        // Fallback: return placeholder
        return NextResponse.json({
            audio_url: '/sounds/placeholder.mp3',
            source: 'demo',
            message: 'Using placeholder audio. Set ELEVENLABS_API_KEY for real voice generation.'
        });
    } catch (error) {
        console.error('Voice generation error:', error);
        return NextResponse.json({ error: 'Failed to generate voice' }, { status: 500 });
    }
}
