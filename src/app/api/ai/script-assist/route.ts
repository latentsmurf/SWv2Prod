import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// System prompts for different scenarios
const STANDARD_SYSTEM_PROMPT = `You are an expert screenwriter and script consultant. You help writers improve their scripts with:
- Natural, compelling dialogue
- Strong scene structure
- Visual storytelling techniques
- Character development
- Proper screenplay formatting

Respond concisely and provide actionable suggestions. When asked to rewrite content, provide the improved version directly.`;

const MICRO_DRAMA_SYSTEM_PROMPT = `You are an expert writer for vertical micro dramas (9:16 format) like RealShort, ReelShort, and DramaBox.

KEY RULES FOR MICRO DRAMAS:
- Episodes are 1-3 minutes each (60-90 seconds is ideal)
- EVERY episode MUST end on a cliffhanger or shocking moment
- Use short, punchy dialogue - no long speeches
- Heavy on close-ups and reaction shots
- Include "hook moments" in first 3 seconds of each episode
- Build tension quickly, reveal slowly
- Use dramatic pauses before reveals
- Consider text overlays for inner thoughts
- Fast pacing with quick scene transitions

POPULAR MICRO DRAMA TROPES:
- Mistaken identity / hidden identity reveals
- Secret billionaire / CEO reveals  
- Revenge plots with satisfying payoffs
- Contract marriages that become real
- Dramatic confrontations in public
- Shocking family secrets
- "You didn't know who you were messing with" moments
- Transformation/glow-up reveals

When writing or improving scenes:
1. Always suggest a strong cliffhanger ending
2. Keep dialogue under 10 words per line when possible
3. Include emotional reaction beats
4. Think vertically - frame for close-ups`;

// Fallback responses when no AI API is available
function generateFallbackResponse(message: string, context?: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('cliffhanger')) {
        return `Here's a cliffhanger suggestion for your scene:

End the scene at the moment of highest tension - right before a revelation or decision. For example:

"She reached for the envelope, her hands trembling. Inside was the truth that would change everything. She pulled out the photograph and—"

[CUT TO BLACK]

This leaves the audience desperate to see the next episode. The key is to cut at the exact moment of anticipation, not after the reveal.`;
    }
    
    if (lowerMessage.includes('dialogue') || lowerMessage.includes('improve')) {
        return `To improve this dialogue, consider:

1. **Subtext**: What characters don't say is often more powerful than what they do
2. **Conflict**: Every line should either advance the plot or reveal character
3. **Brevity**: Cut any word that doesn't earn its place
4. **Voice**: Each character should have distinct speech patterns

Would you like me to rewrite a specific section?`;
    }
    
    if (lowerMessage.includes('hook') || lowerMessage.includes('opening')) {
        return `For a strong opening hook (first 3 seconds):

Options:
1. **Mystery**: Start with an unexplained action or statement
2. **Conflict**: Open mid-argument or confrontation  
3. **Danger**: Begin with immediate threat or tension
4. **Question**: Ask something that demands an answer

Example: "I know what you did last summer..." (cut to shocked face)

The goal is to make scrolling past impossible.`;
    }
    
    return `I'd be happy to help with your script! Here are some things I can assist with:

• **Improve dialogue** - Make it more natural and compelling
• **Add cliffhangers** - End scenes with hooks that keep viewers watching
• **Build tension** - Increase conflict and stakes
• **Create hooks** - Strong openings that grab attention
• **Suggest reveals** - Dramatic twists and revelations

What would you like me to focus on?`;
}

// POST /api/ai/script-assist - AI script assistance
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const body = await request.json();
        const { message, context, system_context, genre, history } = body;

        // Determine if this is a micro drama project
        const isMicroDrama = genre?.startsWith('micro-');
        const systemPrompt = system_context || (isMicroDrama ? MICRO_DRAMA_SYSTEM_PROMPT : STANDARD_SYSTEM_PROMPT);

        // Try Python backend first
        try {
            const response = await fetch(`${PYTHON_API_URL}/api/ai/script-assist`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader || '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const result = await response.json();
                return NextResponse.json(result);
            }
        } catch (backendError) {
            console.log('Python backend not available, trying direct AI...');
        }

        // Try OpenAI directly
        if (OPENAI_API_KEY) {
            try {
                const messages = [
                    { role: 'system', content: systemPrompt },
                    ...(history || []),
                    { 
                        role: 'user', 
                        content: context 
                            ? `Context from script:\n"${context}"\n\nRequest: ${message}`
                            : message
                    }
                ];

                const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'gpt-4-turbo-preview',
                        messages,
                        max_tokens: 1500,
                        temperature: 0.7
                    })
                });

                if (openaiResponse.ok) {
                    const data = await openaiResponse.json();
                    return NextResponse.json({
                        response: data.choices[0]?.message?.content || 'No response generated',
                        source: 'openai',
                        model: 'gpt-4-turbo-preview'
                    });
                }
            } catch (openaiError) {
                console.error('OpenAI error:', openaiError);
            }
        }

        // Try Anthropic Claude
        if (ANTHROPIC_API_KEY) {
            try {
                const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'x-api-key': ANTHROPIC_API_KEY,
                        'Content-Type': 'application/json',
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: 'claude-3-sonnet-20240229',
                        max_tokens: 1500,
                        system: systemPrompt,
                        messages: [
                            ...(history || []).map((h: any) => ({
                                role: h.role === 'assistant' ? 'assistant' : 'user',
                                content: h.content
                            })),
                            {
                                role: 'user',
                                content: context 
                                    ? `Context from script:\n"${context}"\n\nRequest: ${message}`
                                    : message
                            }
                        ]
                    })
                });

                if (anthropicResponse.ok) {
                    const data = await anthropicResponse.json();
                    return NextResponse.json({
                        response: data.content[0]?.text || 'No response generated',
                        source: 'anthropic',
                        model: 'claude-3-sonnet'
                    });
                }
            } catch (anthropicError) {
                console.error('Anthropic error:', anthropicError);
            }
        }

        // Fallback to smart template responses
        console.log('Using fallback responses (no AI API available)');
        
        return NextResponse.json({
            response: generateFallbackResponse(message, context),
            source: 'fallback',
            message: 'Using template responses. Set OPENAI_API_KEY or ANTHROPIC_API_KEY for AI-powered assistance.'
        });

    } catch (error) {
        console.error('Error with AI script assist:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: String(error) },
            { status: 500 }
        );
    }
}
