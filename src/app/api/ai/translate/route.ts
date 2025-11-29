import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// POST /api/ai/translate
export async function POST(request: NextRequest) {
    try {
        const { text, source_language, target_language, context } = await request.json();

        if (!text || !target_language) {
            return NextResponse.json({ error: 'Text and target language are required' }, { status: 400 });
        }

        // Try Python backend first
        try {
            const response = await fetch(`${PYTHON_API_URL}/api/ai/translate`, {
                method: 'POST',
                headers: {
                    'Authorization': request.headers.get('Authorization') || '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, source_language, target_language, context })
            });

            if (response.ok) {
                return NextResponse.json(await response.json());
            }
        } catch (backendError) {
            console.log('Backend not available for translation');
        }

        // Try OpenAI
        if (OPENAI_API_KEY) {
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: `You are a professional subtitle translator. Translate the given subtitles to ${target_language}. 
                                Maintain timing cues, formatting, and natural dialogue flow. 
                                ${context ? `Context: ${context}` : ''}
                                Return ONLY the translated text, preserving all formatting.`
                            },
                            { role: 'user', content: text }
                        ],
                        temperature: 0.3
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    return NextResponse.json({
                        translated_text: data.choices[0].message.content,
                        source_language: source_language || 'auto-detected',
                        target_language,
                        source: 'openai'
                    });
                }
            } catch (openaiError) {
                console.error('OpenAI translation error:', openaiError);
            }
        }

        // Try Anthropic
        if (ANTHROPIC_API_KEY) {
            try {
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'x-api-key': ANTHROPIC_API_KEY,
                        'Content-Type': 'application/json',
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: 'claude-3-haiku-20240307',
                        max_tokens: 4096,
                        messages: [
                            {
                                role: 'user',
                                content: `Translate these subtitles to ${target_language}. Maintain all formatting and timing markers. ${context ? `Context: ${context}` : ''}\n\n${text}`
                            }
                        ]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    return NextResponse.json({
                        translated_text: data.content[0].text,
                        source_language: source_language || 'auto-detected',
                        target_language,
                        source: 'anthropic'
                    });
                }
            } catch (anthropicError) {
                console.error('Anthropic translation error:', anthropicError);
            }
        }

        // Demo fallback - return original text with note
        return NextResponse.json({
            translated_text: text,
            source_language: source_language || 'en',
            target_language,
            source: 'demo',
            message: 'Demo mode. Set OPENAI_API_KEY or ANTHROPIC_API_KEY for real translation.'
        });
    } catch (error) {
        console.error('Translation error:', error);
        return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
    }
}
